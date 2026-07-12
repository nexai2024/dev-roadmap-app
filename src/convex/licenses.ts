import { v } from "convex/values";
import { mutation, query, internalMutation, action, internalAction } from "./_generated/server";
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
    userEmail: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const licenseId = await ctx.db.insert("licenses", {
      key: args.key,
      type: args.type,
      status: "active",
      userEmail: args.userEmail,
      expiresAt: args.expiresAt,
    });
    return licenseId;
  },
});

export const generateAndSend = internalAction({
  args: {
    userEmail: v.string(),
    type: v.union(v.literal("trial"), v.literal("subscription"), v.literal("lifetime")),
  },
  handler: async (ctx, args) => {
    const key = generateKey();

    let expiresAt: number | undefined;
    const now = Date.now();
    if (args.type === "trial") {
      expiresAt = now + 14 * 24 * 60 * 60 * 1000; // 14 days
    } else if (args.type === "subscription") {
      expiresAt = now + 365 * 24 * 60 * 60 * 1000; // 1 year
    }

    await ctx.runMutation(internal.licenses.createInternal, {
      key,
      type: args.type,
      userEmail: args.userEmail,
      expiresAt,
    });

    // Send email via vly.ai email service
    try {
      await axios.post(
        "https://email.vly.ai/send_otp",
        {
          to: args.userEmail,
          otp: key, // Using the key as the "OTP" in this template for delivery
          appName: process.env.VLY_APP_NAME || "a vly.ai application",
          subject: "Your License Key", // Assuming the service might support custom subjects or we use the OTP one
        },
        {
          headers: {
            "x-api-key": "vlytothemoon2025",
          },
        },
      );
    } catch (error) {
      console.error("Failed to send license email", error);
    }

    return { success: true, key };
  },
});

export const activate = mutation({
  args: {
    key: v.string(),
    hardwareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Resolve authenticated user from Convex DB (not raw JWT claims)
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
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

    if (license.expiresAt && license.expiresAt < Date.now()) {
      await ctx.db.patch(license._id, { status: "expired" });
      throw new Error("License has expired");
    }

    if (license.hardwareId && license.hardwareId !== args.hardwareId) {
      throw new Error("License is already bound to another device");
    }

    // Bind to hardware + associate with this user's email
    const patchData: Record<string, unknown> = {};
    if (!license.hardwareId) {
      patchData.hardwareId = args.hardwareId;
      patchData.activatedAt = Date.now();
    }
    if (user.email && license.userEmail !== user.email) {
      patchData.userEmail = user.email;
    }
    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(license._id, patchData);
    }

    // Sync isPaid status for lifetime licenses
    if (license.type === "lifetime" && !user.isPaid) {
      await ctx.db.patch(user._id, { isPaid: true });
    }

    return { success: true, type: license.type };
  },
});

export const validate = query({
  args: {
    key: v.string(),
    hardwareId: v.string(),
  },
  handler: async (ctx, args) => {
    const license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!license) {
      return { valid: false, reason: "License not found" };
    }

    if (license.status !== "active") {
      return { valid: false, reason: `License is ${license.status}` };
    }

    if (license.expiresAt && license.expiresAt < Date.now()) {
      return { valid: false, reason: "License has expired" };
    }

    if (license.hardwareId !== args.hardwareId) {
      return { valid: false, reason: "Hardware ID mismatch" };
    }

    return { valid: true, type: license.type, expiresAt: license.expiresAt };
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
    userEmail: v.string(),
    type: v.union(v.literal("trial"), v.literal("subscription"), v.literal("lifetime")),
    expiresAt: v.optional(v.number()),
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
      userEmail: args.userEmail,
      expiresAt: args.expiresAt,
    });

    // Automatically set isPaid for lifetime licenses
    if (args.type === "lifetime") {
      const customerUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.userEmail))
        .first();
      if (customerUser) {
        await ctx.db.patch(customerUser._id, { isPaid: true });
      }
    }

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

    // Remove isPaid status if revoking a lifetime license
    if (license.type === "lifetime") {
      const customerUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", license.userEmail))
        .first();
      if (customerUser) {
        await ctx.db.patch(customerUser._id, { isPaid: false });
      }
    }

    return { success: true };
  },
});
