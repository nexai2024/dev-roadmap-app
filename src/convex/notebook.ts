// Convex queries and mutations for the Indie Dev Boss Protocol notebook

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

// =============================================
// PROFILE
// =============================================

export const currentProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      displayName: v.optional(v.string()),
      startedAt: v.optional(v.number()),
      currentPhase: v.optional(v.string()),
      currentDay: v.optional(v.number()),
      bio: v.optional(v.string()),
      twitterHandle: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      startedAt: user.startedAt,
      currentPhase: user.currentPhase,
      currentDay: user.currentDay,
      bio: user.bio,
      twitterHandle: user.twitterHandle,
    };
  },
});

export const completeSetup = mutation({
  args: {
    displayName: v.string(),
    startedAt: v.number(),
    currentPhase: v.string(),
    currentDay: v.number(),
    bio: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) throw new Error("No user record found");
    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      startedAt: args.startedAt,
      currentPhase: args.currentPhase,
      currentDay: args.currentDay,
      bio: args.bio,
      twitterHandle: args.twitterHandle,
    });
    return null;
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
    currentPhase: v.optional(v.string()),
    currentDay: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) throw new Error("No user record found");
    const { displayName, bio, twitterHandle, currentPhase, currentDay } = args;
    await ctx.db.patch(user._id, {
      displayName: displayName ?? undefined,
      bio: bio ?? undefined,
      twitterHandle: twitterHandle ?? undefined,
      currentPhase: currentPhase ?? undefined,
      currentDay: currentDay ?? undefined,
    });
    return null;
  },
});

// =============================================
// DAILY LOGS
// =============================================

export const todayLog = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("dailyLogs"),
      date: v.string(),
      phaseId: v.string(),
      hoursCoded: v.number(),
      commits: v.number(),
      shippedUrl: v.optional(v.string()),
      bipPostUrl: v.optional(v.string()),
      customersContacted: v.number(),
      mrrUsd: v.number(),
      notes: v.optional(v.string()),
      inputsDone: v.array(v.string()),
      shippedNote: v.optional(v.string()),
      mood: v.optional(
        v.union(
          v.literal("locked-in"),
          v.literal("shipping"),
          v.literal("stuck"),
          v.literal("shipping-slow"),
        ),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) return null;
    const date = new Date().toISOString().slice(0, 10);
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", date),
      )
      .first();
  },
});

export const listLogs = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("dailyLogs"),
      _creationTime: v.number(),
      date: v.string(),
      phaseId: v.string(),
      hoursCoded: v.number(),
      commits: v.number(),
      shippedUrl: v.optional(v.string()),
      bipPostUrl: v.optional(v.string()),
      customersContacted: v.number(),
      mrrUsd: v.number(),
      notes: v.optional(v.string()),
      inputsDone: v.array(v.string()),
      shippedNote: v.optional(v.string()),
      mood: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) return [];
    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 200);
    return logs.map((l) => ({
      _id: l._id,
      _creationTime: l._creationTime,
      date: l.date,
      phaseId: l.phaseId,
      hoursCoded: l.hoursCoded,
      commits: l.commits,
      shippedUrl: l.shippedUrl,
      bipPostUrl: l.bipPostUrl,
      customersContacted: l.customersContacted,
      mrrUsd: l.mrrUsd,
      notes: l.notes,
      inputsDone: l.inputsDone,
      shippedNote: l.shippedNote,
      mood: l.mood,
    }));
  },
});

export const upsertLog = mutation({
  args: {
    date: v.string(),
    phaseId: v.string(),
    hoursCoded: v.number(),
    commits: v.number(),
    shippedUrl: v.optional(v.string()),
    bipPostUrl: v.optional(v.string()),
    customersContacted: v.number(),
    mrrUsd: v.number(),
    notes: v.optional(v.string()),
    inputsDone: v.array(v.string()),
    shippedNote: v.optional(v.string()),
    mood: v.optional(
      v.union(
        v.literal("locked-in"),
        v.literal("shipping"),
        v.literal("stuck"),
        v.literal("shipping-slow"),
      ),
    ),
  },
  returns: v.id("dailyLogs"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) throw new Error("No user record found");

    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        phaseId: args.phaseId,
        hoursCoded: args.hoursCoded,
        commits: args.commits,
        shippedUrl: args.shippedUrl,
        bipPostUrl: args.bipPostUrl,
        customersContacted: args.customersContacted,
        mrrUsd: args.mrrUsd,
        notes: args.notes,
        inputsDone: args.inputsDone,
        shippedNote: args.shippedNote,
        mood: args.mood,
      });
      return existing._id;
    }

    return await ctx.db.insert("dailyLogs", {
      userId: user._id,
      ...args,
    });
  },
});

export const deleteLog = mutation({
  args: { id: v.id("dailyLogs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log) return null;
    // ownership check
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user || log.userId !== user._id) throw new Error("Forbidden");
    await ctx.db.delete(args.id);
    return null;
  },
});

// =============================================
// KEY ACTION PROGRESS
// =============================================

export const allActionProgress = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("keyActionProgress"),
      actionId: v.string(),
      status: v.string(),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      proofUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) return [];
    const rows = await ctx.db
      .query("keyActionProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(50);
    return rows.map((r) => ({
      _id: r._id,
      actionId: r.actionId,
      status: r.status,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      proofUrl: r.proofUrl,
      notes: r.notes,
    }));
  },
});

export const setActionStatus = mutation({
  args: {
    actionId: v.string(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    proofUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("keyActionProgress"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) throw new Error("No user record found");

    const existing = await ctx.db
      .query("keyActionProgress")
      .withIndex("by_user_action", (q) =>
        q.eq("userId", user._id).eq("actionId", args.actionId),
      )
      .first();

    const now = Date.now();
    const startedAt =
      args.status === "not_started"
        ? undefined
        : existing?.startedAt ?? now;
    const completedAt = args.status === "completed" ? now : existing?.completedAt;

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        startedAt,
        completedAt,
        proofUrl: args.proofUrl,
        notes: args.notes,
      });
      return existing._id;
    }

    return await ctx.db.insert("keyActionProgress", {
      userId: user._id,
      actionId: args.actionId,
      status: args.status,
      startedAt,
      completedAt,
      proofUrl: args.proofUrl,
      notes: args.notes,
    });
  },
});

// =============================================
// WEEKLY REVIEWS
// =============================================

export const listReviews = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("weeklyReviews"),
      _creationTime: v.number(),
      weekStartDate: v.string(),
      hoursCoded: v.number(),
      weeksSinceLastDeploy: v.number(),
      mrrWeek: v.number(),
      mrrLastWeek: v.number(),
      summary: v.string(),
      publishedUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) return [];
    const rows = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(60);
    return rows.map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      weekStartDate: r.weekStartDate,
      hoursCoded: r.hoursCoded,
      weeksSinceLastDeploy: r.weeksSinceLastDeploy,
      mrrWeek: r.mrrWeek,
      mrrLastWeek: r.mrrLastWeek,
      summary: r.summary,
      publishedUrl: r.publishedUrl,
      notes: r.notes,
    }));
  },
});

export const createReview = mutation({
  args: {
    weekStartDate: v.string(),
    hoursCoded: v.number(),
    weeksSinceLastDeploy: v.number(),
    mrrWeek: v.number(),
    mrrLastWeek: v.number(),
    summary: v.string(),
    publishedUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("weeklyReviews"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) throw new Error("No user record found");
    return await ctx.db.insert("weeklyReviews", {
      userId: user._id,
      ...args,
    });
  },
});

export const deleteReview = mutation({
  args: { id: v.id("weeklyReviews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user || row.userId !== user._id) throw new Error("Forbidden");
    await ctx.db.delete(args.id);
    return null;
  },
});

// =============================================
// AGGREGATES for dashboard KPIs
// =============================================

export const aggregateStats = query({
  args: {},
  returns: v.object({
    totalCommits: v.number(),
    totalHours: v.number(),
    totalMRR: v.number(),
    daysLogged: v.number(),
    streakDays: v.number(),
    weeksTracked: v.number(),
    lastShippedAt: v.union(v.string(), v.null()),
    actionsCompleted: v.number(),
    actionsInProgress: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalCommits: 0,
        totalHours: 0,
        totalMRR: 0,
        daysLogged: 0,
        streakDays: 0,
        weeksTracked: 0,
        lastShippedAt: null,
        actionsCompleted: 0,
        actionsInProgress: 0,
      };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email ?? ""))
      .first();
    if (!user) {
      return {
        totalCommits: 0,
        totalHours: 0,
        totalMRR: 0,
        daysLogged: 0,
        streakDays: 0,
        weeksTracked: 0,
        lastShippedAt: null,
        actionsCompleted: 0,
        actionsInProgress: 0,
      };
    }

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const reviews = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const actions = await ctx.db
      .query("keyActionProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalCommits = logs.reduce((s, l) => s + l.commits, 0);
    const totalHours = logs.reduce((s, l) => s + l.hoursCoded, 0);
    const totalMRR = logs.length ? Math.max(...logs.map((l) => l.mrrUsd)) : 0;
    const daysLogged = logs.length;
    const weeksTracked = reviews.length;
    const actionsCompleted = actions.filter((a) => a.status === "completed").length;
    const actionsInProgress = actions.filter((a) => a.status === "in_progress").length;

    // streak: walk back from latest log date, count consecutive days
    const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
    let streakDays = 0;
    const now = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(now);
      expected.setDate(now.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (sorted[i]?.date === expectedStr) {
        streakDays++;
      } else if (i === 0) {
        // allow yesterday as anchor (someone who shipped yesterday but not yet today)
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        const yestStr = yest.toISOString().slice(0, 10);
        if (sorted[0]?.date === yestStr) {
          streakDays = 1;
          for (let j = 1; j < sorted.length; j++) {
            const expected2 = new Date(now);
            expected2.setDate(now.getDate() - 1 - j);
            if (sorted[j]?.date === expected2.toISOString().slice(0, 10)) {
              streakDays++;
            } else {
              break;
            }
          }
        }
        break;
      } else {
        break;
      }
    }

    // last shipped day = latest log with shippedUrl or shippedNote or > 0 commits
    const lastShip = sorted.find(
      (l) => l.shippedUrl || l.shippedNote || l.commits > 0,
    );

    return {
      totalCommits,
      totalHours,
      totalMRR,
      daysLogged,
      streakDays,
      weeksTracked,
      lastShippedAt: lastShip ? lastShip.date : null,
      actionsCompleted,
      actionsInProgress,
    };
  },
});
