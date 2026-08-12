import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 800;

/**
 * Public tallies for static roadmap items + which ones the current user voted for.
 */
export const voteSummary = query({
  args: {},
  returns: v.object({
    roadmapVotes: v.array(
      v.object({
        id: v.string(),
        count: v.number(),
      }),
    ),
    myRoadmapVotes: v.array(v.string()),
    myRequestVotes: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const allVotes = await ctx.db.query("featureVotes").collect();
    const counts = new Map<string, number>();
    for (const vote of allVotes) {
      if (vote.targetType !== "roadmap") continue;
      counts.set(vote.targetId, (counts.get(vote.targetId) ?? 0) + 1);
    }

    const user = await getCurrentUser(ctx);
    const myRoadmapVotes: string[] = [];
    const myRequestVotes: string[] = [];
    if (user) {
      for (const vote of allVotes) {
        if (vote.userId !== user._id) continue;
        if (vote.targetType === "roadmap") myRoadmapVotes.push(vote.targetId);
        else myRequestVotes.push(vote.targetId);
      }
    }

    return {
      roadmapVotes: Array.from(counts.entries()).map(([id, count]) => ({
        id,
        count,
      })),
      myRoadmapVotes,
      myRequestVotes,
    };
  },
});

/**
 * Open community feature requests, sorted by votes.
 */
export const listRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("featureRequests"),
      title: v.string(),
      description: v.string(),
      voteCount: v.number(),
      status: v.union(
        v.literal("open"),
        v.literal("accepted"),
        v.literal("declined"),
      ),
      createdAt: v.number(),
      isMine: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const open = await ctx.db
      .query("featureRequests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    return open
      .map((req) => ({
        _id: req._id,
        title: req.title,
        description: req.description,
        voteCount: req.voteCount,
        status: req.status,
        createdAt: req.createdAt,
        isMine: user ? req.userId === user._id : false,
      }))
      .sort((a, b) => b.voteCount - a.voteCount || b.createdAt - a.createdAt);
  },
});

/**
 * Toggle a vote on a static roadmap item (planned / exploring).
 */
export const toggleRoadmapVote = mutation({
  args: {
    roadmapItemId: v.string(),
  },
  returns: v.object({
    voted: v.boolean(),
    voteCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in to vote on the roadmap");

    const roadmapItemId = args.roadmapItemId.trim();
    if (!roadmapItemId || roadmapItemId.length > 64) {
      throw new Error("Invalid roadmap item");
    }

    const existing = await ctx.db
      .query("featureVotes")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", user._id)
          .eq("targetType", "roadmap")
          .eq("targetId", roadmapItemId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("featureVotes", {
        targetType: "roadmap",
        targetId: roadmapItemId,
        userId: user._id,
        createdAt: Date.now(),
      });
    }

    const votes = await ctx.db
      .query("featureVotes")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "roadmap").eq("targetId", roadmapItemId),
      )
      .collect();

    return { voted: !existing, voteCount: votes.length };
  },
});

/**
 * Toggle a vote on a community feature request.
 */
export const toggleRequestVote = mutation({
  args: {
    requestId: v.id("featureRequests"),
  },
  returns: v.object({
    voted: v.boolean(),
    voteCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in to vote");

    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "open") {
      throw new Error("Feature request not found");
    }

    const targetId = args.requestId;
    const existing = await ctx.db
      .query("featureVotes")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", user._id)
          .eq("targetType", "request")
          .eq("targetId", targetId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      const nextCount = Math.max(0, request.voteCount - 1);
      await ctx.db.patch(request._id, { voteCount: nextCount });
      return { voted: false, voteCount: nextCount };
    }

    await ctx.db.insert("featureVotes", {
      targetType: "request",
      targetId,
      userId: user._id,
      createdAt: Date.now(),
    });
    const nextCount = request.voteCount + 1;
    await ctx.db.patch(request._id, { voteCount: nextCount });
    return { voted: true, voteCount: nextCount };
  },
});

/**
 * Submit a new community feature request (auto +1 from submitter).
 */
export const submitRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  returns: v.object({
    requestId: v.id("featureRequests"),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in to request a feature");

    const title = args.title.trim();
    const description = args.description.trim();

    if (title.length < 4) throw new Error("Title must be at least 4 characters");
    if (title.length > MAX_TITLE) {
      throw new Error(`Title must be under ${MAX_TITLE} characters`);
    }
    if (description.length < 10) {
      throw new Error("Add a bit more detail (at least 10 characters)");
    }
    if (description.length > MAX_DESCRIPTION) {
      throw new Error(`Description must be under ${MAX_DESCRIPTION} characters`);
    }

    // Soft rate limit: max 5 open requests per user
    const mine = await ctx.db
      .query("featureRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const openMine = mine.filter((r) => r.status === "open");
    if (openMine.length >= 5) {
      throw new Error("You already have 5 open requests — vote on existing ones instead");
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("featureRequests", {
      title,
      description,
      userId: user._id,
      userEmail: user.email,
      status: "open",
      voteCount: 1,
      createdAt: now,
    });

    await ctx.db.insert("featureVotes", {
      targetType: "request",
      targetId: requestId,
      userId: user._id,
      createdAt: now,
    });

    return { requestId };
  },
});
