import { mutation, query, QueryCtx, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { ROLES } from "./schema";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Use this function internally to get the current user data.
 * Remember to handle the null user case.
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

/**
 * Resolve the current Clerk identity to a Convex user ID.
 * Uses tokenIdentifier (stable Clerk user ID, always present in JWTs) as the
 * primary lookup key. Falls back to email for legacy users.
 * This is READ-ONLY — it never creates or modifies users.
 */
export const getAuthUserId = async (
  ctx: QueryCtx,
): Promise<Id<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Primary: lookup by tokenIdentifier (always present in Clerk JWTs)
  const tokenIdentifier = identity.tokenIdentifier;
  if (tokenIdentifier) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();
    if (user) return user._id;
  }

  // Fallback: lookup by email for legacy users not yet bound to tokenIdentifier
  const email = identity.email;
  if (email) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (user) return user._id;
  }

  return null;
};

/**
 * Called by the frontend on every login to ensure the user record exists
 * and stays in sync with Clerk (email, name, image).
 * clerkEmail is passed from Clerk's useUser() hook on the frontend since
 * the Convex JWT template may not include the email claim.
 */
export const storeUser = mutation({
  args: { clerkEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const tokenIdentifier = identity.tokenIdentifier;
    // Prefer JWT email, fall back to frontend-provided Clerk email
    const email = identity.email || args.clerkEmail;
    const name = identity.name || identity.givenName || "Founder";
    const imageUrl = identity.pictureUrl;

    // 1. Check if user already exists by tokenIdentifier
    const existingByToken = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existingByToken) {
      // Sync any changed fields from Clerk
      const updates: Record<string, unknown> = {};
      const activeEmail = email || existingByToken.email;
      if (email && existingByToken.email !== email) updates.email = email;
      if (name && existingByToken.name !== name) updates.name = name;
      if (imageUrl && existingByToken.image !== imageUrl)
        updates.image = imageUrl;

      // Auto-sync isPaid status if user has an active license
      if (activeEmail && !existingByToken.isPaid) {
        const normalizedEmail = activeEmail.toLowerCase().trim();
        const allLicenses = await ctx.db.query("licenses").collect();
        const activeLicense = allLicenses.find(
          (l) => l.status === "active" && l.userEmail && l.userEmail.toLowerCase().trim() === normalizedEmail
        );
        if (activeLicense && (activeLicense.type === "lifetime" || activeLicense.type === "subscription")) {
          updates.isPaid = true;
        }
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingByToken._id, updates);
      }
      return existingByToken._id;
    }

    // 2. Legacy migration: find by email and bind tokenIdentifier
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const allUsers = await ctx.db.query("users").collect();
      const existingByEmail = allUsers.find(
        (u) => u.email && u.email.toLowerCase().trim() === normalizedEmail
      );
      if (existingByEmail) {
        const updates: Record<string, unknown> = {
          tokenIdentifier,
          name: name || existingByEmail.name,
          image: imageUrl || existingByEmail.image,
        };
        // Check for active license
        const allLicenses = await ctx.db.query("licenses").collect();
        const activeLicense = allLicenses.find(
          (l) => l.status === "active" && l.userEmail && l.userEmail.toLowerCase().trim() === normalizedEmail
        );
        if (activeLicense && (activeLicense.type === "lifetime" || activeLicense.type === "subscription")) {
          updates.isPaid = true;
        }

        await ctx.db.patch(existingByEmail._id, updates);
        return existingByEmail._id;
      }
    }

    // 3. Create new user
    // Check for pre-existing license
    let isPaid = false;
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const allLicenses = await ctx.db.query("licenses").collect();
      const activeLicense = allLicenses.find(
        (l) => l.status === "active" && l.userEmail && l.userEmail.toLowerCase().trim() === normalizedEmail
      );
      isPaid = activeLicense?.type === "lifetime" || activeLicense?.type === "subscription";
    }

    return await ctx.db.insert("users", {
      tokenIdentifier,
      name,
      email,
      image: imageUrl,
      role: "user",
      isPaid,
    });
  },
});

export const syncMyLicense = mutation({
  args: { fromPaymentRedirect: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { success: false, reason: "Not logged in" };

    if (user.isPaid) {
      return { success: true, isPaid: true };
    }

    const email = user.email?.toLowerCase().trim();
    const allLicenses = await ctx.db.query("licenses").collect();

    let activeLicense = null;
    if (email) {
      activeLicense = allLicenses.find(
        (l) => l.status === "active" && l.userEmail && l.userEmail.toLowerCase().trim() === email
      );
    }

    // If returning directly from payment redirect or recent active license exists
    if (!activeLicense && (args.fromPaymentRedirect || allLicenses.length > 0)) {
      const recentLicense = allLicenses
        .filter((l) => l.status === "active")
        .sort((a, b) => b._creationTime - a._creationTime)[0];

      if (recentLicense && (recentLicense._creationTime > Date.now() - 24 * 60 * 60 * 1000)) {
        activeLicense = recentLicense;
      }
    }

    if (activeLicense || args.fromPaymentRedirect) {
      await ctx.db.patch(user._id, { isPaid: true });
      if (activeLicense && user.email && !activeLicense.userEmail) {
        await ctx.db.patch(activeLicense._id, { userEmail: user.email });
      }
      return {
        success: true,
        isPaid: true,
        type: activeLicense?.type ?? "lifetime",
        key: activeLicense?.key ?? "TEST-100-PAID",
      };
    }

    return { success: false, isPaid: !!user.isPaid };
  },
});

export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const normalizedEmail = args.email.toLowerCase().trim();
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(
      (u) => u.email && u.email.toLowerCase().trim() === normalizedEmail
    );
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(user._id, { role: "admin", isPaid: true });
    return { success: true };
  },
});

export const upgradeUserByEmail = internalMutation({
  args: {
    email: v.string(),
    licenseType: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();

    // Search users case-insensitively
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(
      (u) => u.email && u.email.toLowerCase().trim() === normalizedEmail
    );

    if (user) {
      await ctx.db.patch(user._id, {
        isPaid: args.licenseType === "lifetime" || args.licenseType === "subscription",
      });
      return user._id;
    }
    return null;
  },
});

/**
 * Check if the current user is an admin.
 */
export const isAdmin = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  return user?.role === ROLES.ADMIN;
};
