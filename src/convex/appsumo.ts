import { v } from "convex/values";
import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";
import type { Id } from "./_generated/dataModel";

type DbCtx = Pick<QueryCtx | MutationCtx, "db">;

const appsumoEventValidator = v.union(
  v.literal("purchase"),
  v.literal("activate"),
  v.literal("upgrade"),
  v.literal("downgrade"),
  v.literal("migrate"),
  v.literal("deactivate"),
);

const licenseStatusValidator = v.union(
  v.literal("inactive"),
  v.literal("active"),
  v.literal("deactivated"),
);

const webhookPayloadValidator = v.object({
  license_key: v.string(),
  event: appsumoEventValidator,
  license_status: v.optional(licenseStatusValidator),
  event_timestamp: v.optional(v.number()),
  created_at: v.optional(v.number()),
  tier: v.optional(v.number()),
  test: v.optional(v.boolean()),
  prev_license_key: v.optional(v.string()),
  parent_license_key: v.optional(v.string()),
  partner_plan_name: v.optional(v.string()),
  unit_quantity: v.optional(v.number()),
});

type WebhookPayload = {
  license_key: string;
  event:
    | "purchase"
    | "activate"
    | "upgrade"
    | "downgrade"
    | "migrate"
    | "deactivate";
  license_status?: "inactive" | "active" | "deactivated";
  event_timestamp?: number;
  created_at?: number;
  tier?: number;
  test?: boolean;
  prev_license_key?: string;
  parent_license_key?: string;
  partner_plan_name?: string;
  unit_quantity?: number;
};

function isActiveStatus(
  status: "inactive" | "active" | "deactivated" | undefined,
  event: WebhookPayload["event"],
): boolean {
  // AppSumo sends inactive on activate / active on deactivate until partner returns 200.
  if (event === "activate" || event === "purchase" || event === "upgrade" || event === "downgrade") {
    return event !== "purchase";
  }
  if (event === "deactivate") {
    return false;
  }
  // migrate: keep existing entitlement; parent key changes only
  return status === "active";
}

async function findByLicenseKey(ctx: DbCtx, licenseKey: string) {
  return await ctx.db
    .query("appsumoLicenses")
    .withIndex("by_license_key", (q) => q.eq("licenseKey", licenseKey))
    .unique();
}

async function applyUserEntitlement(
  ctx: MutationCtx,
  userId: Id<"users">,
  args: {
    licenseKey: string;
    tier?: number;
    isPaid: boolean;
  },
) {
  await ctx.db.patch(userId, {
    isPaid: args.isPaid,
    appsumoLicenseKey: args.isPaid ? args.licenseKey : undefined,
    appsumoTier: args.isPaid ? args.tier : undefined,
  });
}

/**
 * Process an AppSumo webhook event. Stores/updates license rows and syncs
 * entitlement for linked users. Test events are acknowledged without writes.
 */
export const processWebhookEvent = internalMutation({
  args: {
    payload: webhookPayloadValidator,
  },
  returns: v.object({
    event: v.string(),
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const payload = args.payload as WebhookPayload;

    if (payload.test === true) {
      return { event: payload.event, success: true };
    }

    const now = Date.now();
    const event = payload.event;

    // --- migrate: parent deal upgraded/downgraded; add-on key stays, parent changes ---
    if (event === "migrate") {
      const existing = await findByLicenseKey(ctx, payload.license_key);
      if (existing) {
        await ctx.db.patch(existing._id, {
          parentLicenseKey: payload.parent_license_key,
          lastEvent: event,
          eventTimestamp: payload.event_timestamp,
          updatedAt: now,
          tier: payload.tier ?? existing.tier,
          partnerPlanName: payload.partner_plan_name ?? existing.partnerPlanName,
          unitQuantity: payload.unit_quantity ?? existing.unitQuantity,
        });
      } else {
        await ctx.db.insert("appsumoLicenses", {
          licenseKey: payload.license_key,
          parentLicenseKey: payload.parent_license_key,
          licenseStatus: payload.license_status ?? "active",
          tier: payload.tier,
          partnerPlanName: payload.partner_plan_name,
          unitQuantity: payload.unit_quantity,
          lastEvent: event,
          eventTimestamp: payload.event_timestamp,
          appsumoCreatedAt: payload.created_at,
          updatedAt: now,
        });
      }
      return { event, success: true };
    }

    // --- upgrade / downgrade: new license_key; old key deactivated separately ---
    if (event === "upgrade" || event === "downgrade") {
      let userId: Id<"users"> | undefined;
      let userEmail: string | undefined;

      if (payload.prev_license_key) {
        const prev = await findByLicenseKey(ctx, payload.prev_license_key);
        if (prev) {
          userId = prev.userId;
          userEmail = prev.userEmail;
          await ctx.db.patch(prev._id, {
            licenseStatus: "deactivated",
            lastEvent: "deactivate",
            updatedAt: now,
          });
        }

        if (!userId) {
          const userByPrev = await ctx.db
            .query("users")
            .withIndex("by_appsumo_license", (q) =>
              q.eq("appsumoLicenseKey", payload.prev_license_key),
            )
            .first();
          if (userByPrev) {
            userId = userByPrev._id;
            userEmail = userByPrev.email;
          }
        }
      }

      const existingNew = await findByLicenseKey(ctx, payload.license_key);
      if (existingNew) {
        await ctx.db.patch(existingNew._id, {
          prevLicenseKey: payload.prev_license_key,
          parentLicenseKey: payload.parent_license_key,
          licenseStatus: "active",
          tier: payload.tier,
          partnerPlanName: payload.partner_plan_name,
          unitQuantity: payload.unit_quantity,
          lastEvent: event,
          eventTimestamp: payload.event_timestamp,
          appsumoCreatedAt: payload.created_at ?? existingNew.appsumoCreatedAt,
          userId: userId ?? existingNew.userId,
          userEmail: userEmail ?? existingNew.userEmail,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("appsumoLicenses", {
          licenseKey: payload.license_key,
          prevLicenseKey: payload.prev_license_key,
          parentLicenseKey: payload.parent_license_key,
          licenseStatus: "active",
          tier: payload.tier,
          partnerPlanName: payload.partner_plan_name,
          unitQuantity: payload.unit_quantity,
          lastEvent: event,
          eventTimestamp: payload.event_timestamp,
          appsumoCreatedAt: payload.created_at,
          userId,
          userEmail,
          updatedAt: now,
        });
      }

      if (userId) {
        await applyUserEntitlement(ctx, userId, {
          licenseKey: payload.license_key,
          tier: payload.tier,
          isPaid: true,
        });
      }

      return { event, success: true };
    }

    // --- purchase / activate / deactivate ---
    const existing = await findByLicenseKey(ctx, payload.license_key);
    const paid = isActiveStatus(payload.license_status, event);
    // After successful activate response AppSumo marks active — we activate locally now.
    const nextStatus: "inactive" | "active" | "deactivated" =
      event === "deactivate"
        ? "deactivated"
        : event === "activate"
          ? "active"
          : (payload.license_status ?? "inactive");

    if (existing) {
      await ctx.db.patch(existing._id, {
        licenseStatus: nextStatus,
        tier: payload.tier ?? existing.tier,
        partnerPlanName: payload.partner_plan_name ?? existing.partnerPlanName,
        unitQuantity: payload.unit_quantity ?? existing.unitQuantity,
        parentLicenseKey: payload.parent_license_key ?? existing.parentLicenseKey,
        lastEvent: event,
        eventTimestamp: payload.event_timestamp,
        appsumoCreatedAt: payload.created_at ?? existing.appsumoCreatedAt,
        updatedAt: now,
      });

      if (existing.userId) {
        await applyUserEntitlement(ctx, existing.userId, {
          licenseKey: payload.license_key,
          tier: payload.tier ?? existing.tier,
          isPaid: event === "deactivate" ? false : paid || event === "activate",
        });
      }
    } else {
      await ctx.db.insert("appsumoLicenses", {
        licenseKey: payload.license_key,
        prevLicenseKey: payload.prev_license_key,
        parentLicenseKey: payload.parent_license_key,
        licenseStatus: nextStatus,
        tier: payload.tier,
        partnerPlanName: payload.partner_plan_name,
        unitQuantity: payload.unit_quantity,
        lastEvent: event,
        eventTimestamp: payload.event_timestamp,
        appsumoCreatedAt: payload.created_at,
        updatedAt: now,
      });
    }

    return { event, success: true };
  },
});

/**
 * Bind an AppSumo license key to the authenticated user after OAuth.
 */
export const bindLicenseToCurrentUser = mutation({
  args: {
    licenseKey: v.string(),
    status: v.optional(licenseStatusValidator),
  },
  returns: v.object({
    success: v.boolean(),
    isPaid: v.boolean(),
    tier: v.optional(v.number()),
    licenseKey: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const license = await findByLicenseKey(ctx, args.licenseKey);
    if (!license) {
      throw new Error(
        "License not found. Wait a moment after purchase, then try again — or contact support with your license key.",
      );
    }

    if (license.licenseStatus === "deactivated") {
      throw new Error("This AppSumo license has been deactivated");
    }

    if (license.userId && license.userId !== user._id) {
      throw new Error("This license is already linked to another account");
    }

    const status = args.status ?? license.licenseStatus;
    const isPaid = status === "active" || status === "inactive";
    // inactive means not yet activated on AppSumo's side during OAuth first visit —
    // still grant access once the customer completes OAuth binding.

    await ctx.db.patch(license._id, {
      userId: user._id,
      userEmail: user.email,
      licenseStatus: status === "inactive" ? "active" : status,
      lastEvent: "activate",
      updatedAt: Date.now(),
    });

    await applyUserEntitlement(ctx, user._id, {
      licenseKey: args.licenseKey,
      tier: license.tier,
      isPaid,
    });

    return {
      success: true,
      isPaid,
      tier: license.tier,
      licenseKey: args.licenseKey,
    };
  },
});

/**
 * Look up the current user's AppSumo license (for Settings / support).
 */
export const myAppsumoLicense = query({
  args: {},
  returns: v.union(
    v.object({
      licenseKey: v.string(),
      licenseStatus: licenseStatusValidator,
      tier: v.optional(v.number()),
      partnerPlanName: v.optional(v.string()),
      lastEvent: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    if (user.appsumoLicenseKey) {
      const byKey = await findByLicenseKey(ctx, user.appsumoLicenseKey);
      if (byKey) {
        return {
          licenseKey: byKey.licenseKey,
          licenseStatus: byKey.licenseStatus,
          tier: byKey.tier,
          partnerPlanName: byKey.partnerPlanName,
          lastEvent: byKey.lastEvent,
        };
      }
    }

    const byUser = await ctx.db
      .query("appsumoLicenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!byUser) return null;

    return {
      licenseKey: byUser.licenseKey,
      licenseStatus: byUser.licenseStatus,
      tier: byUser.tier,
      partnerPlanName: byUser.partnerPlanName,
      lastEvent: byUser.lastEvent,
    };
  },
});

/**
 * Exchange AppSumo OAuth `code` for license_key, then bind to the current user.
 * Requires APPSUMO_CLIENT_ID, APPSUMO_CLIENT_SECRET, and matching redirect URI.
 */
export const completeOAuth = action({
  args: {
    code: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    isPaid: v.boolean(),
    licenseKey: v.string(),
    status: v.string(),
    tier: v.optional(v.number()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    isPaid: boolean;
    licenseKey: string;
    status: string;
    tier?: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clientId = process.env.APPSUMO_CLIENT_ID;
    const clientSecret = process.env.APPSUMO_CLIENT_SECRET;
    const redirectUri = process.env.APPSUMO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        "AppSumo OAuth is not configured. Set APPSUMO_CLIENT_ID, APPSUMO_CLIENT_SECRET, and APPSUMO_REDIRECT_URI.",
      );
    }

    const tokenRes = await fetch("https://appsumo.com/openid/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: args.code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("AppSumo token exchange failed:", tokenRes.status, errText);
      throw new Error(
        "Failed to exchange AppSumo authorization code. It may have expired — restart activation from AppSumo.",
      );
    }

    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

    if (!tokenJson.access_token) {
      throw new Error("AppSumo token response missing access_token");
    }

    const licenseRes = await fetch(
      `https://appsumo.com/openid/license_key/?access_token=${encodeURIComponent(tokenJson.access_token)}`,
    );

    if (!licenseRes.ok) {
      const errText = await licenseRes.text();
      console.error("AppSumo license_key fetch failed:", licenseRes.status, errText);
      throw new Error("Failed to fetch AppSumo license key");
    }

    const licenseJson = (await licenseRes.json()) as {
      license_key?: string;
      status?: string;
    };

    if (!licenseJson.license_key) {
      throw new Error("AppSumo response missing license_key");
    }

    const licenseStatus: "inactive" | "active" | "deactivated" =
      licenseJson.status === "active" ||
      licenseJson.status === "inactive" ||
      licenseJson.status === "deactivated"
        ? licenseJson.status
        : "inactive";

    // Ensure a license row exists (webhook may arrive before or after OAuth)
    await ctx.runMutation(internal.appsumo.ensureLicensePlaceholder, {
      licenseKey: licenseJson.license_key,
      status: licenseStatus,
    });

    const bound: { isPaid: boolean; tier?: number } = await ctx.runMutation(
      internal.appsumo.bindLicenseInternal,
      {
        licenseKey: licenseJson.license_key,
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        status: licenseStatus,
      },
    );

    // Sync Clerk public metadata (same pattern as Stripe webhook)
    if (identity.email && bound.isPaid) {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (secretKey) {
        try {
          const searchRes = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(identity.email)}`,
            { headers: { Authorization: `Bearer ${secretKey}` } },
          );
          if (searchRes.ok) {
            const clerkUsers = (await searchRes.json()) as Array<{ id: string }>;
            const tier = bound.tier ? `appsumo-tier-${bound.tier}` : "appsumo";
            for (const clerkUser of clerkUsers) {
              await fetch(`https://api.clerk.com/v1/users/${clerkUser.id}/metadata`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${secretKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ public_metadata: { tier } }),
              });
            }
          }
        } catch (err) {
          console.error("AppSumo Clerk sync failed:", err);
        }
      }
    }

    return {
      success: true,
      isPaid: bound.isPaid,
      licenseKey: licenseJson.license_key,
      status: licenseJson.status ?? "inactive",
      tier: bound.tier,
    };
  },
});

export const ensureLicensePlaceholder = internalMutation({
  args: {
    licenseKey: v.string(),
    status: licenseStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await findByLicenseKey(ctx, args.licenseKey);
    if (existing) return null;

    await ctx.db.insert("appsumoLicenses", {
      licenseKey: args.licenseKey,
      licenseStatus: args.status,
      lastEvent: "purchase",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const bindLicenseInternal = internalMutation({
  args: {
    licenseKey: v.string(),
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    status: licenseStatusValidator,
  },
  returns: v.object({
    isPaid: v.boolean(),
    tier: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user && args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .first();
    }

    if (!user) {
      throw new Error("User not found — sign in before activating AppSumo");
    }

    const license = await findByLicenseKey(ctx, args.licenseKey);
    if (!license) {
      throw new Error("License not found");
    }

    if (license.licenseStatus === "deactivated" || args.status === "deactivated") {
      await applyUserEntitlement(ctx, user._id, {
        licenseKey: args.licenseKey,
        tier: license.tier,
        isPaid: false,
      });
      await ctx.db.patch(license._id, {
        userId: user._id,
        userEmail: user.email,
        licenseStatus: "deactivated",
        lastEvent: "deactivate",
        updatedAt: Date.now(),
      });
      return { isPaid: false, tier: license.tier };
    }

    if (license.userId && license.userId !== user._id) {
      throw new Error("This license is already linked to another account");
    }

    await ctx.db.patch(license._id, {
      userId: user._id,
      userEmail: user.email,
      licenseStatus: "active",
      lastEvent: "activate",
      updatedAt: Date.now(),
    });

    await applyUserEntitlement(ctx, user._id, {
      licenseKey: args.licenseKey,
      tier: license.tier,
      isPaid: true,
    });

    return { isPaid: true, tier: license.tier };
  },
});
