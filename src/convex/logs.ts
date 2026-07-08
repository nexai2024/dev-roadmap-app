import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const create = internalMutation({
  args: {
    message: v.string(),
    stack: v.optional(v.string()),
    context: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("logs", {
      message: args.message,
      stack: args.stack,
      context: args.context,
      timestamp: args.timestamp,
    });
  },
});

export const getLatest = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});
