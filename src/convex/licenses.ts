import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { isAdmin, getCurrentUser } from "./users";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import axios from "axios";

// Helper to generate a license key: XXXX-XXXX-XXXX-XXXX
function generateKey() {
  const random: RandomReader = {
    read(bytes: Uint8Array) {
      crypto.getRandomValues(bytes);
    },
  };
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoiding ambiguous characters
  const part1 = generateRandomString(random, alphabet, 4);
  const part2 = generateRandomString(random, alphabet, 4);
  const part3 = generateRandomString(random, alphabet, 4);
  const part4 = generateRandomString(random, alphabet, 4);
  return `${part1}-${part2}-${part3}-${part4}`;
}

export const createInternal = internalMutation({
  args: {
    key: v.string(),
    type: v.union(v.literal("trial"), v.literal("subscription"), v.literal("lifetime")),
  },
  handler: async (ctx, args) => {
    const licenseId = await ctx.db.insert("licenses", {
      key: args.key,
      type: args.type,
      status: "active",
    });
    return licenseId;
  },
});

export const activate = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // Resolve authenticated user from Convex DB (not raw JWT claims)
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // const cleanKey = args.key.trim().toUpperCase();
    // if (
    //   cleanKey === "TEST-100-PAID" ||
    //   cleanKey === "PROTOCOL100-LIFETIME" ||
    //   cleanKey === "PAYMENT-SUCCESS" ||
    //   cleanKey === "UNLOCK-FULL-PROTOCOL"
    // ) {
    //   await ctx.db.patch(user._id, { isPaid: true });
    //   return { success: true, type: "lifetime" };
    // }

    // AppSumo UUID keys (RFC 4122) — bind if webhook already stored the license
    const rawKey = args.key.trim();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        rawKey,
      );
    if (isUuid) {
      const appsumoLicense = await ctx.db
        .query("appsumoLicenses")
        .withIndex("by_license_key", (q) => q.eq("licenseKey", rawKey))
        .unique();

      if (!appsumoLicense) {
        throw new Error(
          "AppSumo license not found yet. Activate via AppSumo OAuth, or wait for the purchase webhook and try again.",
        );
      }
      if (appsumoLicense.licenseStatus === "deactivated") {
        throw new Error("This AppSumo license has been deactivated");
      }
      if (appsumoLicense.userId && appsumoLicense.userId !== user._id) {
        throw new Error("This license is already linked to another account");
      }

      await ctx.db.patch(appsumoLicense._id, {
        userId: user._id,
        userEmail: user.email,
        licenseStatus: "active",
        lastEvent: "activate",
        updatedAt: Date.now(),
      });
      await ctx.db.patch(user._id, {
        isPaid: true,
        appsumoLicenseKey: rawKey,
        appsumoTier: appsumoLicense.tier,
      });
      return { success: true, type: "lifetime" };
    }

    const license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!license) {
      throw new Error("License key not found");
    }

    if (license.status !== "active") {
      throw new Error(`License is ${license.status}`);
    }

    // Mark as redeemed
    await ctx.db.patch(license._id, {
      status: "redeemed",
      redeemedBy: user._id
    });

    // Set user as paid
    if (!user.isPaid) {
      await ctx.db.patch(user._id, { isPaid: true });
    }

    return { success: true, type: license.type };
  },
});

export const revoke = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!license) {
      throw new Error("License not found");
    }

    await ctx.db.patch(license._id, { status: "revoked" });
    return { success: true };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }
    return await ctx.db.query("licenses").collect();
  },
});

export const adminCreateLicense = mutation({
  args: {
    type: v.union(v.literal("trial"), v.literal("subscription"), v.literal("lifetime")),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const key = generateKey();
    const licenseId = await ctx.db.insert("licenses", {
      key,
      type: args.type,
      status: "active",
    });

    return { success: true, key, licenseId };
  },
});

export const adminRevokeLicense = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!license) {
      throw new Error("License not found");
    }

    await ctx.db.patch(license._id, { status: "revoked" });

    // Remove isPaid status if revoking a lifetime license and it was redeemed
    if (license.type === "lifetime" && license.redeemedBy) {
      const customerUser = await ctx.db.get(license.redeemedBy as import("./_generated/dataModel").Id<"users">);
      if (customerUser) {
        await ctx.db.patch(customerUser._id, { isPaid: false });
      }
    }

    return { success: true };
  },
});
