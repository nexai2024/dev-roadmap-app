import { v } from "convex/values";
import { query } from "./_generated/server";
import { ROLES } from "./schema";
import { EARLY_BIRD_SPOT_CAP } from "./lifetimeOffer";

const inventoryValidator = v.object({
  claimed: v.number(),
  cap: v.number(),
  remaining: v.number(),
});

/**
 * Public inventory for the early-bird lifetime cap.
 * Counts non-admin paid users, capped at the first 100 licenses.
 */
export const earlyBirdInventory = query({
  args: {},
  returns: inventoryValidator,
  handler: async (ctx) => {
    const paid = await ctx.db
      .query("users")
      .withIndex("by_paid", (q) => q.eq("isPaid", true))
      .take(EARLY_BIRD_SPOT_CAP + 25);

    const claimed = Math.min(
      EARLY_BIRD_SPOT_CAP,
      paid.filter((user) => user.role !== ROLES.ADMIN).length,
    );

    return {
      claimed,
      cap: EARLY_BIRD_SPOT_CAP,
      remaining: Math.max(0, EARLY_BIRD_SPOT_CAP - claimed),
    };
  },
});
