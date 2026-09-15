// Convex queries and mutations for the Protocol100 notebook

import { mutation, query, internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./users";
import { isAdmin } from "./users";
import { api } from "./_generated/api";
import { vly } from "../lib/vly-integrations";

/** Convex return validators reject explicit `undefined` on optional fields. */
function omitUndefined<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined),
  ) as T;
}

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
      isPaid: v.optional(v.boolean()),
      licenseType: v.optional(v.string()),
      accountabilityEnabled: v.optional(v.boolean()),
      remindersEnabled: v.optional(v.boolean()),
      suggestedDay: v.optional(v.number()),
      lastReminderSentAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    let licenseType = "free";

    if (user.isPaid) {
      licenseType = "lifetime";
    }

    const isPaid = !!(user.isPaid || licenseType === "lifetime" || licenseType === "subscription");

    // Calculate suggestedDay: the day after the latest logged day.
    let suggestedDay = 1;
    if (user.startedAt) {
      // Only fetch the latest log instead of all logs
      const latestLog = await ctx.db
        .query("dailyLogs")
        .withIndex("by_user_date", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      if (latestLog) {
        const start = new Date(user.startedAt);
        const logDate = new Date(latestLog.date);
        const diff = Math.floor(
          (logDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        const dayNum = Math.max(1, diff + 1);
        suggestedDay = Math.min(100, dayNum + 1);
      }
    }

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
      isPaid,
      licenseType,
      accountabilityEnabled: user.accountabilityEnabled,
      remindersEnabled: user.remindersEnabled,
      suggestedDay,
      lastReminderSentAt: user.lastReminderSentAt,
    };
  },
});

export const unlockProtocol = mutation({
  args: { userId: v.optional(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Only admins can unlock the protocol manually via this mutation
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const targetUserId = args.userId ?? currentUserId;
    const user = await ctx.db.get(targetUserId);
    if (!user) throw new Error("No user record found");

    await ctx.db.patch(user._id, { isPaid: true });
    return null;
  },
});

export const internalUnlockProtocol = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isPaid: true });
  },
});

export const aggregateMonthStats = query({
  args: { month: v.string() }, // YYYY-MM
  returns: v.object({
    hours: v.number(),
    commits: v.number(),
    mrr: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { hours: 0, commits: 0, mrr: 0 };
    const user = await ctx.db.get(userId);
    if (!user) return { hours: 0, commits: 0, mrr: 0 };

    const startOfMonth = `${args.month}-01`;
    const endOfMonth = `${args.month}-31`;

    const monthLogs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", startOfMonth).lte("date", endOfMonth),
      )
      .collect();
    return {
      hours: monthLogs.reduce((s, l) => s + l.hoursCoded, 0),
      commits: monthLogs.reduce((s, l) => s + l.commits, 0),
      mrr: monthLogs.length ? Math.max(...monthLogs.map((l) => l.mrrUsd)) : 0,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");
    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      startedAt: user.startedAt ?? args.startedAt,
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
    accountabilityEnabled: v.optional(v.boolean()),
    remindersEnabled: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");
    const {
      displayName,
      bio,
      twitterHandle,
      currentPhase,
      currentDay,
      accountabilityEnabled,
      remindersEnabled,
    } = args;
    await ctx.db.patch(user._id, {
      displayName: displayName ?? undefined,
      bio: bio ?? undefined,
      twitterHandle: twitterHandle ?? undefined,
      currentPhase: currentPhase ?? undefined,
      currentDay: currentDay ?? undefined,
      accountabilityEnabled: accountabilityEnabled ?? undefined,
      remindersEnabled: remindersEnabled ?? undefined,
    });
    return null;
  },
});

// =============================================
// DAILY LOGS
// =============================================

export const todayLog = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const date = args.date ?? new Date().toISOString().slice(0, 10);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");

    // Trial gating: 3 days free.
    let isPaid = user.isPaid;

    if (!isPaid && user.startedAt) {
      const diff = Math.floor((Date.now() - user.startedAt) / (1000 * 60 * 60 * 24));
      const currentDay = Math.max(1, diff + 1);
      if (currentDay > 3) {
        throw new Error("Trial expired. Please unlock the protocol to continue logging.");
      }
    }

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log) return null;
    // ownership check
    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
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
// MILESTONES
// =============================================

export const listMilestones = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("milestones"),
      milestoneId: v.string(),
      status: v.string(),
      proofUrl: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    const rows = await ctx.db
      .query("milestones")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(100);
    // Omit undefined optionals — Convex return validators reject explicit undefined.
    return rows.map((row) =>
      omitUndefined({
        _id: row._id,
        milestoneId: row.milestoneId,
        status: row.status,
        proofUrl: row.proofUrl,
        completedAt: row.completedAt,
      }),
    );
  },
});

export const setMilestoneStatus = mutation({
  args: {
    milestoneId: v.string(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    proofUrl: v.optional(v.string()),
  },
  returns: v.id("milestones"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");

    const existing = await ctx.db
      .query("milestones")
      .withIndex("by_user_milestone", (q) =>
        q.eq("userId", user._id).eq("milestoneId", args.milestoneId),
      )
      .first();

    const completedAt =
      args.status === "completed" ? Date.now() : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        proofUrl: args.proofUrl,
        completedAt: completedAt ?? existing.completedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("milestones", {
      userId: user._id,
      milestoneId: args.milestoneId,
      status: args.status,
      proofUrl: args.proofUrl,
      completedAt,
    });
  },
});

// =============================================
// CONCIERGE & ORDERS
// =============================================

export const listConciergeOrders = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("conciergeOrders"),
      date: v.string(),
      customerName: v.string(),
      amount: v.number(),
      status: v.string(),
      feedback: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    const rows = await ctx.db
      .query("conciergeOrders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
    return rows.map((row) =>
      omitUndefined({
        _id: row._id,
        date: row.date,
        customerName: row.customerName,
        amount: row.amount,
        status: row.status,
        feedback: row.feedback,
        notes: row.notes,
      }),
    );
  },
});

export const logConciergeOrder = mutation({
  args: {
    date: v.string(),
    customerName: v.string(),
    amount: v.number(),
    status: v.string(),
    feedback: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("conciergeOrders"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");
    return await ctx.db.insert("conciergeOrders", {
      userId: user._id,
      ...args,
    });
  },
});

export const updateConciergeOrder = mutation({
  args: {
    id: v.id("conciergeOrders"),
    status: v.optional(v.string()),
    feedback: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");

    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.userId !== user._id) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

// =============================================
// OUTREACH & DISTRIBUTION
// =============================================

export const listOutreachLogs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("outreachLogs"),
      date: v.string(),
      type: v.string(),
      target: v.string(),
      result: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    const rows = await ctx.db
      .query("outreachLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);
    return rows.map((row) =>
      omitUndefined({
        _id: row._id,
        date: row.date,
        type: row.type,
        target: row.target,
        result: row.result,
        notes: row.notes,
      }),
    );
  },
});

export const logOutreach = mutation({
  args: {
    date: v.string(),
    type: v.string(),
    target: v.string(),
    result: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("outreachLogs"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");
    return await ctx.db.insert("outreachLogs", {
      userId: user._id,
      ...args,
    });
  },
});

// =============================================
// MONTHLY REVIEWS
// =============================================

export const listMonthlyReviews = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("monthlyReviews"),
      month: v.string(),
      totalHours: v.number(),
      totalCommits: v.number(),
      mrrEnd: v.number(),
      summary: v.string(),
      notes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    const rows = await ctx.db
      .query("monthlyReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(36);
    return rows.map((row) =>
      omitUndefined({
        _id: row._id,
        month: row.month,
        totalHours: row.totalHours,
        totalCommits: row.totalCommits,
        mrrEnd: row.mrrEnd,
        summary: row.summary,
        notes: row.notes,
      }),
    );
  },
});

export const createMonthlyReview = mutation({
  args: {
    month: v.string(),
    totalHours: v.number(),
    totalCommits: v.number(),
    mrrEnd: v.number(),
    summary: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("monthlyReviews"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");
    return await ctx.db.insert("monthlyReviews", {
      userId: user._id,
      ...args,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    const rows = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(60);
    return rows.map((r) =>
      omitUndefined({
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
      }),
    );
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
    const user = await ctx.db.get(userId);
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

    // streak: walk back from latest log date, count consecutive days, skipping Saturdays (Rest Day)
    let streakDays = 0;
    const logDates = new Set(logs.map((l) => l.date));
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find the start of the streak (anchor)
    const current = new Date(now);
    let anchorFound = false;

    while (true) {
      const dateStr = current.toISOString().slice(0, 10);
      if (logDates.has(dateStr)) {
        anchorFound = true;
        break;
      }
      // We can skip Saturday if there is no log
      if (current.getDay() === 6) {
        current.setDate(current.getDate() - 1);
        continue;
      }
      // If we haven't found a log for today, we can check yesterday
      if (current.getTime() === now.getTime()) {
        current.setDate(current.getDate() - 1);
        continue;
      }
      break;
    }

    if (anchorFound) {
      while (true) {
        const dateStr = (current as Date).toISOString().slice(0, 10);
        const isSaturday = current.getDay() === 6;

        if (logDates.has(dateStr)) {
          streakDays++;
        } else if (isSaturday) {
          // Skip Saturday rest day, don't break the streak
        } else {
          // Broken streak
          break;
        }
        current.setDate(current.getDate() - 1);
        if (streakDays > 365) break; // safety
      }
    }

    // last shipped day = latest log with shippedUrl or shippedNote or > 0 commits
    const lastShip = [...logs]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .find((l) => l.shippedUrl || l.shippedNote || l.commits > 0);

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

// =============================================
// ACCOUNTABILITY ACTIONS
// =============================================

export const recordReminderSent = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { lastReminderSentAt: Date.now() });
  },
});

export const checkAccountability = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.notebook.currentProfile);
    if (!user || !user.accountabilityEnabled) return { success: false, reason: "Accountability disabled" };

    const email = user.email;
    if (!email || !user.remindersEnabled) return { success: false, reason: "No email or reminders disabled" };

    // Cooldown: only send one reminder every 24 hours
    const lastSent = user.lastReminderSentAt || 0;
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (Date.now() - lastSent < cooldownMs) {
      return { success: false, reason: "In cooldown" };
    }

    // 1. Check for missed days (behind schedule)
    const startedAt = user.startedAt;
    if (!startedAt) return { success: false, reason: "No start date" };

    const now = Date.now();
    const elapsedDays = Math.floor((now - startedAt) / (1000 * 60 * 60 * 24)) + 1;
    const suggestedDay = user.suggestedDay || 1;

    let alertMessage = "";
    if (suggestedDay < elapsedDays) {
      alertMessage = `You are currently on Day ${suggestedDay}, but based on your start date, you should be on Day ${elapsedDays}. You are falling behind the 100-day protocol pace!`;
    }

    // 2. Check for overworking (6+ days straight)
    const logs = await ctx.runQuery(api.notebook.listLogs, { limit: 10 });

    // Simple check: how many of the last 7 days have logs?
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });

    const loggedDates = new Set(logs.map((l: any) => l.date));
    const workDaysInLastWeek = last7Days.filter(d => loggedDates.has(d)).length;

    if (workDaysInLastWeek >= 6) {
       alertMessage += (alertMessage ? " Also, " : "") + "You have worked 6 or more days in the last week. The Protocol requires a hard rest on Saturdays! Burnout kills dreams.";
    }

    if (alertMessage) {
      // Send email via VLY integration
      try {
        await vly.email.send({
          to: email,
          subject: "Protocol100 Accountability Alert",
          html: `
            <h1>Accountability Check</h1>
            <p>Founder, we noticed a few things about your progress:</p>
            <p style="color: #d946ef; font-weight: bold;">${alertMessage}</p>
            <p>Get back on track or take your mandatory rest day.</p>
            <p>— Protocol100 Bot</p>
          `,
          text: `Accountability Check: ${alertMessage}`
        });

        await ctx.runMutation(api.notebook.recordReminderSent, { userId: user._id });

        return { success: true, sent: true, message: alertMessage };
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        return { success: false, error: errMsg };
      }
    }

    return { success: true, sent: false, message: "All clear" };
  }
});

// =============================================
// RESET USER DATA
// =============================================

export const resetUserData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record found");

    // 1. Delete user-specific progress/app data in other tables
    const tables = [
      "dailyLogs",
      "keyActionProgress",
      "weeklyReviews",
      "milestones",
      "monthlyReviews",
      "outreachLogs",
      "conciergeOrders",
      "aiInsights",
    ] as const;

    for (const table of tables) {
      const records = await ctx.db
        .query(table)
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    // 2. Reset user profile setup/onboarding fields
    // Keep: name, image, email, tokenIdentifier, emailVerificationTime, isAnonymous, role, isPaid
    await ctx.db.patch(user._id, {
      displayName: undefined,
      startedAt: undefined,
      currentPhase: undefined,
      currentDay: undefined,
      bio: undefined,
      twitterHandle: undefined,
      accountabilityEnabled: undefined,
      remindersEnabled: undefined,
      lastReminderSentAt: undefined,
    });

    return null;
  },
});
