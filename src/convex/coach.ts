

// AI Daily Coach — OpenAI-powered personalized coaching after each daily log.
// Uses the OpenAI REST API directly via fetch (no npm dependency).

import { action, internalMutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "./users";

// =============================================
// QUERY — Get daily insight for display
// =============================================

export const getDailyInsight = query({
  args: { date: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("aiInsights"),
      content: v.string(),
      model: v.string(),
      _creationTime: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const insight = await ctx.db
      .query("aiInsights")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date),
      )
      .order("desc")
      .first();

    if (!insight) return null;

    return {
      _id: insight._id,
      content: insight.content,
      model: insight.model,
      _creationTime: insight._creationTime,
    };
  },
});

// =============================================
// INTERNAL MUTATION — Store insight in DB
// =============================================

export const storeInsight = internalMutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    insightType: v.union(v.literal("daily-debrief"), v.literal("weekly-summary")),
    content: v.string(),
    model: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Remove any existing insight for the same user + date + type
    const existing = await ctx.db
      .query("aiInsights")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date),
      )
      .filter((q) => q.eq(q.field("insightType"), args.insightType))
      .collect();

    for (const old of existing) {
      await ctx.db.delete(old._id);
    }

    return await ctx.db.insert("aiInsights", {
      userId: args.userId,
      date: args.date,
      insightType: args.insightType,
      content: args.content,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
    });
  },
});

// =============================================
// ACTION — Generate daily debrief via OpenAI
// =============================================

const OPENAI_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are "Protocol Coach" — a direct, no-BS mentor for solo founders doing the Protocol100 100-day challenge. This is a structured program where someone goes from zero coding experience to shipping their first paid SaaS product.

Your style:
- You speak like a senior engineer who ships daily
- You are encouraging but NEVER fake — don't say "great job!" when the data shows they slacked
- You celebrate real progress with genuine energy
- You call out slacking honestly but constructively
- If they're stuck, give one concrete unblocking suggestion
- If they shipped, acknowledge it like a teammate would
- You reference their actual data (hours, commits, streak, MRR, mood)
- You always end with ONE specific, actionable thing to focus on tomorrow

Format rules:
- Respond in ≤150 words
- Use markdown: bold for emphasis, no headers
- Write in second person ("you")
- No bullet lists — write in short, punchy paragraphs
- Sign off with a one-line motivational nudge in italics`;

export const generateDailyDebrief = action({
  args: { date: v.string() },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // 1. Get current user profile + today's log + recent history
    const profile = await ctx.runQuery(api.notebook.currentProfile);
    if (!profile) throw new Error("Not authenticated");

    // Check if user is paid — AI coach is a premium feature
    if (!profile.isPaid) {
      throw new Error("AI Coach requires a paid license. Upgrade to unlock personalized coaching.");
    }

    // 2. Get today's log data
    const todayLog = await ctx.runQuery(api.notebook.todayLog, { date: args.date });
    if (!todayLog) {
      throw new Error("No daily log found for this date. Save your log first.");
    }

    // 3. Get recent logs for trend context (last 7 days)
    const recentLogs = await ctx.runQuery(api.notebook.listLogs, { limit: 7 });

    // 4. Get aggregate stats
    const stats = await ctx.runQuery(api.notebook.aggregateStats);

    // 5. Build the user prompt with real data
    const moodLabel = todayLog.mood
      ? ({ "locked-in": "Locked-in 🔥", "shipping": "Shipping 🚀", "stuck": "Stuck 😤", "shipping-slow": "Slow but moving 🐢" } as Record<string, string>)[todayLog.mood] ?? todayLog.mood
      : "Not set";

    const inputsCount = todayLog.inputsDone?.length ?? 0;

    // Calculate trends from recent logs
    const recentHours = recentLogs.map((l: any) => l.hoursCoded);
    const avgHours = recentHours.length > 0
      ? (recentHours.reduce((a: number, b: number) => a + b, 0) / recentHours.length).toFixed(1)
      : "0";

    const recentMRR = recentLogs.map((l: any) => l.mrrUsd);
    const mrrTrend = recentMRR.length >= 2
      ? recentMRR[0] > recentMRR[recentMRR.length - 1] ? "↑ rising" : recentMRR[0] < recentMRR[recentMRR.length - 1] ? "↓ declining" : "→ flat"
      : "insufficient data";

    const userPrompt = `Here is today's daily log for Day ${profile.currentDay ?? "?"} of 100 (Phase: ${profile.currentPhase ?? "unknown"}):

**Today's Numbers:**
- Hours coded: ${todayLog.hoursCoded}
- Commits: ${todayLog.commits}
- Customers contacted: ${todayLog.customersContacted}
- MRR: $${todayLog.mrrUsd}
- Daily inputs completed: ${inputsCount}/6
- Mood: ${moodLabel}
${todayLog.shippedNote ? `- Shipped: "${todayLog.shippedNote}"` : "- Nothing shipped today"}
${todayLog.notes ? `- Notes: "${todayLog.notes}"` : ""}

**Recent Trends (last ${recentLogs.length} days):**
- Avg hours/day: ${avgHours}
- Current streak: ${stats.streakDays} days
- Total days logged: ${stats.daysLogged}
- MRR trajectory: ${mrrTrend}
- Key actions completed: ${stats.actionsCompleted} | In progress: ${stats.actionsInProgress}

**Context:**
- User: ${profile.displayName ?? "Founder"}
- Protocol day: ${profile.currentDay ?? 1}/100
- Phase: ${profile.currentPhase ?? "unknown"}
- Total hours to date: ${stats.totalHours}
- Total commits to date: ${stats.totalCommits}

Give a personalized daily debrief based on this data.`;

    // 6. Call OpenAI API
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured. Set it in your Convex dashboard.");
    }

    const url = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 400,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`AI Coach temporarily unavailable (${response.status}). Please try again.`);
    }

    const data = await response.json();

    // Extract the generated text
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Unexpected OpenAI response structure:", JSON.stringify(data));
      throw new Error("AI Coach returned an empty response. Please try again.");
    }

    // Extract token usage if available
    const usage = data?.usage;
    const promptTokens = usage?.prompt_tokens;
    const completionTokens = usage?.completion_tokens;

    // 7. Store the insight
    await ctx.runMutation(internal.coach.storeInsight, {
      userId: profile._id,
      date: args.date,
      insightType: "daily-debrief",
      content,
      model: OPENAI_MODEL,
      promptTokens,
      completionTokens,
    });

    return content;
  },
});
