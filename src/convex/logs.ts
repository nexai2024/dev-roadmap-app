import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { isAdmin } from "./users";

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
  returns: v.array(
    v.object({
      _id: v.id("logs"),
      _creationTime: v.number(),
      message: v.string(),
      stack: v.optional(v.string()),
      context: v.optional(v.string()),
      timestamp: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    // No UI calls this. Return empty for non-admins so we never throw in prod.
    if (!(await isAdmin(ctx))) {
      return [];
    }
    return await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});
