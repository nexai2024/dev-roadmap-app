// The Indie Dev Boss Protocol — 100-day challenge (AI-accelerated)
// Source of truth for every page in the dashboard.

export type PhaseId =
  | "phase:ai-fundamentals"
  | "phase:stack-crash"
  | "phase:validate"
  | "phase:mvp-build"
  | "phase:beta"
  | "phase:launch"
  | "phase:mrr-push";

export type PhaseSlug =
  | "ai-fundamentals"
  | "stack-crash"
  | "validate"
  | "mvp-build"
  | "beta"
  | "launch"
  | "mrr-push";

export interface Phase {
  id: PhaseId;
  number: number;
  slug: PhaseSlug;
  label: string;
  window: string; // "Day X-Y"
  dayStart: number;
  dayEnd: number;
  purpose: string;
  internals: string;
  mechanics: string;
  exitGate: string;
  connectsTo: string;
}

export interface KeyAction {
  id: string;
  title: string;
  phaseId: PhaseId;
  window: string;
  resource?: string;
  resourceUrl?: string;
  dailyTime?: string;
  deliverable?: string;
  method?: string;
  successCriteria: string;
  channels?: { label: string; detail: string; url?: string }[];
}

export interface DailyInput {
  id: string;
  label: string;
  frequency: string;
  owner: string;
  description: string;
}

export interface OutputMilestone {
  id: string;
  label: string;
  phase: number;
  day: number;
  verification: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type:
    | "learning"
    | "code-stack"
    | "ai-tool"
    | "launch"
    | "growth"
    | "community"
    | "book"
    | "payments"
    | "cold-outreach";
  note: string;
  cost?: string;
}

export interface HardRule {
  id: string;
  text: string;
  annotation: string;
}

export interface NonNegotiable {
  time: string;
  rule: string;
}

export interface ScheduleEntry {
  day: number;
  type: "work" | "rest" | "review";
  phase: PhaseSlug;
  focus: string;
  morning: string[];
  afternoon: string[];
  evening: string; // BIP post or recap
  shipByEod: string;
  resources: { label: string; url: string }[];
}

export type PrerequisiteCategory =
  | "before-day-1"
  | "phase-stack"
  | "ai-tools"
  | "launch"
  | "cold-outreach"
  | "community"
  | "paid";

export interface Prerequisite {
  id: string;
  name: string;
  signupUrl: string;
  cost: string;
  category: PrerequisiteCategory;
  phaseIds: PhaseId[];
  blurb: string;
  setupTip?: string;
}

// =====================================================
// PHILOSOPHY
// =====================================================

export const PHILOSOPHY = {
  title: "The Indie Dev Boss Protocol",
  shortLabel: "Pieter Levels doctrine",
  pillars: [
    "Revenue is the only KPI that matters.",
    "Tutorials are procrastination.",
    "Ship ugly, ship weekly, charge from day 38.",
  ],
  horizon:
    "100 days from absolute zero to first 3 paying customers, then a path to $1,000 MRR.",
  challengeDays: 100,
  totalDaysHorizon: 200,
  operatingModel:
    "Solo founder, AI-augmented, build-in-public, distribution-first, ship before ready.",
};

// =====================================================
// 7 PHASES (100-day ai-accelerated)
// =====================================================

export const PHASES: Phase[] = [
  {
    id: "phase:ai-fundamentals",
    number: 1,
    slug: "ai-fundamentals",
    label: "AI Fundamentals",
    window: "Day 1-10",
    dayStart: 1,
    dayEnd: 10,
    purpose:
      "Stand on the shoulders of Cursor, Claude, v0, and Bolt.new. Teach your brain to think with AI as pair-programmer instead of doing every keystroke yourself.",
    internals:
      "Cursor (https://cursor.sh) + Claude inside Cursor Composer + Odin HTML/CSS/JS fundamentals (https://www.theodinproject.com/paths/foundations) + Bolt.new (https://bolt.new) for instant UI scaffolds.",
    mechanics:
      "Watch a 30-min Odin tutorial, walk through the same example in Cursor with Claude explaining each line, then prompt v0 to generate a UI variant and Bolt.new to scaffold a complete app.",
    exitGate:
      "Personal name.vercel.app site live, dog-image fetch app shipped, Bolt.new Todo URL bookmarked. Master template = empty but stack-ready.",
    connectsTo:
      "Feeds phase:stack-crash. The personal site becomes the deploy target for every future throwaway app.",
  },
  {
    id: "phase:stack-crash",
    number: 2,
    slug: "stack-crash",
    label: "Stack Crash",
    window: "Day 11-25",
    dayStart: 11,
    dayEnd: 25,
    purpose:
      "Lock the stack (Next.js + Supabase + Stripe + Vercel + Resend + PostHog). Build 3 throwaway apps to prove you can ship any SaaS skeleton in 24 hours.",
    internals:
      "Next.js App Router (https://nextjs.org/docs) + Supabase (https://supabase.com/docs) + Vercel (https://vercel.com/docs) + Stripe (https://stripe.com/docs) + Resend (https://resend.com/docs) + Cursor Composer for refactors.",
    mechanics:
      "Three throwaway apps: Day 15 Auth + Notes, Day 17 OpenAI Summarizer, Day 19 Dashboard. Merge Auth + DB + Layout into one master repo (Day 22). Refactor (Day 23). Add dark mode (Day 23). Reps (Day 24-25).",
    exitGate:
      "Master SaaS boilerplate repo on GitHub: sign up with email → Supabase Auth creates user → row in Postgres → dashboard redirect → dark mode toggle works. output:boilerplate-master stored.",
    connectsTo:
      "Feeds phase:validate. The boilerplate is the canvas your real MVP will be painted on.",
  },
  {
    id: "phase:validate",
    number: 3,
    slug: "validate",
    label: "Validation & Concierge",
    window: "Day 26-40",
    dayStart: 26,
    dayEnd: 40,
    purpose:
      "Hunt for a real problem. Talk to 30 humans. Run a concierge MVP. Validate someone will pay BEFORE writing software.",
    internals:
      "Reddit (https://reddit.com/r/SaaS, https://reddit.com/r/IndieHackers, https://reddit.com/r/SideProject) + X/Twitter search + LinkedIn scrape + Google Forms (https://docs.google.com/forms) + Calendly (https://calendly.com) + Zapier (https://zapier.com) + Stripe Payment Link (https://stripe.com/payment-links) + Claude for call-log analysis.",
    mechanics:
      "Days 26-27 find 10 painful B2B workflows, rank, pick 1. Day 30 DM 20. Day 31 interview 3. Day 32 set up concierge with Stripe $20 Payment Link. Day 34 hustle 5 calls. Day 38 secure first $20. Day 39 deliver manually. Day 40 write spec for real MVP.",
    exitGate:
      "First $20 Stripe charge OR 100 waitlist signups. Manual workflow spec written. output:first-payment stored.",
    connectsTo:
      "Feeds phase:mvp-build. The validated workflow becomes the one core feature you ship.",
  },
  {
    id: "phase:mvp-build",
    number: 4,
    slug: "mvp-build",
    label: "Real MVP",
    window: "Day 41-65",
    dayStart: 41,
    dayEnd: 65,
    purpose:
      "Fork the boilerplate, automate the concierge workflow into real software, wire payments, transactional email, analytics, paywall, SEO. End with 5 active users.",
    internals:
      "Cursor Composer + Next.js + Supabase + Stripe Checkout + Stripe CLI (https://stripe.com/docs/stripe-cli) + ngrok (https://ngrok.com) for local webhook testing + Resend + PostHog (https://posthog.com/docs) + Lovable (https://lovable.dev) / v0 (https://v0.dev) for landing page + Loom (https://loom.com) for onboarding video.",
    mechanics:
      "Day 41 fork template. Day 44-46 build core features. Day 47 Stripe Checkout. Day 48 webhook + ngrok. Day 51 Resend. Day 52 LP via Lovable. Day 53 paywall. Day 54 PostHog. Day 55 polish. Day 58 self-serve test (pay yourself). Day 60 beta invites. Day 61 Loom onboarding. Day 62 SEO meta + Google Search Console (https://search.google.com/search-console). Day 65 = 5 active users.",
    exitGate:
      "End-to-end production flow works: signup → Stripe charge → Resend welcome email → paywall enforced → PostHog event. output:mvp-prod and output:beta-cohort stored.",
    connectsTo:
      "Feeds phase:beta. The MVP is now ready to take in 15-20 beta users.",
  },
  {
    id: "phase:beta",
    number: 5,
    slug: "beta",
    label: "Beta & Hardening",
    window: "Day 66-80",
    dayStart: 66,
    dayEnd: 80,
    purpose:
      "Watch users struggle. Fix bugs. Build #1 requested feature. Stabilize the product before public launch.",
    internals:
      "PostHog session replays + Vercel logs + Cursor for hotfixes + Stripe tier re-pricing + Product Hunt asset design (https://www.producthunt.com).",
    mechanics:
      "Day 66 watch session replays. Day 67 silent bug fixes. Day 68 DM beta users for feedback. Day 69 ship #1 requested feature. Day 72 expand to 15 users. Day 73 backend hardening. Day 74 pricing adjustment. Day 75 launch assets. Day 76 teaser video. Day 78 final sweep.",
    exitGate:
      "15 beta users actively using the app, churn report in dashboard, PH maker assets ready.",
    connectsTo:
      "Feeds phase:launch. Day 79 = launch day.",
  },
  {
    id: "phase:launch",
    number: 6,
    slug: "launch",
    label: "Launch",
    window: "Day 81-90",
    dayStart: 81,
    dayEnd: 90,
    purpose:
      "Public launch on Product Hunt + Indie Hackers. Capture every lead. Set up the distribution machine.",
    internals:
      "Product Hunt (https://www.producthunt.com) launcher guide + Indie Hackers (https://indiehackers.com) + r/SideProject (https://reddit.com/r/SideProject) + Resend drip sequences.",
    mechanics:
      "Day 79 (technically phase end, launch day). Day 80 PH follow-up + bug hunt. Day 81 IH deep-dive + r/SideProject cross-post. Day 82 support inbox zero. Day 83 lead capture → Resend 3-day drip. Day 85 post-mortem. Day 87 SEO post #1. Day 88-89 cold email 50 (Apollo + Hunter). Day 90 SEO post #2 (competitor alt).",
    exitGate:
      "Live PH page, top-5-of-the-day, deep-dive post on IH, 50 cold emails sent, 2 SEO posts live. output:ph-launch stored.",
    connectsTo:
      "Feeds phase:mrr-push. Distribution channels are warmed up; now convert them to MRR.",
  },
  {
    id: "phase:mrr-push",
    number: 7,
    slug: "mrr-push",
    label: "MRR Push",
    window: "Day 91-100",
    dayStart: 91,
    dayEnd: 100,
    purpose:
      "Hand-sell, demo, follow up, retain. Hit 3 paying customers on Day 100 = first real MRR.",
    internals:
      "PostHog (engaged-user filter) + Stripe (https://dashboard.stripe.com) + Resend (https://resend.com) + Calendly (https://calendly.com) demos + Apollo (https://apollo.io) + Hunter (https://hunter.io) + Google Search Console (indexing).",
    mechanics:
      "Day 86-90 already in launch. Day 93 demo day (calls + discount). Day 94 affiliate outreach (30% cut via Stripe). Day 95 win-back expired trials. Day 96 ship #1 mini-feature for paid users. Day 97 follow up cold leads. Day 100 hand-sell until 3 paying active. Day 100 retrospective published.",
    exitGate:
      "3 active paying customers = first real MRR. 1,000-word post-mortem published. output:mrr-goal stored.",
    connectsTo:
      "Beyond Day 100 = continue compounding: SEO, cold email, affiliates, demos. Path to $1k MRR in 200 days.",
  },
];

// =====================================================
// 6 DAILY INPUTS
// =====================================================

export const DAILY_INPUTS: DailyInput[] = [
  {
    id: "input:code-2h",
    label: "Cursor session (2 hrs)",
    frequency: "Daily workdays, 09:00-11:00",
    owner: "You",
    description:
      "Two hours of focused Cursor work with Claude as pair-programmer. Morning block. Phone in another room.",
  },
  {
    id: "input:code-3h",
    label: "Build block (3 hrs)",
    frequency: "Daily workdays, 11:00-14:00",
    owner: "You",
    description:
      "Three-hour afternoon block to ship the day's deliverable.",
  },
  {
    id: "input:ship-1-thing",
    label: "Ship one thing",
    frequency: "Daily, before 17:00",
    owner: "You",
    description:
      "Push to GitHub or deploy to Vercel. Even a 4-line CSS fix counts. Velocity compounds.",
  },
  {
    id: "input:build-in-public",
    label: "Build-in-public post",
    frequency: "Daily, 14:00-14:30",
    owner: "You",
    description:
      "30-minute X / IndieHackers / Makerlog post. Use the day's BIP line from the schedule. Tag #buildinpublic.",
  },
  {
    id: "input:customer-talk",
    label: "Customer outreach (Phase 3+)",
    frequency: "Daily, starting Day 30",
    owner: "You",
    description:
      "Pre-launch: cold DMs on X and r/SaaS. Post-launch: support replies count. Aim for 20 DMs/day.",
  },
  {
    id: "input:weekly-review",
    label: "Sunday review post-mortem",
    frequency: "Every 7 days, 90 min",
    owner: "You",
    description:
      "Compute MRR, churn, deploy count, hours. Publish a recap post. This is the heartbeat.",
  },
];

// =====================================================
// 6 OUTPUTS / MILESTONES (100-day timeline)
// =====================================================

export const OUTPUTS: OutputMilestone[] = [
  {
    id: "output:portfolio-live",
    label: "Portfolio live on Vercel",
    phase: 1,
    day: 8,
    verification: "Live name.vercel.app URL returns 200.",
  },
  {
    id: "output:boilerplate-master",
    label: "Master SaaS boilerplate",
    phase: 2,
    day: 22,
    verification:
      "GitHub repo forked; sign up with email works; row in Postgres; dashboard redirect; dark mode toggle.",
  },
  {
    id: "output:first-payment",
    label: "First $20 Stripe payment",
    phase: 3,
    day: 38,
    verification: "Stripe dashboard screenshot of first $20 charge.",
  },
  {
    id: "output:mvp-prod",
    label: "MVP in production",
    phase: 4,
    day: 55,
    verification:
      "End-to-end flow: signup → Stripe charge → Resend email → paywall → PostHog event.",
  },
  {
    id: "output:beta-cohort",
    label: "5 active beta users",
    phase: 4,
    day: 65,
    verification: "5 humans actively signed up + paid or in active trial.",
  },
  {
    id: "output:mrr-goal",
    label: "3 paying customers (first MRR)",
    phase: 7,
    day: 100,
    verification: "3 active paying customers in Stripe dashboard on Day 100.",
  },
];

// =====================================================
// 11 KEY ACTIONS
// =====================================================

export const KEY_ACTIONS: KeyAction[] = [
  {
    id: "action:01-install-ai-stack",
    title: "Install the AI dev stack + crash Odin",
    phaseId: "phase:ai-fundamentals",
    window: "Day 1-10",
    resource: "Cursor, Claude, v0, Bolt.new, Odin Project",
    resourceUrl: "https://cursor.sh",
    deliverable:
      "Cursor installed, Odin HTML/CSS/JS fundamentals opened, dog-fetch app live, Bolt.new Todo bookmarked.",
    successCriteria:
      "Personal site deployed on Vercel by Day 8. Prompt engineering exercise produces a working Bolt.new app by Day 10.",
  },
  {
    id: "action:02-deploy-portfolio",
    title: "Deploy personal site",
    phaseId: "phase:ai-fundamentals",
    window: "Day 8",
    resource: "Vercel",
    resourceUrl: "https://vercel.com",
    successCriteria:
      "One-page Next.js site (name, photo, GitHub, X links) on *.vercel.app, returning 200. output:portfolio-live stored.",
  },
  {
    id: "action:03-build-3-throwaways",
    title: "Build 3 throwaway apps",
    phaseId: "phase:stack-crash",
    window: "Day 15-19",
    resource: "Cursor + Supabase + Next.js",
    resourceUrl: "https://supabase.com/docs",
    successCriteria:
      "App 1 (Auth + Notes), App 2 (OpenAI summarizer + storage), App 3 (Dashboard) — all live on Vercel.",
  },
  {
    id: "action:04-master-boilerplate",
    title: "Build the master SaaS boilerplate",
    phaseId: "phase:stack-crash",
    window: "Day 22-25",
    resource: "Cursor Composer + Tailwind",
    resourceUrl: "https://tailwindcss.com",
    successCriteria:
      "Merged master repo with Auth + DB + Tailwind + dark mode. output:boilerplate-master stored.",
  },
  {
    id: "action:05-run-concierge-mvp",
    title: "Run the concierge MVP + first $20",
    phaseId: "phase:validate",
    window: "Day 30-38",
    resource: "Google Forms, Calendly, Stripe Payment Link",
    resourceUrl: "https://stripe.com/payment-links",
    method:
      "Cold DM 20 prospects/day. Run 5 calls. Set up $20 Stripe Payment Link. Secure first $20 by Day 38.",
    successCriteria:
      "First $20 Stripe charge. 30 conversations logged. Manual workflow spec written. output:first-payment stored.",
  },
  {
    id: "action:06-build-real-mvp",
    title: "Build the real MVP",
    phaseId: "phase:mvp-build",
    window: "Day 41-55",
    resource: "Cursor + Next.js + Supabase + Stripe + Resend + PostHog",
    resourceUrl: "https://cursor.sh",
    method:
      "Fork boilerplate, build core features Cursor-first, wire Stripe Checkout + webhook, Resend transactional email, PostHog events.",
    successCriteria:
      "End-to-end production flow live. Pay yourself a $5 test charge → refund. output:mvp-prod stored.",
  },
  {
    id: "action:07-get-5-beta-users",
    title: "Get 5 active beta users",
    phaseId: "phase:mvp-build",
    window: "Day 60-65",
    resource: "Loom, X, IndieHackers, r/SaaS",
    resourceUrl: "https://loom.com",
    method:
      "DM 30 from validation list offering free beta. Loom 2-min onboarding demo. Hand-hold first 5 through signup.",
    successCriteria: "5 humans actively using the app. output:beta-cohort stored.",
  },
  {
    id: "action:08-launch-producthunt",
    title: "Launch on Product Hunt",
    phaseId: "phase:launch",
    window: "Day 76-80",
    resource: "Product Hunt launcher guide",
    resourceUrl: "https://www.producthunt.com",
    method:
      "Day 76 teaser video. Day 79 00:01 PST submit. Day 80 reply to all comments, hunt for bugs from spike. output:ph-launch.",
    successCriteria:
      "Top-5-of-the-day, 100+ upvotes, 20+ new signups, IH + r/SideProject cross-post live.",
  },
  {
    id: "action:09-distribution-machine",
    title: "Run the distribution machine",
    phaseId: "phase:launch",
    window: "Day 86-90",
    resource: "Apollo, Hunter, Google Search Console, Next.js MDX blog",
    resourceUrl: "https://apollo.io",
    method:
      "2 SEO blog posts/week via Next.js MDX. Apollo + Hunter for 50 cold emails. Manual Google indexing.",
    successCriteria:
      "2 SEO posts live, 50 cold emails sent, at least 1 channel producing >= 1 paying customer per $20 spent.",
  },
  {
    id: "action:10-hand-sell-3-paid",
    title: "Hand-sell to 3 paying customers",
    phaseId: "phase:mrr-push",
    window: "Day 91-100",
    resource: "PostHog, Calendly, Stripe, Resend",
    resourceUrl: "https://posthog.com",
    method:
      "Identify engaged free users in PostHog → 1:1 email with Calendly demo slot. Discount to close. Win-back expired trials.",
    successCriteria: "3 active paying customers. output:mrr-goal stored.",
  },
  {
    id: "action:11-publish-retrospective",
    title: "Publish Day 100 retrospective",
    phaseId: "phase:mrr-push",
    window: "Day 100",
    resource: "X, IndieHackers, r/SideProject",
    resourceUrl: "https://indiehackers.com",
    method:
      "1,000-word long-form post-mortem covering: numbers, what worked, what killed, net MRR, plans for $1k.",
    successCriteria: "Published URL stored in dashboard.",
  },
];

// =====================================================
// 7 HARD RULES (AI-augmented)
// =====================================================

export const HARD_RULES: HardRule[] = [
  {
    id: "rule:ai-first",
    text: "AI first, manual never. Ask Cursor Composer before every function. Ask v0 / Bolt before every UI.",
    annotation:
      "You're not competing with the prompt engineer — you're using them. The cursor.sh $20/mo is the highest-ROI budget line you'll ever write.",
  },
  {
    id: "rule:5-hours-5-days",
    text: "5 hours/day, 5 workdays/week. Non-negotiable. No overnight coding.",
    annotation:
      "Sleep is a feature. Burnout killed more indie dreams than bad code. The Saturday REST + Sunday REVIEW cadence is law.",
  },
  {
    id: "rule:one-product",
    text: "One product. Zero side projects.",
    annotation:
      "Stacked side projects = $0 MRR forever. If you change ideas during validation, kill the old one cleanly.",
  },
  {
    id: "rule:charge-or-pivot",
    text: "Charge from Day 38 OR pivot by Day 50.",
    annotation:
      "Free users lie. Paying users tell the truth. If no one will pay $20 for the manual workflow, you picked the wrong idea.",
  },
  {
    id: "rule:daily-bip",
    text: "Build-in-public post every workday. Even if it's 'got rejected 12 times today.'",
    annotation:
      "Consistency is the moat. The X algorithm rewards streaks. The audience compounds. The launch audience = your weekly recap readers.",
  },
  {
    id: "rule:no-tutorial-after-day-15",
    text: "No tutorial after Day 15. You learn by shipping throwaways.",
    annotation:
      "Three throwaway apps teach you 100× more than three Udemy courses. Cursor Composer is your tutorial channel.",
  },
  {
    id: "rule:mrr-is-only-kpi",
    text: "MRR is the only KPI. Forget signups, GitHub stars, HN upvotes.",
    annotation:
      "Build the metric. The metric builds the business. Stripe dashboard > Twitter followers.",
  },
];

// =====================================================
// DAILY NON-NEGOTIABLES (timed)
// =====================================================

export const NON_NEGOTIABLES: NonNegotiable[] = [
  { time: "09:00", rule: "Open Cursor. No email until lunch." },
  { time: "11:00", rule: "Switch from Cursor session to v0 / Bolt / Lovable for UI work." },
  { time: "14:00", rule: "Build-in-public post on X + Makerlog. Use the day's BIP line." },
  { time: "16:00", rule: "Final commit. Vercel deploy if greenfield, PR if core." },
  { time: "17:00", rule: "Stop. Hard stop. Saturday REST or Sunday REVIEW." },
];

// =====================================================
// RESOURCES (with URLs — always clickable)
// =====================================================

export const RESOURCES: Resource[] = [
  // AI tooling
  {
    id: "res:cursor",
    name: "Cursor",
    url: "https://cursor.sh",
    type: "ai-tool",
    note: "AI editor. Cursor Composer is the heart of the 100-day plan. Free Pro trial, then $20/mo.",
    cost: "$20/mo",
  },
  {
    id: "res:claude",
    name: "Claude (in Cursor)",
    url: "https://www.anthropic.com/claude",
    type: "ai-tool",
    note: "Built into Cursor Composer. Pair-programmer inside your IDE. Use for spec writing too.",
  },
  {
    id: "res:v0",
    name: "v0 by Vercel",
    url: "https://v0.dev",
    type: "ai-tool",
    note: "Generate React/Tailwind UIs from a text prompt. Day 4, 16, 46, 52, 75.",
  },
  {
    id: "res:bolt",
    name: "Bolt.new",
    url: "https://bolt.new",
    type: "ai-tool",
    note: "Full-stack prompt-to-app. Day 10 starter project.",
  },
  {
    id: "res:lovable",
    name: "Lovable",
    url: "https://lovable.dev",
    type: "ai-tool",
    note: "Landing-page generator. Day 52 marketing site scaffold.",
  },
  // Learning (Odin / Full Stack Open)
  {
    id: "res:odin",
    name: "The Odin Project — Foundations",
    url: "https://www.theodinproject.com/paths/foundations/courses/foundations",
    type: "learning",
    note: "HTML, CSS, JS fundamentals. Days 1-10 backbone.",
  },
  {
    id: "res:fso",
    name: "Full Stack Open",
    url: "https://fullstackopen.com",
    type: "learning",
    note: "Optional, for deeper React/Next.js stack understanding.",
  },
  // Code stack
  {
    id: "res:next",
    name: "Next.js",
    url: "https://nextjs.org/docs",
    type: "code-stack",
    note: "App Router. Only framework you should learn in 100 days.",
  },
  {
    id: "res:supabase",
    name: "Supabase",
    url: "https://supabase.com/docs",
    type: "code-stack",
    note: "Postgres + auth + storage + edge functions.",
  },
  {
    id: "res:vercel",
    name: "Vercel",
    url: "https://vercel.com/docs",
    type: "code-stack",
    note: "Deploy Next.js apps. Auto-deploy on git push.",
  },
  {
    id: "res:stripe",
    name: "Stripe",
    url: "https://stripe.com/docs",
    type: "payments",
    note: "Payment Links for concierge (Day 32+). Checkout for MVP (Day 47).",
  },
  {
    id: "res:stripe-cli",
    name: "Stripe CLI",
    url: "https://stripe.com/docs/stripe-cli",
    type: "payments",
    note: "Forward webhooks to localhost for testing (Day 48).",
  },
  {
    id: "res:resend",
    name: "Resend",
    url: "https://resend.com/docs",
    type: "payments",
    note: "Transactional email. Welcome + receipts. Day 51, 83 drip campaign.",
  },
  {
    id: "res:posthog",
    name: "PostHog",
    url: "https://posthog.com/docs",
    type: "code-stack",
    note: "Product analytics + session replays. Activation event discovery.",
  },
  {
    id: "res:notion",
    name: "Notion",
    url: "https://www.notion.so",
    type: "code-stack",
    note: "Workspace + cold-DM tracking + interview-log.",
  },
  // Launch
  {
    id: "res:producthunt",
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    type: "launch",
    note: "Day 79 launchpad. Top-5-of-the-day = 100+ upvotes.",
  },
  {
    id: "res:indiehackers",
    name: "Indie Hackers",
    url: "https://indiehackers.com",
    type: "launch",
    note: "Day 81 deep-dive launch post + interviews.",
  },
  {
    id: "res:google-search-console",
    name: "Google Search Console",
    url: "https://search.google.com/search-console",
    type: "launch",
    note: "Submit sitemap Day 62, manually request indexing Day 90.",
  },
  // Growth / outreach
  {
    id: "res:apollo",
    name: "Apollo.io",
    url: "https://apollo.io",
    type: "cold-outreach",
    note: "B2B email scraper. Day 88 cold-outbound machine.",
  },
  {
    id: "res:hunter",
    name: "Hunter.io",
    url: "https://hunter.io",
    type: "cold-outreach",
    note: "Find emails by domain. Backup for Apollo.",
  },
  {
    id: "res:loom",
    name: "Loom",
    url: "https://loom.com",
    type: "growth",
    note: "Record 2-min onboarding demo. Day 61.",
  },
  {
    id: "res:zapier",
    name: "Zapier",
    url: "https://zapier.com",
    type: "growth",
    note: "Wire concierge form → Stripe → Notion. Day 32.",
  },
  {
    id: "res:calendly",
    name: "Calendly",
    url: "https://calendly.com",
    type: "growth",
    note: "Demo booking. Day 32 concierge + Day 93 demo day.",
  },
  {
    id: "res:ngrok",
    name: "ngrok",
    url: "https://ngrok.com",
    type: "code-stack",
    note: "Public URLs for Stripe webhook testing. Day 48.",
  },
  {
    id: "res:rsaas",
    name: "r/SaaS",
    url: "https://reddit.com/r/SaaS",
    type: "community",
    note: "Daily Q&A. Where founders lurk + compare CAC.",
  },
  {
    id: "res:r-indie",
    name: "r/IndieHackers",
    url: "https://reddit.com/r/IndieHackers",
    type: "community",
    note: "Build-in-public accountability.",
  },
  {
    id: "res:r-sideproject",
    name: "r/SideProject",
    url: "https://reddit.com/r/SideProject",
    type: "community",
    note: "Day 81 cross-post + r/SaaS posting.",
  },
  {
    id: "res:makerlog",
    name: "Makerlog",
    url: "https://getmakerlog.com",
    type: "community",
    note: "Public task log. Cross-post daily ship.",
  },
  // Books
  {
    id: "res:makebook",
    name: "Make Book (Pieter Levels)",
    url: "https://makebook.io",
    type: "book",
    note: "The playbook this protocol was reverse-engineered from. Read chapters 1-3 in your first week.",
    cost: "$30",
  },
  {
    id: "res:microconf",
    name: "MicroConf YouTube",
    url: "https://microconf.com/youtube",
    type: "community",
    note: "Free founder talks. Watch while running.",
  },
];

// =====================================================
// PREREQUISITES (signup links for everything)
// =====================================================

export const PREREQUISITES: Prerequisite[] = [
  // before-day-1 — pure accounts
  {
    id: "prereq:gmail",
    name: "A Google Account (Gmail)",
    signupUrl: "https://accounts.google.com/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: ["phase:ai-fundamentals", "phase:validate", "phase:mvp-build"],
    blurb:
      "Anchors GitHub, Vercel, Stripe, Google Forms, Calendly, Loom, Product Hunt. One account = everything.",
    setupTip: "If you can't use Gmail, Proton or iCloud works; expect friction on a few signups.",
  },
  {
    id: "prereq:github",
    name: "GitHub",
    signupUrl: "https://github.com/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash", "phase:mvp-build"],
    blurb:
      "Code home for the master boilerplate. Every push = a public receipt.",
    setupTip:
      "Same handle as X. Create 'indie-dev-boss' repo on Day 1.",
  },
  {
    id: "prereq:x",
    name: "X / Twitter",
    signupUrl: "https://twitter.com/i/flow/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: [
      "phase:ai-fundamentals",
      "phase:validate",
      "phase:launch",
      "phase:mrr-push",
    ],
    blurb:
      "Your daily build-in-public channel. Day 1 post + Day 79 PH push all live here.",
    setupTip:
      "Bio: 'Day 1 of 100. Building a SaaS solo. Target: $1 MRR by Day 100.'",
  },
  {
    id: "prereq:makerlog",
    name: "Makerlog",
    signupUrl: "https://getmakerlog.com",
    cost: "Free",
    category: "before-day-1",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash"],
    blurb: "Public ship-log. Cross-posts daily task-completion to a wider maker ecosystem.",
  },
  {
    id: "prereq:notion",
    name: "Notion",
    signupUrl: "https://www.notion.so/signup",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:validate", "phase:mrr-push"],
    blurb:
      "Workspace + cold-DM tracker + interview-log + customer pain doc.",
    setupTip: "Mirror the dashboard schema: day, phase, hours, shipped_url, contacts, mrr.",
  },

  // AI tooling
  {
    id: "prereq:cursor",
    name: "Cursor",
    signupUrl: "https://cursor.sh",
    cost: "$20/mo",
    category: "ai-tools",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash", "phase:mvp-build", "phase:beta"],
    blurb:
      "The only required expense for 100 days. Composer + Claude as pair-programmer inside the IDE.",
    setupTip: "Free Pro trial. Buy after Day 5 only if you can ship without it first.",
  },
  {
    id: "prereq:claude",
    name: "Claude (Anthropic)",
    signupUrl: "https://www.anthropic.com/claude",
    cost: "Free tier / Pro",
    category: "ai-tools",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash", "phase:mvp-build"],
    blurb: "Built into Cursor. Standalone Claude.ai for spec writing + interview-log analysis.",
  },
  {
    id: "prereq:v0",
    name: "v0 by Vercel",
    signupUrl: "https://v0.dev",
    cost: "Free tier",
    category: "ai-tools",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash", "phase:mvp-build"],
    blurb: "Generate React/Tailwind UI from a text prompt. Faster than Figma + faster than writing JSX.",
  },
  {
    id: "prereq:bolt",
    name: "Bolt.new",
    signupUrl: "https://bolt.new",
    cost: "Free tier",
    category: "ai-tools",
    phaseIds: ["phase:ai-fundamentals"],
    blurb:
      "Prompt → full-stack app. Day 10 starter Todo. Use to learn what an app skeleton looks like.",
  },
  {
    id: "prereq:lovable",
    name: "Lovable",
    signupUrl: "https://lovable.dev",
    cost: "Free tier",
    category: "ai-tools",
    phaseIds: ["phase:mvp-build"],
    blurb: "Day 52 landing-page generator. Lovable → Next.js code path.",
  },

  // Phase stack
  {
    id: "prereq:vercel",
    name: "Vercel",
    signupUrl: "https://vercel.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:ai-fundamentals", "phase:stack-crash", "phase:mvp-build"],
    blurb: "Hosting for portfolio + 3 throwaways + master boilerplate + real MVP.",
  },
  {
    id: "prereq:supabase",
    name: "Supabase",
    signupUrl: "https://supabase.com/dashboard",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:stack-crash", "phase:mvp-build"],
    blurb: "Postgres + auth + storage. Single point of contact for all data needs.",
  },
  {
    id: "prereq:resend",
    name: "Resend",
    signupUrl: "https://resend.com/signup",
    cost: "Free tier (3K/mo)",
    category: "phase-stack",
    phaseIds: ["phase:mvp-build", "phase:launch"],
    blurb: "Transactional email + Day 83 lead-drip campaign.",
    setupTip: "Verify a sending domain on Day 87.",
  },
  {
    id: "prereq:posthog",
    name: "PostHog",
    signupUrl: "https://posthog.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:mvp-build", "phase:beta", "phase:mrr-push"],
    blurb: "Product analytics + session replays + feature flags.",
    setupTip: "Deploy snippet on Day 54.",
  },
  {
    id: "prereq:stripe",
    name: "Stripe",
    signupUrl: "https://dashboard.stripe.com/register",
    cost: "Free to register",
    category: "phase-stack",
    phaseIds: ["phase:validate", "phase:mvp-build"],
    blurb:
      "Payment Links for concierge (Day 32+). Checkout + webhooks for real MVP (Day 47+).",
  },
  {
    id: "prereq:stripe-cli",
    name: "Stripe CLI",
    signupUrl: "https://stripe.com/docs/stripe-cli",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:mvp-build"],
    blurb: "Forward webhooks to localhost (Day 48).",
  },
  {
    id: "prereq:ngrok",
    name: "ngrok",
    signupUrl: "https://ngrok.com",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:mvp-build"],
    blurb: "Public URL tunnels for webhook testing.",
  },

  // Validate / concierge
  {
    id: "prereq:google-forms",
    name: "Google Forms",
    signupUrl: "https://docs.google.com/forms/u/0/",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:validate"],
    blurb: "Day 32 concierge intake form. No code, instant signup.",
  },
  {
    id: "prereq:calendly",
    name: "Calendly",
    signupUrl: "https://calendly.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:validate", "phase:mrr-push"],
    blurb: "Self-service booking. Day 32 concierge + Day 93 demo day.",
  },
  {
    id: "prereq:zapier",
    name: "Zapier",
    signupUrl: "https://zapier.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:validate"],
    blurb: "Day 32 wire Form → Notion + Stripe Payment Link.",
  },

  // Launch
  {
    id: "prereq:producthunt",
    name: "Product Hunt (Maker account)",
    signupUrl: "https://www.producthunt.com/signup",
    cost: "Free",
    category: "launch",
    phaseIds: ["phase:launch"],
    blurb:
      "Apply to be a Maker (separate form) by Day 75. Day 79 00:01 PST submit.",
  },
  {
    id: "prereq:gsc",
    name: "Google Search Console",
    signupUrl: "https://search.google.com/search-console",
    cost: "Free",
    category: "launch",
    phaseIds: ["phase:launch"],
    blurb: "Submit sitemap + manually request indexing for SEO posts.",
  },
  {
    id: "prereq:loom",
    name: "Loom",
    signupUrl: "https://loom.com",
    cost: "Free tier",
    category: "launch",
    phaseIds: ["phase:mvp-build"],
    blurb: "Record 2-min onboarding demo Day 61. Embed in dashboard empty state.",
  },

  // Cold outreach
  {
    id: "prereq:apollo",
    name: "Apollo.io",
    signupUrl: "https://apollo.io",
    cost: "Free tier",
    category: "cold-outreach",
    phaseIds: ["phase:launch", "phase:mrr-push"],
    blurb: "B2B email scraper + sequencer. Day 88 cold-outbound machine.",
  },
  {
    id: "prereq:hunter",
    name: "Hunter.io",
    signupUrl: "https://hunter.io",
    cost: "Free tier",
    category: "cold-outreach",
    phaseIds: ["phase:launch"],
    blurb: "Backup to Apollo. Find emails by domain name.",
  },

  // Community
  {
    id: "prereq:indiehackers",
    name: "Indie Hackers",
    signupUrl: "https://indiehackers.com/signup",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validate", "phase:launch"],
    blurb: "Interviews + forums + Day 81 launch post.",
  },
  {
    id: "prereq:rsaas",
    name: "r/SaaS",
    signupUrl: "https://reddit.com/r/SaaS",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validate", "phase:mrr-push"],
    blurb: "Daily Q&A. Day 30 prospect source.",
  },
  {
    id: "prereq:r-indie",
    name: "r/IndieHackers",
    signupUrl: "https://reddit.com/r/IndieHackers",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validate", "phase:mrr-push"],
    blurb: "Build-in-public accountability.",
  },
  {
    id: "prereq:r-side",
    name: "r/SideProject",
    signupUrl: "https://reddit.com/r/SideProject",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:launch"],
    blurb: "Day 81 cross-post channel.",
  },
  {
    id: "prereq:microconf",
    name: "MicroConf YouTube",
    signupUrl: "https://microconf.com/youtube",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validate"],
    blurb: "Rob Walling + MicroConf crew. Watch before Day 30.",
  },

  // Paid
  {
    id: "prereq:makebook",
    name: "Make Book (Pieter Levels)",
    signupUrl: "https://makebook.io",
    cost: "$30 one-time",
    category: "paid",
    phaseIds: ["phase:ai-fundamentals"],
    blurb: "The playbook. Read chapters 1-3 in your first week.",
  },
];

// =====================================================
// 100-DAY SCHEDULE (work / rest / review rows)
// =====================================================

export const HUNDRED_DAY_SCHEDULE: ScheduleEntry[] = [
  // ---------------- PHASE 1 — AI Fundamentals — Day 1-10 ----------------
  { day: 1, type: "work", phase: "ai-fundamentals", focus: "AI + HTML basics", morning: ["Install Cursor", "Open Odin HTML foundations"], afternoon: ["Prompt Claude to explain DOM", "Build a basic HTML form locally"], evening: "Day 1 of 100: Started AI dev journey.", shipByEod: "Local HTML form runs", resources: [{ label: "Cursor", url: "https://cursor.sh" }, { label: "Odin HTML foundations", url: "https://www.theodinproject.com/paths/foundations/courses/foundations" }, { label: "Claude", url: "https://www.anthropic.com/claude" }] },
  { day: 2, type: "work", phase: "ai-fundamentals", focus: "CSS basics", morning: ["Read Odin CSS basics"], afternoon: ["Style Day 1 form", "Ask Claude to fix layout bugs"], evening: "Day 2: Fighting CSS, saved by Claude.", shipByEod: "Styled form page", resources: [{ label: "Odin CSS", url: "https://www.theodinproject.com/paths/foundations/courses/foundations" }] },
  { day: 3, type: "work", phase: "ai-fundamentals", focus: "JS intro", morning: ["Read Odin JS fundamentals (Variables, Logic)"], afternoon: ["Write basic JS functions in browser console"], evening: "Day 3: JS logic clicked today.", shipByEod: "Working JS functions", resources: [{ label: "Odin JS foundations", url: "https://www.theodinproject.com/paths/foundations/courses/foundations" }] },
  { day: 4, type: "work", phase: "ai-fundamentals", focus: "JS DOM + UI", morning: ["Connect JS to Day 2 form to handle clicks"], afternoon: ["Use v0.dev to generate a modern form UI"], evening: "Day 4: v0 just wrote my UI in 10s.", shipByEod: "JS modifying DOM", resources: [{ label: "v0", url: "https://v0.dev" }] },
  { day: 5, type: "work", phase: "ai-fundamentals", focus: "Personal site", morning: ["Spin up a Next.js template in Cursor"], afternoon: ["Customize personal site, add bio + links"], evening: "Day 5: Building my dev portfolio.", shipByEod: "Local portfolio running", resources: [{ label: "Next.js", url: "https://nextjs.org/docs" }, { label: "Vercel", url: "https://vercel.com" }] },
  { day: 6, type: "rest", phase: "ai-fundamentals", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 7, type: "review", phase: "ai-fundamentals", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Weekly Notion sync. Plan next week."], evening: "Week 1 complete. Site is ready.", shipByEod: "Dashboard updated", resources: [{ label: "Notion", url: "https://www.notion.so" }] },
  { day: 8, type: "work", phase: "ai-fundamentals", focus: "Deploy personal", morning: ["Push repo to GitHub", "Connect to Vercel"], afternoon: ["Fix Vercel build errors with Cursor AI"], evening: "Day 8: I am live on the internet.", shipByEod: "Live name.vercel.app", resources: [{ label: "GitHub", url: "https://github.com" }, { label: "Vercel", url: "https://vercel.com" }] },
  { day: 9, type: "work", phase: "ai-fundamentals", focus: "API basics", morning: ["Learn what JSON and REST APIs are via Claude"], afternoon: ["Fetch random dog images via public API"], evening: "Day 9: Fetching real data.", shipByEod: "Dog image app", resources: [{ label: "Dog CEO API", url: "https://dog.ceo/dog-api/" }] },
  { day: 10, type: "work", phase: "ai-fundamentals", focus: "Prompt engineering", morning: ["Study Cursor Composer & Bolt.new docs"], afternoon: ["Use Bolt.new to build a full Todo app in minutes"], evening: "Day 10: Ship full apps with text.", shipByEod: "Bolt.new Todo URL", resources: [{ label: "Bolt.new", url: "https://bolt.new" }, { label: "Cursor docs", url: "https://docs.cursor.com" }] },

  // ---------------- PHASE 2 — Stack Crash — Day 11-25 ----------------
  { day: 11, type: "work", phase: "stack-crash", focus: "Next.js crash", morning: ["Next.js App Router docs: Routing, Layouts"], afternoon: ["Create 3 dummy pages, link them"], evening: "Day 11: Next.js routing makes sense.", shipByEod: "Multi-page local app", resources: [{ label: "Next.js App Router", url: "https://nextjs.org/docs/app" }] },
  { day: 12, type: "work", phase: "stack-crash", focus: "Supabase DB", morning: ["Create Supabase project", "Tasks table"], afternoon: ["Write Next.js server actions for CRUD tasks"], evening: "Day 12: Postgres on easy mode.", shipByEod: "Read/Write to Supabase", resources: [{ label: "Supabase", url: "https://supabase.com/docs" }] },
  { day: 13, type: "rest", phase: "stack-crash", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 14, type: "review", phase: "stack-crash", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Track hours + commits."], evening: "Week 2 summary: App router + DB.", shipByEod: "Dashboard updated", resources: [] },
  { day: 15, type: "work", phase: "stack-crash", focus: "App 1: Auth", morning: ["Setup Supabase Auth template via AI"], afternoon: ["Build login/sign-up screens"], evening: "Day 15: Auth implies real users!", shipByEod: "Working login flow", resources: [{ label: "Supabase Auth", url: "https://supabase.com/docs/guides/auth" }] },
  { day: 16, type: "work", phase: "stack-crash", focus: "App 1: UI/UX", morning: ["Build App 1 core logic (Note taker)"], afternoon: ["Use v0 to polish Tailwind styling"], evening: "Day 16: Finished throwaway app 1.", shipByEod: "Next.js + DB App 1", resources: [{ label: "v0", url: "https://v0.dev" }, { label: "Tailwind", url: "https://tailwindcss.com" }] },
  { day: 17, type: "work", phase: "stack-crash", focus: "App 2: API app", morning: ["App 2 setup", "Fetch OpenAI standard API"], afternoon: ["Build text-summarizer app logic"], evening: "Day 17: AI wrapped in my own UI.", shipByEod: "Working OpenAI fetch", resources: [{ label: "OpenAI API", url: "https://platform.openai.com/docs" }] },
  { day: 18, type: "work", phase: "stack-crash", focus: "App 2: Storage", morning: ["Add Supabase storage (Image upload)"], afternoon: ["Build UI to show uploaded image"], evening: "Day 18: File uploads working.", shipByEod: "App 2 with images", resources: [{ label: "Supabase Storage", url: "https://supabase.com/docs/guides/storage" }] },
  { day: 19, type: "work", phase: "stack-crash", focus: "App 3: Dashboard", morning: ["App 3 setup", "Build dashboard layout"], afternoon: ["Populate dashboard with fake charts via Cursor"], evening: "Day 19: Building dashboard UI.", shipByEod: "App 3 UI", resources: [{ label: "Recharts", url: "https://recharts.org" }] },
  { day: 20, type: "rest", phase: "stack-crash", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 21, type: "review", phase: "stack-crash", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Review Phase 3 goals."], evening: "Week 3: Tech stack is locked.", shipByEod: "Ready for validation", resources: [] },
  { day: 22, type: "work", phase: "stack-crash", focus: "Bolt it together", morning: ["Merge Auth + DB + Layout into one repo"], afternoon: ["Clean repo and push as your master template"], evening: "Day 22: Made my SaaS boilerplate.", shipByEod: "Master SaaS Repo", resources: [{ label: "Cursor Composer", url: "https://docs.cursor.com/composer" }] },
  { day: 23, type: "work", phase: "stack-crash", focus: "Build muscles", morning: ["Use Cursor Composer to refactor master repo"], afternoon: ["Add dark mode via Tailwind + Cursor"], evening: "Day 23: Expanding the boilerplate.", shipByEod: "Dark mode toggles", resources: [{ label: "Tailwind dark mode", url: "https://tailwindcss.com/docs/dark-mode" }] },
  { day: 24, type: "work", phase: "stack-crash", focus: "Reps", morning: ["Build a random mini-tool from master repo"], afternoon: ["Deploy mini-tool to Vercel"], evening: "Day 24: Deployed another tool.", shipByEod: "Mini-tool live URL", resources: [{ label: "Vercel", url: "https://vercel.com" }] },
  { day: 25, type: "work", phase: "stack-crash", focus: "Reps", morning: ["Break the code deliberately, let AI fix it"], afternoon: ["Study the AI's debugging steps"], evening: "Day 25: Learning how AI debugs.", shipByEod: "Debugging notes", resources: [{ label: "Cursor", url: "https://cursor.sh" }] },

  // ---------------- PHASE 3 — Validation & Concierge — Day 26-40 ----------------
  { day: 26, type: "work", phase: "validate", focus: "Ideation", morning: ["Scroll Reddit/X for complaints in a niche"], afternoon: ["List 10 painful B2B workflows you can fix"], evening: "Day 26: Hunting for real problems.", shipByEod: "10 Ideas in Notion", resources: [{ label: "r/SaaS", url: "https://reddit.com/r/SaaS" }, { label: "Indie Hackers", url: "https://indiehackers.com" }] },
  { day: 27, type: "work", phase: "validate", focus: "Filter ideas", morning: ["Rank ideas by pain level + reachability"], afternoon: ["Pick the top 1 idea to validate"], evening: "Day 27: I found a problem to solve.", shipByEod: "1 Winner selected", resources: [] },
  { day: 28, type: "review", phase: "validate", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Track hours + commits."], evening: "Week 3: Tech stack is locked.", shipByEod: "Dashboard updated", resources: [] },
  { day: 29, type: "review", phase: "validate", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Prep interview scripts."], evening: "Week 4: Ready to talk to users.", shipByEod: "Pitch script done", resources: [] },
  { day: 30, type: "work", phase: "validate", focus: "Prospecting", morning: ["Build a list of 50 target users (LinkedIn/X)"], afternoon: ["Cold DM 20 people asking for 5-min feedback"], evening: "Day 30: Sending cold messages.", shipByEod: "20 DMs sent", resources: [{ label: "LinkedIn", url: "https://linkedin.com" }, { label: "X", url: "https://twitter.com" }] },
  { day: 31, type: "work", phase: "validate", focus: "Interviews", morning: ["Do 3 calls/chats", "Ask 'how do you do X now?'"], afternoon: ["Log pain points. Adjust pitch."], evening: "Day 31: Talked to my first users.", shipByEod: "Interview notes", resources: [{ label: "Calendly", url: "https://calendly.com" }] },
  { day: 32, type: "work", phase: "validate", focus: "Concierge setup", morning: ["Setup Google Form + Calendly + Zapier"], afternoon: ["Create Stripe $20 Payment Link"], evening: "Day 32: Concierge MVP is live.", shipByEod: "Stripe Link working", resources: [{ label: "Stripe Payment Links", url: "https://stripe.com/payment-links" }, { label: "Zapier", url: "https://zapier.com" }, { label: "Google Forms", url: "https://docs.google.com/forms" }] },
  { day: 33, type: "work", phase: "validate", focus: "Pitch MVP", morning: ["Return to the 3 interviewees, pitch concierge"], afternoon: ["DM 20 more prospects"], evening: "Day 33: Asked for money today.", shipByEod: "20 more DMs", resources: [] },
  { day: 34, type: "work", phase: "validate", focus: "Hustle", morning: ["Do 5 more calls", "Offer the manual service"], afternoon: ["Follow up on Stripe links sent"], evening: "Day 34: Hustling for that first $20.", shipByEod: "5 calls done", resources: [{ label: "Stripe dashboard", url: "https://dashboard.stripe.com" }] },
  { day: 35, type: "rest", phase: "validate", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 36, type: "review", phase: "validate", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Evaluate No's. Iterate offer."], evening: "Week 5: Rejection is data.", shipByEod: "Offer adjusted", resources: [] },
  { day: 37, type: "work", phase: "validate", focus: "Adjust & DM", morning: ["Tweak target audience based on weekend review"], afternoon: ["Send 30 highly targeted DMs"], evening: "Day 37: Refining the pitch.", shipByEod: "30 DMs sent", resources: [] },
  { day: 38, type: "work", phase: "validate", focus: "The close", morning: ["Handle objections in DMs", "Jump on calls"], afternoon: ["Secure first $20", "If not, manual delivery for free"], evening: "Day 38: Got a commit.", shipByEod: "$20 Stripe Charge", resources: [{ label: "Stripe Payment Links", url: "https://stripe.com/payment-links" }, { label: "Notion", url: "https://www.notion.so" }] },
  { day: 39, type: "work", phase: "validate", focus: "Delivery (manual)", morning: ["Do the work manually for the client"], afternoon: ["Format result, email to client"], evening: "Day 39: Manual labor for MRR.", shipByEod: "Client received value", resources: [{ label: "Resend", url: "https://resend.com" }] },
  { day: 40, type: "work", phase: "validate", focus: "Specs", morning: ["Map the manual work into a 3-step software flow"], afternoon: ["Write Cursor prompt for the real MVP"], evening: "Day 40: Manual validated, time to build.", shipByEod: "Software spec sheet", resources: [{ label: "Cursor", url: "https://cursor.sh" }] },

  // ---------------- PHASE 4 — Real MVP Build — Day 41-65 ----------------
  { day: 41, type: "work", phase: "mvp-build", focus: "Fork template", morning: ["Clone Day 22 master boilerplate", "Set env vars"], afternoon: ["Build DB tables for the core workflow"], evening: "Day 41: Building the real thing.", shipByEod: "Vercel deployed shell", resources: [{ label: "Vercel", url: "https://vercel.com" }, { label: "Supabase", url: "https://supabase.com/docs" }] },
  { day: 42, type: "rest", phase: "mvp-build", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 43, type: "review", phase: "mvp-build", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Map build sprints."], evening: "Week 6: The build begins.", shipByEod: "Sprint board setup", resources: [] },
  { day: 44, type: "work", phase: "mvp-build", focus: "Core Feature 1", morning: ["Use Cursor to build Data Input UI"], afternoon: ["Build Supabase INSERT logic"], evening: "Day 44: First feature shipping.", shipByEod: "Data saving in DB", resources: [{ label: "Cursor", url: "https://cursor.sh" }, { label: "Supabase", url: "https://supabase.com/docs" }] },
  { day: 45, type: "work", phase: "mvp-build", focus: "Core Feature 2", morning: ["Use Cursor to build Processing logic"], afternoon: ["Connect OpenAI/logic layer"], evening: "Day 45: The engine works.", shipByEod: "Logic layer working", resources: [{ label: "OpenAI", url: "https://platform.openai.com/docs" }] },
  { day: 46, type: "work", phase: "mvp-build", focus: "Core Feature 3", morning: ["Build Data Output/Results UI"], afternoon: ["Polish core flow visually via v0"], evening: "Day 46: Core loop is functional.", shipByEod: "Output UI working", resources: [{ label: "v0", url: "https://v0.dev" }] },
  { day: 47, type: "work", phase: "mvp-build", focus: "Stripe billing", morning: ["Integrate Stripe checkout session logic"], afternoon: ["Add Stripe webhook to update Supabase"], evening: "Day 47: Stripe is wired up.", shipByEod: "Test card charges", resources: [{ label: "Stripe Checkout", url: "https://stripe.com/docs/payments/checkout" }, { label: "Stripe Webhooks", url: "https://stripe.com/docs/webhooks" }] },
  { day: 48, type: "work", phase: "mvp-build", focus: "Webhook polish", morning: ["Debug webhook edge cases via ngrok/Stripe CLI"], afternoon: ["Build User Settings page to show Plan Status"], evening: "Day 48: Subscriptions sync perfectly.", shipByEod: "Active plan in UI", resources: [{ label: "Stripe CLI", url: "https://stripe.com/docs/stripe-cli" }, { label: "ngrok", url: "https://ngrok.com" }] },
  { day: 49, type: "rest", phase: "mvp-build", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 50, type: "review", phase: "mvp-build", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Bug hunt MVP."], evening: "Week 7: It can take money.", shipByEod: "Bug list", resources: [] },
  { day: 51, type: "work", phase: "mvp-build", focus: "Resend email", morning: ["Setup Resend API", "Verify domain"], afternoon: ["Write Next.js API route for welcome email"], evening: "Day 51: Transactional emails working.", shipByEod: "Email hits inbox", resources: [{ label: "Resend", url: "https://resend.com/docs" }] },
  { day: 52, type: "work", phase: "mvp-build", focus: "Landing page", morning: ["Generate Landing Page via Lovable/v0"], afternoon: ["Copywrite: Hero, How it works, Pricing"], evening: "Day 52: Landing page looks pro.", shipByEod: "LP deployed", resources: [{ label: "Lovable", url: "https://lovable.dev" }, { label: "v0", url: "https://v0.dev" }] },
  { day: 53, type: "work", phase: "mvp-build", focus: "Protect routes", morning: ["Add middleware to block unpaid users"], afternoon: ["Redirect to pricing page if free tier empty"], evening: "Day 53: Putting up the paywall.", shipByEod: "Paywall functional", resources: [{ label: "Next.js middleware", url: "https://nextjs.org/docs/app/building-your-application/routing/middleware" }] },
  { day: 54, type: "work", phase: "mvp-build", focus: "PostHog", morning: ["Install PostHog snippet"], afternoon: ["Set up events for 'Signup' and 'Checkout'"], evening: "Day 54: Analytics installed.", shipByEod: "Events in PostHog", resources: [{ label: "PostHog Next.js", url: "https://posthog.com/docs/libraries/next-js" }] },
  { day: 55, type: "work", phase: "mvp-build", focus: "Polish", morning: ["Fix contrast, padding, loading states"], afternoon: ["Test entire flow from blank cache"], evening: "Day 55: Polish and bug squashing.", shipByEod: "V1 Prod ready", resources: [] },
  { day: 56, type: "rest", phase: "mvp-build", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 57, type: "review", phase: "mvp-build", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Prepare for Beta invites."], evening: "Week 8: MVP is fully baked.", shipByEod: "Beta invite list", resources: [] },
  { day: 58, type: "work", phase: "mvp-build", focus: "Self-serve test", morning: ["Sign up yourself, pay $5 to live Stripe"], afternoon: ["Manually process refund"], evening: "Day 58: I paid myself.", shipByEod: "Valid live transaction", resources: [{ label: "Stripe live", url: "https://dashboard.stripe.com" }] },
  { day: 59, type: "work", phase: "mvp-build", focus: "Edge cases", morning: ["Add password resets, rate limits"], afternoon: ["Clean up console errors and logs"], evening: "Day 59: Hardening the app.", shipByEod: "Zero console errors", resources: [] },
  { day: 60, type: "work", phase: "mvp-build", focus: "Waitlist DM", morning: ["Message 30 people from validation phase"], afternoon: ["Offer free Beta access for feedback"], evening: "Day 60: Beta invites are out.", shipByEod: "30 DMs sent", resources: [{ label: "Indie Hackers", url: "https://indiehackers.com" }, { label: "r/SaaS", url: "https://reddit.com/r/SaaS" }] },
  { day: 61, type: "work", phase: "mvp-build", focus: "Onboarding", morning: ["Create a 2-minute Loom demo video"], afternoon: ["Embed demo on the dashboard empty state"], evening: "Day 61: Automated onboarding.", shipByEod: "Loom uploaded", resources: [{ label: "Loom", url: "https://loom.com" }] },
  { day: 62, type: "work", phase: "mvp-build", focus: "SEO base", morning: ["Add meta tags, sitemap, OpenGraph tags"], afternoon: ["Submit to Google Search Console"], evening: "Day 62: Basic SEO setup.", shipByEod: "Metadata live", resources: [{ label: "Google Search Console", url: "https://search.google.com/search-console" }, { label: "OpenGraph protocol", url: "https://ogp.me" }] },
  { day: 63, type: "rest", phase: "mvp-build", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 64, type: "review", phase: "mvp-build", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Check Beta responses."], evening: "Week 9: Waiting on Beta.", shipByEod: "Beta metrics", resources: [] },
  { day: 65, type: "work", phase: "mvp-build", focus: "Beta push", morning: ["Chase unresponded DMs", "Post to Reddit/SaaS"], afternoon: ["Manually hand-hold first 5 users thru signup"], evening: "Day 65: Beta users are in.", shipByEod: "5 Active users", resources: [{ label: "r/SaaS", url: "https://reddit.com/r/SaaS" }] },

  // ---------------- PHASE 5 — Beta & Hardening — Day 66-80 ----------------
  { day: 66, type: "work", phase: "beta", focus: "Monitor", morning: ["Watch PostHog session replays"], afternoon: ["Note where users are getting stuck"], evening: "Day 66: Watching users struggle.", shipByEod: "Usability notes", resources: [{ label: "PostHog replays", url: "https://posthog.com/docs/session-replay" }] },
  { day: 67, type: "work", phase: "beta", focus: "Bug fixes", morning: ["Fix UI bugs identified in replays via Cursor"], afternoon: ["Push fixes to production silently"], evening: "Day 67: Rapid fixes pushing out.", shipByEod: "Fixes deployed", resources: [{ label: "Cursor", url: "https://cursor.sh" }] },
  { day: 68, type: "work", phase: "beta", focus: "Beta feedback", morning: ["DM Beta users: 'What's missing to pay for this?'"], afternoon: ["Aggregate feature requests"], evening: "Day 68: Gathering critical feedback.", shipByEod: "Feedback doc", resources: [] },
  { day: 69, type: "work", phase: "beta", focus: "Feature tweak", morning: ["Build the #1 requested tweak to increase value"], afternoon: ["Push to prod, notify the user who asked"], evening: "Day 69: Shipped user requested feature.", shipByEod: "Tweak live", resources: [] },
  { day: 70, type: "rest", phase: "beta", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 71, type: "review", phase: "beta", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Check churn/usage metrics."], evening: "Week 10: Product is stabilizing.", shipByEod: "Usage dashboard", resources: [{ label: "PostHog", url: "https://posthog.com" }] },
  { day: 72, type: "work", phase: "beta", focus: "Expansion", morning: ["Push for 10 more beta users via X / IndieHackers"], afternoon: ["Ensure they use it independently"], evening: "Day 72: Expanding beta cohort.", shipByEod: "15 total users", resources: [{ label: "X", url: "https://twitter.com" }, { label: "Indie Hackers", url: "https://indiehackers.com" }] },
  { day: 73, type: "work", phase: "beta", focus: "Monitor", morning: ["PostHog replay review", "Check error logs in Vercel"], afternoon: ["Fix backend edge cases"], evening: "Day 73: Backend bug hunting.", shipByEod: "Code patched", resources: [{ label: "Vercel logs", url: "https://vercel.com/docs/observability" }] },
  { day: 74, type: "work", phase: "beta", focus: "Pricing check", morning: ["Adjust Stripe pricing based on Beta feedback"], afternoon: ["Update Landing page copy"], evening: "Day 74: Pricing is locked.", shipByEod: "Stripe Tiers updated", resources: [{ label: "Stripe Pricing", url: "https://stripe.com/docs/pricing" }] },
  { day: 75, type: "work", phase: "beta", focus: "Pre-launch asset", morning: ["Design a clean launch image/GIF for Product Hunt"], afternoon: ["Write the PH maker comment"], evening: "Day 75: Prepping PH assets.", shipByEod: "Launch assets ready", resources: [{ label: "Product Hunt Ship", url: "https://www.producthunt.com/posts/new" }] },

  // ---------------- PHASE 6 — Launch — Day 76-90 ----------------
  { day: 76, type: "work", phase: "launch", focus: "Teaser", morning: ["Post a 30s teaser video on X/LinkedIn"], afternoon: ["DM 20 peers to notify them of launch day"], evening: "Day 76: Launch happens on Tuesday.", shipByEod: "Teaser live", resources: [{ label: "LinkedIn", url: "https://linkedin.com" }] },
  { day: 77, type: "rest", phase: "launch", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 78, type: "review", phase: "launch", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Final sweep of all servers/DBs."], evening: "Week 11: Launch eve.", shipByEod: "Servers green", resources: [] },
  { day: 79, type: "work", phase: "launch", focus: "LAUNCH DAY", morning: ["00:01 PST Submit to Product Hunt"], afternoon: ["Reply to all comments", "Ask network to review"], evening: "Day 79: WE ARE LIVE ON PH!", shipByEod: "PH URL live", resources: [{ label: "Product Hunt", url: "https://www.producthunt.com" }] },
  { day: 80, type: "work", phase: "launch", focus: "PH follow-up", morning: ["Keep momentum on PH", "Hunt for bugs from spike"], afternoon: ["Send a thank you on X with metrics"], evening: "Day 80: Surviving the launch spike.", shipByEod: "Traffic metrics", resources: [] },
  { day: 81, type: "work", phase: "launch", focus: "IH launch", morning: ["Post a deep-dive 'How I built this' on IndieHackers"], afternoon: ["Cross-post to r/SideProject"], evening: "Day 81: Launching on IH now.", shipByEod: "IH Post live", resources: [{ label: "Indie Hackers", url: "https://indiehackers.com" }, { label: "r/SideProject", url: "https://reddit.com/r/SideProject" }] },
  { day: 82, type: "work", phase: "launch", focus: "Support 911", morning: ["Reply to all support tickets from PH users"], afternoon: ["Use Cursor to hotfix critical launch bugs"], evening: "Day 82: Support mode activated.", shipByEod: "Inbox Zero", resources: [{ label: "Cursor", url: "https://cursor.sh" }] },
  { day: 83, type: "work", phase: "launch", focus: "Lead capture", morning: ["Export all non-paying email signups"], afternoon: ["Load into Resend for a 3-day drip sequence"], evening: "Day 83: Chasing the bounce.", shipByEod: "Drip campaign live", resources: [{ label: "Resend", url: "https://resend.com/docs" }] },
  { day: 84, type: "rest", phase: "launch", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 85, type: "review", phase: "launch", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Launch post-mortem. Calculate MRR."], evening: "Week 12: Launch data is in.", shipByEod: "Post-mortem doc", resources: [] },
  { day: 86, type: "work", phase: "launch", focus: "Push sales", morning: ["Identify highly engaged free users in PostHog"], afternoon: ["Send a 1-to-1 email offering 1:1 onboarding"], evening: "Day 86: Turning free to paid.", shipByEod: "10 Sales emails", resources: [{ label: "PostHog", url: "https://posthog.com" }] },
  { day: 87, type: "work", phase: "launch", focus: "Content SEO", morning: ["Ask AI to generate a technical blog outline"], afternoon: ["Write a long-form SEO post. Publish via Next.js."], evening: "Day 87: Starting the SEO flywheel.", shipByEod: "SEO Post 1 live", resources: [{ label: "Next.js MDX", url: "https://nextjs.org/docs/app/guides/mdx" }] },
  { day: 88, type: "work", phase: "launch", focus: "Cold email", morning: ["Scrape 50 target customer emails via Apollo/Hunter"], afternoon: ["Send 25 personalized cold pitches"], evening: "Day 88: Cold outbound machine.", shipByEod: "25 cold emails", resources: [{ label: "Apollo", url: "https://apollo.io" }, { label: "Hunter", url: "https://hunter.io" }] },
  { day: 89, type: "work", phase: "launch", focus: "Cold email 2", morning: ["Send remaining 25 cold pitches"], afternoon: ["Reply to inbound leads"], evening: "Day 89: 50 cold emails sent.", shipByEod: "50 total sent", resources: [] },
  { day: 90, type: "work", phase: "launch", focus: "Content 2", morning: ["Write SEO Post 2 targeting competitor alternatives"], afternoon: ["Submit URL to Google Indexer manually"], evening: "Day 90: Ranking for '[Competitor] Alternative'.", shipByEod: "SEO Post 2 live", resources: [{ label: "Google Search Console", url: "https://search.google.com/search-console" }] },

  // ---------------- PHASE 7 — MRR Push — Day 91-100 ----------------
  { day: 91, type: "rest", phase: "mrr-push", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 92, type: "review", phase: "mrr-push", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Weekly MRR audit. What channel works?"], evening: "Week 13: Focusing on what pays.", shipByEod: "Channel mapped", resources: [] },
  { day: 93, type: "work", phase: "mrr-push", focus: "Demo day", morning: ["Jump on video calls with any interested leads"], afternoon: ["Offer a small discount to close on the call"], evening: "Day 93: Pushing the close.", shipByEod: "Demos completed", resources: [{ label: "Calendly", url: "https://calendly.com" }] },
  { day: 94, type: "work", phase: "mrr-push", focus: "Affiliates", morning: ["DM 5 newsletters/influencers in the niche"], afternoon: ["Offer 30% affiliate cut via Stripe for a shoutout"], evening: "Day 94: Setting up affiliates.", shipByEod: "Affiliates pending", resources: [{ label: "Stripe affiliates", url: "https://stripe.com/docs/payments/checkout/affiliates" }] },
  { day: 95, type: "work", phase: "mrr-push", focus: "Win-back", morning: ["Email PH users whose trials expired"], afternoon: ["Ask them why they didn't upgrade"], evening: "Day 95: Fighting churn.", shipByEod: "Win-back emails out", resources: [{ label: "Resend", url: "https://resend.com" }] },
  { day: 96, type: "work", phase: "mrr-push", focus: "Core loop", morning: ["Build 1 mini-feature based on paid user requests"], afternoon: ["Push mini-feature live"], evening: "Day 96: Keeping paying users happy.", shipByEod: "Mini-feature live", resources: [] },
  { day: 97, type: "work", phase: "mrr-push", focus: "Follow-ups", morning: ["Reply to all cold email follow-ups"], afternoon: ["Schedule final push demos"], evening: "Day 97: Following up on outbound.", shipByEod: "Demos scheduled", resources: [] },
  { day: 98, type: "rest", phase: "mrr-push", focus: "REST", morning: ["Off screen"], afternoon: ["Off screen"], evening: "—", shipByEod: "Recharge", resources: [] },
  { day: 99, type: "review", phase: "mrr-push", focus: "REVIEW", morning: ["—"], afternoon: ["90m: Final MRR tally."], evening: "Week 14: The Final countdown.", shipByEod: "Strategy locked", resources: [] },
  { day: 100, type: "work", phase: "mrr-push", focus: "🏁 Finish Line", morning: ["Hand-sell, DM, call, text until 3 paid active"], afternoon: ["Write a 1,000-word retrospective on X/Reddit"], evening: "Day 100: Reached first real MRR.", shipByEod: "🎉 3 Paying Customers!", resources: [{ label: "X", url: "https://twitter.com" }, { label: "r/SideProject", url: "https://reddit.com/r/SideProject" }] },
];

// =====================================================
// HELPERS
// =====================================================

export function getPhase(id: PhaseId): Phase {
  const p = PHASES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown phase: ${id}`);
  return p;
}

export function getPhaseForDay(day: number): Phase {
  const p =
    PHASES.find((x) => day >= x.dayStart && day <= x.dayEnd) ??
    PHASES[PHASES.length - 1];
  return p;
}

export function getDaySchedule(day: number): ScheduleEntry | null {
  return HUNDRED_DAY_SCHEDULE.find((s) => s.day === day) ?? null;
}

export function getAction(id: string): KeyAction {
  const a = KEY_ACTIONS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown action: ${id}`);
  return a;
}

export function getOutput(id: string): OutputMilestone {
  const o = OUTPUTS.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown output: ${id}`);
  return o;
}

export function getInput(id: string): DailyInput {
  const i = DAILY_INPUTS.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown input: ${id}`);
  return i;
}

export function getPrerequisitesForPhase(phaseId: PhaseId): Prerequisite[] {
  return PREREQUISITES.filter((p) => p.phaseIds.includes(phaseId));
}
