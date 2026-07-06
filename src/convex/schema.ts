import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // Indie Dev Boss Protocol notebook fields
      displayName: v.optional(v.string()),
      startedAt: v.optional(v.number()), // protocol start day (ms epoch)
      currentPhase: v.optional(v.string()), // phase:fundamentals ... phase:growth
      currentDay: v.optional(v.number()), // 1..N day of the protocol
      bio: v.optional(v.string()),
      twitterHandle: v.optional(v.string()),
      isPaid: v.optional(v.boolean()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Daily log — one row per user per date. The protocol notebook.
    dailyLogs: defineTable({
      userId: v.id("users"),
      date: v.string(), // ISO YYYY-MM-DD
      phaseId: v.string(),
      // 6 numeric fields from the protocol "how progress is tracked" schema
      hoursCoded: v.number(),
      commits: v.number(),
      shippedUrl: v.optional(v.string()),
      bipPostUrl: v.optional(v.string()),
      customersContacted: v.number(),
      mrrUsd: v.number(),
      notes: v.optional(v.string()),
      // Daily input tallies — which of the 6 daily inputs you hit today
      inputsDone: v.array(v.string()), // input:code-1h, etc.
      // "production chain": what you shipped today (manually written)
      shippedNote: v.optional(v.string()),
      // legacy "mood" so the engineer logbook feels alive
      mood: v.optional(v.union(
        v.literal("locked-in"),
        v.literal("shipping"),
        v.literal("stuck"),
        v.literal("shipping-slow"),
      )),
    })
      .index("by_user_date", ["userId", "date"])
      .index("by_user", ["userId"]),

    // Progress against each of the 11 numbered key actions
    keyActionProgress: defineTable({
      userId: v.id("users"),
      actionId: v.string(), // action:01-complete-cs50
      status: v.union(
        v.literal("not_started"),
        v.literal("in_progress"),
        v.literal("completed"),
      ),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      proofUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_action", ["userId", "actionId"]),

    // Weekly Sunday review
    weeklyReviews: defineTable({
      userId: v.id("users"),
      weekStartDate: v.string(), // ISO YYYY-MM-DD (Monday of reviewed week)
      hoursCoded: v.number(),
      weeksSinceLastDeploy: v.number(),
      mrrWeek: v.number(),
      mrrLastWeek: v.number(),
      summary: v.string(),
      publishedUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_week", ["userId", "weekStartDate"]),

    // Dedicated milestone tracking
    milestones: defineTable({
      userId: v.id("users"),
      milestoneId: v.string(), // e.g. output:portfolio-live
      status: v.union(
        v.literal("not_started"),
        v.literal("in_progress"),
        v.literal("completed"),
      ),
      proofUrl: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_milestone", ["userId", "milestoneId"]),

    // 30-day monthly review
    monthlyReviews: defineTable({
      userId: v.id("users"),
      month: v.string(), // ISO YYYY-MM
      totalHours: v.number(),
      totalCommits: v.number(),
      mrrEnd: v.number(),
      summary: v.string(),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_month", ["userId", "month"]),

    // Outreach activities (cold email, SEO, etc.)
    outreachLogs: defineTable({
      userId: v.id("users"),
      date: v.string(),
      type: v.string(), // cold-email, seo, etc.
      target: v.string(), // who or what (domain, keyword, contact)
      result: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_date", ["userId", "date"]),

    // Concierge manual orders and feedback
    conciergeOrders: defineTable({
      userId: v.id("users"),
      date: v.string(),
      customerName: v.string(),
      amount: v.number(),
      status: v.string(), // pending, fulfilled, etc.
      feedback: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
