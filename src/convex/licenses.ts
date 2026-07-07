import { v } from "convex/values";
import { mutation, query, internalMutation, action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { isAdmin } from "./users";
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

    if (!license.hardwareId) {
      await ctx.db.patch(license._id, {
        hardwareId: args.hardwareId,
        activatedAt: Date.now(),
      });
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
