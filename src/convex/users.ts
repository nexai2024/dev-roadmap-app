import { mutation, query, QueryCtx, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { ROLES } from "./schema";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const getAuthUserId = async (ctx: QueryCtx): Promise<Id<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }

  const email = identity.email;
  if (email) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (user) {
      return user._id;
    }

    // Auto-create user if they don't exist yet
    if ("insert" in ctx.db) {
      // Check if they already have an active lifetime license
      const activeLicense = await ctx.db
        .query("licenses")
        .withIndex("by_user_email", (q) => q.eq("userEmail", email))
        .filter((q) => q.eq("status", "active"))
        .first();
      const isPaid = activeLicense ? activeLicense.type === "lifetime" : false;

      const userId = await (ctx.db as any).insert("users", {
        name: identity.name || identity.givenName || "Founder",
        email: email,
        image: identity.pictureUrl,
        role: "user",
        isPaid: isPaid,
      });
      return userId;
    }
  }
  return null;
};

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true };
  },
});

export const upgradeUserByEmail = internalMutation({
  args: {
    email: v.string(),
    licenseType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isPaid: args.licenseType === "lifetime",
      });
      return user._id;
    }
    return null;
  },
});
/**
 * Check if the current user is an admin.
 * @param ctx
 * @returns boolean
 */
export const isAdmin = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  return user?.role === ROLES.ADMIN;
};
