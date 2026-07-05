// The Indie Dev Boss Protocol: Zero → MRR — 100-day challenge
// All roadmap content rendered as static data so the app displays the protocol
// verbatim. Used across every page in the dashboard.

export type PhaseId =
  | "phase:fundamentals"
  | "phase:web-basics"
  | "phase:fullstack-js"
  | "phase:validation"
  | "phase:mvp-launch"
  | "phase:growth";

export type ActionStatus = "not_started" | "in_progress" | "completed";
export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export interface Phase {
  id: PhaseId;
  number: number;
  name: string;
  label: string; // human title
  window: string; // e.g. "Day 1-30"
  dayStart: number; // 1-based day count from Day 1
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
  dailyTime?: string;
  deliverable?: string;
  method?: string;
  successCriteria: string;
  channels?: { label: string; detail: string }[];
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
  day: number; // expected day by which this milestone should hit
  verification: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: "learning" | "code-stack" | "community" | "book";
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
  weekday: string;
  focus: string;
  schedule: string[];
  ship: string;
}

export type PrerequisiteCategory =
  | "before-day-1"
  | "phase-stack"
  | "community"
  | "paid";

export interface Prerequisite {
  id: string;
  name: string;
  signupUrl: string;
  cost: string; // "Free", "Free tier", "$20/mo"
  category: PrerequisiteCategory;
  phaseIds: PhaseId[];
  blurb: string;
  setupTip?: string;
}

// -------- HORIZON & PHILOSOPHY --------

export const PHILOSOPHY = {
  title: "The Indie Dev Boss Protocol",
  shortLabel: "Pieter Levels doctrine",
  pillars: [
    "Revenue is the only KPI that matters.",
    "Tutorials are procrastination.",
    "Ship ugly, ship weekly, charge from day one.",
  ],
  horizon: "100 days from absolute zero to first $1 MRR, then 100 more days to $1,000+ MRR.",
  totalDays: 200,
  challengeDays: 100,
  operatingModel: "Solo founder, build-in-public, distribution-first, ship before ready.",
};

// -------- 6 PHASES (100-day plan) --------

export const PHASES: Phase[] = [
  {
    id: "phase:fundamentals",
    number: 1,
    name: "fundamentals",
    label: "The Logic Layer",
    window: "Day 1-30",
    dayStart: 1,
    dayEnd: 30,
    purpose:
      "Teach your brain to think in code. Until you can pseudo-code a for-loop on paper, every framework will feel like magic.",
    internals:
      "Harvard CS50x (free, cs50.harvard.edu/x/2025) is the only serious starting point. It is 30 days of C basics, then Python, SQL, HTML/CSS/JS.",
    mechanics:
      "Watch the lecture in the morning, do the problem set in the afternoon, ship Friday to GitHub. Do not skip problem sets.",
    exitGate:
      "CS50x Week 5 problem sets passed (>= 70% on each) + first HTML page rendered. output:cs50-cert stored in dashboard.",
    connectsTo:
      "Feeds phase:web-basics (the HTML/CSS week) and phase:fullstack-js (the SQL week becomes your Supabase queries).",
  },
  {
    id: "phase:web-basics",
    number: 2,
    name: "web-basics",
    label: "The Visual Layer",
    window: "Day 31-50",
    dayStart: 31,
    dayEnd: 50,
    purpose: "You must be able to put pixels on a screen by yourself.",
    internals:
      "Complete The Odin Project (theodinproject.com) Foundations course (HTML, CSS, basic JS via DOM).",
    mechanics:
      "Build the Odin Recipes page and the Rock Paper Scissors console game as graded deliverables. Then build a personal landing page and deploy it.",
    exitGate:
      "Personal one-page site deployed to a *.vercel.app domain with HTTPS — curl returns 200. output:landing-live stored.",
    connectsTo:
      "Feeds phase:fullstack-js. Your landing page becomes the template for every future SaaS landing page.",
  },
  {
    id: "phase:fullstack-js",
    number: 3,
    name: "fullstack-js",
    label: "The Builder Layer",
    window: "Day 51-75",
    dayStart: 51,
    dayEnd: 75,
    purpose: "Learn one modern stack deeply. Do not dabble.",
    internals:
      "Stack = Next.js (App Router) + TypeScript + Supabase + Vercel. Resources: fullstackopen.com (parts 1-9) plus the official Next.js tutorial (nextjs.org/learn).",
    mechanics:
      "Rebuild a Twitter clone (tutorial). Then rebuild a Notion clone (tutorial). Then modify it: add Stripe, add auth, add a database table. After the phase you can ship any SaaS skeleton.",
    exitGate:
      "Reusable nextjs-supabase-stripe template repo: sign up with email → Supabase Auth creates user → row in Postgres → dashboard redirect. Login works after logout. output:auth-works stored.",
    connectsTo:
      "Feeds phase:validation. You can build a landing page with email capture and a waitlist counter.",
  },
  {
    id: "phase:validation",
    number: 4,
    name: "validation",
    label: "The Money Layer",
    window: "Day 76-85",
    dayStart: 76,
    dayEnd: 85,
    purpose: "Confirm someone will pay before you spend months building.",
    internals:
      "Concierge MVP = you manually deliver the service to 5-10 people via Google Forms, Notion, Calendly, and a Stripe Payment Link (no code). Pieter Levels calls this \"manual until it hurts.\"",
    mechanics:
      "Talk to 30 potential users (cold DMs on X/Twitter, Reddit posts). Find 5 to pay you $20 manually. If 5 won't pay, kill the idea. Pivot.",
    exitGate:
      "5 paying customers OR 100 waitlist signups via concierge MVP. output:first-payment stored.",
    connectsTo:
      "Feeds phase:mvp-launch. You now know exactly which ONE feature to ship first.",
  },
  {
    id: "phase:mvp-launch",
    number: 5,
    name: "mvp-launch",
    label: "The Public Layer",
    window: "Day 86-100",
    dayStart: 86,
    dayEnd: 100,
    purpose: "Automate the concierge MVP into a real product and launch it publicly.",
    internals:
      "Build the single core feature from Phase 4. Add Stripe Checkout (test mode → live). Add Resend for transactional email. Deploy to Vercel. Submit to Product Hunt.",
    mechanics:
      "15-day sprint: Day 86-92 build. Day 93-95 dogfood + 10 beta users. Day 96-99 fix what broke. Day 100 launch on Product Hunt + Indie Hackers.",
    exitGate:
      "Public launch on Product Hunt with live Stripe checkout, top-5-of-the-day with 100+ upvotes + the page generates the FIRST $1 MRR. output:ph-launch stored.",
    connectsTo:
      "Feeds phase:growth. Every new customer is a PostHog event you study.",
  },
  {
    id: "phase:growth",
    number: 6,
    name: "growth",
    label: "The Compounding Layer",
    window: "Day 101-200",
    dayStart: 101,
    dayEnd: 200,
    purpose: "Find repeatable acquisition channels and reduce churn.",
    internals:
      "PostHog analytics → identify the activation event → ship toward it. Write 2 SEO articles/week. Send 1 cold email/week to a podcast host. Iterate pricing tiers.",
    mechanics:
      "Weekly Sunday review of MRR, churn, NPS. Double down on whatever channel brings a paying customer for < $20 CAC.",
    exitGate:
      "$1,000 MRR, churn < 5%, NPS > 30. output:1k-mrr stored.",
    connectsTo:
      "The whole system. This is where the indie business becomes a real business.",
  },
];

// -------- 6 DAILY INPUTS --------

export const DAILY_INPUTS: DailyInput[] = [
  {
    id: "input:code-1h",
    label: "Write code",
    frequency: "Daily, minimum 90 min",
    owner: "You",
    description:
      "The floor, not the ceiling. 90 focused minutes beats 6 hours of distracted coding. Phone in another room.",
  },
  {
    id: "input:ship-1-thing",
    label: "Ship one thing",
    frequency: "Daily",
    owner: "You",
    description:
      "Push to GitHub or deploy to Vercel. Even a 4-line CSS fix counts. Velocity compounds.",
  },
  {
    id: "input:build-in-public",
    label: "Build in public",
    frequency: "Daily, before lunch",
    owner: "You",
    description:
      "Post progress to X + Makerlog. One line: what you shipped or learned. #buildinpublic.",
  },
  {
    id: "input:customer-talk",
    label: "Talk to 1 potential user",
    frequency: "2x/week in Phase 4-6",
    owner: "You",
    description:
      "Pre-launch: cold DMs on X/Twitter and Reddit posts. Post-launch: support email replies count.",
  },
  {
    id: "input:learn-30m",
    label: "Read docs / chapter",
    frequency: "Daily",
    owner: "You",
    description:
      "Stop tutorial hell after Day 75. Read the actual docs for the tool you're using today.",
  },
  {
    id: "input:track-metrics",
    label: "Update MRR/churn dashboard",
    frequency: "Every 30 days",
    owner: "You",
    description:
      "Compute: hours coded / goal, days since last deploy, mrr_week / mrr_week_last_week. Post to X.",
  },
];

// -------- 6 OUTPUTS / MILESTONES (100-day timeline) --------

export const OUTPUTS: OutputMilestone[] = [
  {
    id: "output:cs50-cert",
    label: "CS50x certificate",
    phase: 1,
    day: 30,
    verification: "Certificate URL pasted in dashboard.",
  },
  {
    id: "output:landing-live",
    label: "Personal site on Vercel",
    phase: 2,
    day: 50,
    verification: "Live URL returns 200.",
  },
  {
    id: "output:auth-works",
    label: "Next.js app with login",
    phase: 3,
    day: 75,
    verification: "Screenshot in dashboard.",
  },
  {
    id: "output:first-payment",
    label: "$1 from a real human",
    phase: 4,
    day: 85,
    verification: "Stripe dashboard screenshot.",
  },
  {
    id: "output:ph-launch",
    label: "Product Hunt front page",
    phase: 5,
    day: 100,
    verification: "Product Hunt URL in dashboard.",
  },
  {
    id: "output:1k-mrr",
    label: "$1,000 MRR",
    phase: 6,
    day: 200,
    verification: "Stripe dashboard, last 30 days.",
  },
];

// -------- 11 KEY ACTIONS (100-day timeline) --------

export const KEY_ACTIONS: KeyAction[] = [
  {
    id: "action:01-complete-cs50",
    title: "Complete CS50x Weeks 1-5",
    phaseId: "phase:fundamentals",
    window: "Day 1-30",
    resource: "cs50.harvard.edu/x/2025",
    dailyTime: "3 hrs (1 lecture + 2 hrs problem set)",
    successCriteria:
      "All problem sets for Weeks 1-5 submitted, >= 70% on each. Submit final project.",
  },
  {
    id: "action:02-build-odin-foundations",
    title: "Build Odin Project Foundations",
    phaseId: "phase:web-basics",
    window: "Day 31-50",
    resource: "theodinproject.com/paths/foundations",
    deliverable:
      "Odin Recipes page, Rock-Paper-Scissors console game, an HTML form with JS validation.",
    successCriteria: "Push all 3 to a public GitHub repo.",
  },
  {
    id: "action:03-deploy-personal-site",
    title: "Deploy personal site",
    phaseId: "phase:web-basics",
    window: "Day 50",
    resource: "vercel.com (free tier)",
    deliverable:
      "One-page site (your name, your photo, links to GitHub + X) deployed to a *.vercel.app domain with HTTPS.",
    successCriteria: "curl https://<your-site>.vercel.app returns 200.",
  },
  {
    id: "action:04-fullstackopen-parts-1-9",
    title: "Complete Full Stack Open Parts 1-9",
    phaseId: "phase:fullstack-js",
    window: "Day 52-75",
    resource: "fullstackopen.com",
    dailyTime: "2 hrs (lecture + exercise)",
    deliverable:
      "Coursework exercises, plus 2 personal clones (Twitter and a simple Trello).",
    successCriteria: "Both clones deployed to Vercel with a database backend.",
  },
  {
    id: "action:05-stack-setup-template",
    title: "Build the stack setup template",
    phaseId: "phase:fullstack-js",
    window: "Day 75",
    resource: "supabase.com, nextjs.org, vercel.com",
    deliverable:
      "A reusable nextjs-supabase-stripe template repo you can fork for every future SaaS.",
    successCriteria:
      "Sign up with email → Supabase Auth creates user → row written to Postgres → user redirected to dashboard. Login works after logout.",
  },
  {
    id: "action:06-talk-to-30-users",
    title: "Talk to 30 potential users",
    phaseId: "phase:validation",
    window: "Day 76-80",
    resource: "indiehackers.com, X/Twitter DMs, Reddit.",
    method:
      "Cold DM 30 people who loudly complain about a specific workflow you can fix. Ask 5 questions. Listen.",
    successCriteria: "30 conversations logged in Notion with quoted pain points.",
  },
  {
    id: "action:07-concierge-mvp",
    title: "Run a concierge MVP",
    phaseId: "phase:validation",
    window: "Day 81-85",
    resource:
      "Google Forms, Calendly, Stripe Payment Link (stripe.com/payment-links), Notion.",
    method:
      "Manually deliver the service to 5 paying customers for $20/mo. No custom code.",
    successCriteria: "5 humans have paid you real money and used the service.",
  },
  {
    id: "action:08-build-real-mvp",
    title: "Build the real MVP",
    phaseId: "phase:mvp-launch",
    window: "Day 86-95",
    resource: "Next.js + Supabase + Stripe Checkout",
    method:
      "Automate exactly what you did manually in action:07. Ship in 10 days.",
    successCriteria:
      "Real signup → real Stripe charge → real email (via Resend) → real dashboard.",
  },
  {
    id: "action:09-launch-product-hunt",
    title: "Launch on Product Hunt",
    phaseId: "phase:mvp-launch",
    window: "Day 99-100",
    resource: "producthunt.com — use the launcher guide.",
    successCriteria:
      "Page live, top-5-of-the-day, 100+ upvotes, 20+ new signups, FIRST $1 IN.",
  },
  {
    id: "action:10-distribution-machine",
    title: "Run the distribution machine",
    phaseId: "phase:growth",
    window: "Day 101-200, ongoing",
    method: "Compounding weekly distribution across channels.",
    channels: [
      {
        label: "X / Twitter",
        detail: "3 build-in-public posts/week, tag #buildinpublic",
      },
      {
        label: "SEO",
        detail: "2 long-form posts/week on your blog (Next.js + MDX)",
      },
      {
        label: "Reddit",
        detail:
          "1 helpful comment/day in target subreddits, NO spamming",
      },
      {
        label: "Cold email",
        detail: "1 podcast pitch/week to hosts in your niche",
      },
    ],
    successCriteria: "1 channel produces >= 1 paying customer per $20 spent.",
  },
  {
    id: "action:11-monthly-review",
    title: "Run the protocol review",
    phaseId: "phase:fundamentals",
    window: "every 30 days, 2 hours",
    method:
      "Update dashboard. Compute MRR, churn, NPS, hours, deploys. Write a long-form post-mortem and publish to X.",
    successCriteria: "Published post-mortem URL.",
  },
];

// -------- RESOURCES --------

export const RESOURCES: Resource[] = [
  // Learning stack
  {
    id: "res:cs50",
    name: "CS50x (Harvard)",
    url: "https://cs50.harvard.edu/x/2025",
    type: "learning",
    note: "Teaches thinking. Free. The only thing you need in Day 1-30.",
  },
  {
    id: "res:odin",
    name: "The Odin Project",
    url: "https://www.theodinproject.com",
    type: "learning",
    note: "Teaches full-stack web. Foundations → full-stack curriculum.",
  },
  {
    id: "res:fso",
    name: "Full Stack Open",
    url: "https://fullstackopen.com",
    type: "learning",
    note:
      "University of Helsinki. React + Node + TypeScript. Parts 1-9.",
  },
  // Code stack
  {
    id: "res:next",
    name: "Next.js",
    url: "https://nextjs.org",
    type: "code-stack",
    note: "Frontend + backend in one. The only framework you should learn.",
  },
  {
    id: "res:supabase",
    name: "Supabase",
    url: "https://supabase.com",
    type: "code-stack",
    note: "Postgres database + auth + storage. The Rails of 2025.",
  },
  {
    id: "res:vercel",
    name: "Vercel",
    url: "https://vercel.com",
    type: "code-stack",
    note: "Hosting. Free tier is enough until you have paying customers.",
  },
  {
    id: "res:stripe",
    name: "Stripe",
    url: "https://stripe.com",
    type: "code-stack",
    note: "Payments. Use Payment Links in Phase 4, Checkout in Phase 5.",
  },
  {
    id: "res:resend",
    name: "Resend",
    url: "https://resend.com",
    type: "code-stack",
    note: "Transactional email. Welcome + receipts. Replaces SMTP.",
  },
  {
    id: "res:posthog",
    name: "PostHog",
    url: "https://posthog.com",
    type: "code-stack",
    note:
      "Product analytics. Find your activation event, ship toward it.",
  },
  {
    id: "res:cursor",
    name: "Cursor",
    url: "https://cursor.sh",
    type: "code-stack",
    note:
      "AI editor. The only expense you should have for the first 100 days.",
    cost: "$20/mo",
  },
  {
    id: "res:notion",
    name: "Notion",
    url: "https://www.notion.so",
    type: "code-stack",
    note:
      "Workspace + docs + databases. The protocol's old-school notebook. Free tier is enough.",
  },
  // Community / playbooks
  {
    id: "res:indiehackers",
    name: "Indie Hackers",
    url: "https://indiehackers.com",
    type: "community",
    note: "Interviews + forums. The accountability loop.",
  },
  {
    id: "res:rsaas",
    name: "r/SaaS",
    url: "https://reddit.com/r/SaaS",
    type: "community",
    note: "Daily Q&A. Where founders compare CAC and churn.",
  },
  {
    id: "res:r-indie",
    name: "r/IndieHackers",
    url: "https://reddit.com/r/IndieHackers",
    type: "community",
    note: "Build-in-public accountability.",
  },
  {
    id: "res:makebook",
    name: "Make Book (Pieter Levels)",
    url: "https://makebook.io",
    type: "book",
    note: "The playbook. Buy it on Day 1.",
    cost: "$30",
  },
  {
    id: "res:microconf",
    name: "MicroConf YouTube",
    url: "https://microconf.com/youtube",
    type: "community",
    note: "Free founder talks. Rob Walling + MicroConf crew.",
  },
];

// -------- HARD RULES --------

export const HARD_RULES: HardRule[] = [
  {
    id: "rule:no-tutorial",
    text: "No tutorial after Day 75. You learn by shipping.",
    annotation:
      "Every day past Day 75 you spend in a Udemy course is a day your competitor ships.",
  },
  {
    id: "rule:no-stack-switch",
    text:
      "No new framework unless the current stack genuinely cannot do something.",
    annotation:
      "Stick with Next.js + Supabase + Vercel. Switching costs weeks and $0 in return.",
  },
  {
    id: "rule:charge-from-day-one",
    text:
      "Charge from Day 76. Free users lie; paying users tell the truth.",
    annotation:
      "If 5 people won't pay $20, you don't have a business. Pivot.",
  },
  {
    id: "rule:one-product",
    text:
      "One product at a time. Side projects stacked on side projects = $0 MRR forever.",
    annotation:
      "The streak must be killed. Side projects require a separate notebook.",
  },
  {
    id: "rule:focus-90",
    text:
      "90 minutes of focused coding beats 6 hours of distracted coding. Phone in another room.",
    annotation:
      "Do not negotiate with yourself on this one. The phone is the silent killer.",
  },
];

// -------- DAILY NON-NEGOTIABLES --------

export const NON_NEGOTIABLES: NonNegotiable[] = [
  {
    time: "09:00 sharp",
    rule: "Open CS50 / Odin Project. No email until lunch.",
  },
  {
    time: "14:00-14:30",
    rule: "Build-in-public post (X + Makerlog).",
  },
  {
    time: "17:00",
    rule:
      "Stop. Hard stop. Burnout kills more indie dreams than bad code does.",
  },
];

// -------- 30-DAY MONTH 1 SCHEDULE (Day 1-30 detail) --------

export const MONTH_1_SCHEDULE: ScheduleEntry[] = [
  { day: 1, weekday: "Mon", focus: "CS50x Week 1 lecture + Problem Set 0", schedule: ["09:00-11:00 lecture", "11:30-13:00 PS0 scratch", "14:00-15:00 build-in-public X post", "15:30-16:30 lecture notes in Notion"], ship: "First X post: 'Day 1: starting CS50x.'" },
  { day: 2, weekday: "Tue", focus: "CS50x PS1 (C, hello world)", schedule: ["09:00-12:00 PS1, full focus", "12:00-13:00 lunch", "13:00-14:00 retry any failed tests", "14:30-15:00 GitHub commit + push"], ship: "GitHub commit URL in Notion" },
  { day: 3, weekday: "Wed", focus: "CS50x PS1 deep dive", schedule: ["No new tutorial; only fix what failed"], ship: "All PS1 checks passing locally" },
  { day: 4, weekday: "Thu", focus: "CS50x PS2 (C, arrays)", schedule: ["09:00-11:00 read spec", "11:30-13:00 implement", "14:00-15:00 debug", "15:30-16:00 commit"], ship: "PS2 first submission attempt" },
  { day: 5, weekday: "Fri", focus: "CS50x Week 1 office hours + week review", schedule: ["09:00-10:00 rewatch lecture (1.5x)", "10:30-12:00 redo failing PS", "13:00-14:00 ship best version", "14:30-15:30 write a 200-word X recap post tagged #cs50"], ship: "Weekly X thread: 5-day learnings" },
  { day: 6, weekday: "Mon", focus: "CS50x Week 2 (C, strings)", schedule: ["09:00-11:00 lecture", "11:30-13:00 PS3", "14:00-15:00 hard problems only"], ship: "All Day 1-5 PS graded >= 70%" },
  { day: 7, weekday: "Tue", focus: "CS50x PS3 hardening", schedule: ["09:00-12:00 rewrite from blank paper", "13:00-14:00 test edge cases", "14:30-15:30 commit"], ship: "Clean commit, no warnings" },
  { day: 8, weekday: "Wed", focus: "CS50x PS4 (C, memory)", schedule: ["Same structure as Day 6"], ship: "Submission ID captured in Notion" },
  { day: 9, weekday: "Thu", focus: "CS50x PS4 continued", schedule: ["Bug hunting only"], ship: "Submission accepted" },
  { day: 10, weekday: "Fri", focus: "Week 2 review", schedule: ["Rewatch + Office Hours + recap X thread"], ship: "Week 2 report card in Notion" },
  { day: 11, weekday: "Mon", focus: "CS50x Week 3 (algorithms)", schedule: ["Same shape as Day 6"], ship: "Lecture notes in Notion" },
  { day: 12, weekday: "Tue", focus: "PS5 (sorting)", schedule: ["09:00-12:00 brute force first", "13:00-14:00 optimize"], ship: "Working sort" },
  { day: 13, weekday: "Wed", focus: "PS5 optimization", schedule: ["Time-complexity pass"], ship: "Quicksort/merge sort impl" },
  { day: 14, weekday: "Thu", focus: "PS6 (recursion)", schedule: ["Spec → blank paper → code"], ship: "Submission accepted" },
  { day: 15, weekday: "Fri", focus: "Week 3 review", schedule: ["Recap X thread"], ship: "GitHub has 2+ weeks of code so far" },
  { day: 16, weekday: "Mon", focus: "Week 4 (data structures)", schedule: ["Lecture + PS7 (linked lists)"], ship: "Theory read, PS7 spec understood" },
  { day: 17, weekday: "Tue", focus: "PS7 implementation", schedule: ["4-hour deep build"], ship: "Linked list passing tests" },
  { day: 18, weekday: "Wed", focus: "PS8 (hash tables)", schedule: ["Spec → code"], ship: "Hash map passing tests" },
  { day: 19, weekday: "Thu", focus: "PS8 hardening", schedule: ["Edge cases + memory"], ship: "Memory-clean submission" },
  { day: 20, weekday: "Fri", focus: "Week 4 review", schedule: ["Recap thread"], ship: "4 of 4 weeks complete" },
  { day: 21, weekday: "Mon", focus: "Week 5 (Python) transition", schedule: ["First Python lecture + PS9"], ship: "First Python script runs" },
  { day: 22, weekday: "Tue", focus: "PS9 (Python basics)", schedule: ["List/dict/string exercises"], ship: "All PS9 tests pass" },
  { day: 23, weekday: "Wed", focus: "PS10 (Python OOP)", schedule: ["Class design pattern"], ship: "Submission accepted" },
  { day: 24, weekday: "Thu", focus: "PS10 hardening", schedule: ["Refactor + tests"], ship: "Clean OOP code on GitHub" },
  { day: 25, weekday: "Fri", focus: "Week 5 review + SQL intro", schedule: ["First SQL lecture"], ship: "Capstone project idea picked" },
  { day: 26, weekday: "Mon", focus: "PS11 (SQL)", schedule: ["3-day deep dive begins"], ship: "Working queries on SQLite" },
  { day: 27, weekday: "Tue", focus: "PS11 cont.", schedule: ["Continue SQL practice"], ship: "Multi-table queries" },
  { day: 28, weekday: "Wed", focus: "PS11 cont.", schedule: ["Hardening"], ship: "All SQL passing" },
  { day: 29, weekday: "Thu", focus: "PS11 hardening + first HTML/CSS exposure", schedule: ["Combine SQL + HTML page"], ship: "First HTML form renders" },
  { day: 30, weekday: "Fri", focus: "Day 30 retrospective", schedule: ["Write 1-page blog post; recap X thread"], ship: "Public 'Day 30' post live" },
];

// -------- MONTH 2 & 3 DETAILED SCHEDULES --------
// The user will supply these. Placeholder arrays so the schema stays type-safe;
// Today-page logic gracefully falls back to phase-level guidance when day > 30.

export const MONTH_2_SCHEDULE: ScheduleEntry[] = [];
export const MONTH_3_SCHEDULE: ScheduleEntry[] = [];

// -------- PREREQUISITES (signup links for everything the protocol needs) --------

export const PREREQUISITES: Prerequisite[] = [
  // ---------- before-day-1 ----------
  {
    id: "prereq:cs50x",
    name: "CS50x (Harvard)",
    signupUrl: "https://cs50.harvard.edu/x/2025",
    cost: "Free",
    category: "before-day-1",
    phaseIds: ["phase:fundamentals"],
    blurb:
      "The only serious starting point. 11 weeks of C, Python, SQL, HTML/CSS/JS — but we'll front-load the first 5 weeks in 30 days.",
    setupTip:
      "Create a Harvard Online account, enroll in CS50x 2025, and bookmark the Week 0 lecture before Day 1 starts.",
  },
  {
    id: "prereq:x",
    name: "X / Twitter",
    signupUrl: "https://twitter.com/i/flow/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: [
      "phase:fundamentals",
      "phase:web-basics",
      "phase:fullstack-js",
      "phase:validation",
      "phase:mvp-launch",
      "phase:growth",
    ],
    blurb:
      "Your build-in-public channel. Tag #buildinpublic from Day 1. The accountability loop is the algorithm.",
    setupTip:
      "Pick a name that signals what you're building. Add a 1-line bio: 'Building my first SaaS in 100 days. Day 1 of 100.'",
  },
  {
    id: "prereq:makerlog",
    name: "Makerlog",
    signupUrl: "https://getmakerlog.com",
    cost: "Free",
    category: "before-day-1",
    phaseIds: ["phase:fundamentals", "phase:web-basics", "phase:fullstack-js"],
    blurb:
      "Public task-tracker for makers. Cross-posts your daily ship to a wider ecosystem beyond X.",
    setupTip:
      "Sign up with the same handle as X. Auto-post from the API on Day 1.",
  },
  {
    id: "prereq:github",
    name: "GitHub",
    signupUrl: "https://github.com/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: [
      "phase:fundamentals",
      "phase:web-basics",
      "phase:fullstack-js",
    ],
    blurb:
      "Where you push code. Every commit becomes a public, dated receipt for your progress.",
    setupTip:
      "Use the same handle as X. Create your first repo called 'indie-dev-boss' on Day 1.",
  },
  {
    id: "prereq:gmail",
    name: "A Google Account (Gmail)",
    signupUrl: "https://accounts.google.com/signup",
    cost: "Free",
    category: "before-day-1",
    phaseIds: [
      "phase:fundamentals",
      "phase:validation",
      "phase:fullstack-js",
    ],
    blurb:
      "Anchors CS50x, GitHub, Vercel, Stripe, Notion, Calendly, Google Forms, Product Hunt. One account = everything.",
    setupTip:
      "If you can't use Gmail, Proton or iCloud works; expect friction on some signups.",
  },

  // ---------- phase-stack ----------
  {
    id: "prereq:odin",
    name: "The Odin Project",
    signupUrl: "https://www.theodinproject.com",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:web-basics"],
    blurb:
      "Step-by-step full-stack curriculum. Day 31-50 lives here. The HTML/CSS/JS trifecta.",
    setupTip:
      "Start the Foundations path. Join the Discord on the same day.",
  },
  {
    id: "prereq:vercel",
    name: "Vercel",
    signupUrl: "https://vercel.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:web-basics", "phase:fullstack-js", "phase:mvp-launch"],
    blurb:
      "Hosting for your landing page, your Next.js SaaS, and your portfolio. Free tier is fine until Day 100.",
    setupTip:
      "Sign in with GitHub. Auto-deploys every push. Set up on Day 50.",
  },
  {
    id: "prereq:fso",
    name: "Full Stack Open",
    signupUrl: "https://fullstackopen.com",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:fullstack-js"],
    blurb:
      "University of Helsinki. React + Node + TypeScript. Parts 1-9 in 25 days.",
    setupTip:
      "Bookmark the course. Start Part 0 on Day 51.",
  },
  {
    id: "prereq:nextjs",
    name: "Next.js",
    signupUrl: "https://nextjs.org/learn",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:fullstack-js", "phase:mvp-launch"],
    blurb:
      "Frontend + backend in one framework. The only framework you should learn in 100 days.",
    setupTip:
      "Walk through the official tutorial once you've done Full Stack Open Parts 1-2.",
  },
  {
    id: "prereq:supabase",
    name: "Supabase",
    signupUrl: "https://supabase.com/dashboard",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:fullstack-js", "phase:mvp-launch"],
    blurb:
      "Postgres + auth + storage in one. The Rails of 2025. Day 75 you'll write your first row.",
    setupTip:
      "Sign up with GitHub. Create your first project on Day 73.",
  },
  {
    id: "prereq:stripe-test",
    name: "Stripe (test mode)",
    signupUrl: "https://dashboard.stripe.com/register",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:validation", "phase:mvp-launch"],
    blurb:
      "Test-mode ledger to validate payment before going live. Switch to live on Day 99.",
    setupTip:
      "Use a business email (not the same one as your personal Gmail).",
  },
  {
    id: "prereq:resend",
    name: "Resend",
    signupUrl: "https://resend.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:mvp-launch"],
    blurb:
      "Transactional email. Welcome + receipts + magic links. Replaces SMTP.",
    setupTip:
      "3,000 emails/mo free. Verify a sending domain on Day 87.",
  },
  {
    id: "prereq:google-forms",
    name: "Google Forms",
    signupUrl: "https://docs.google.com/forms/u/0/",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:validation"],
    blurb:
      "No-code intake form for concierge MVP customers. Day 81's signup page.",
    setupTip:
      "Use the Google Account you already created.",
  },
  {
    id: "prereq:calendly",
    name: "Calendly",
    signupUrl: "https://calendly.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:validation"],
    blurb:
      "Self-service booking. Customers pick a slot, you deliver the service manually.",
    setupTip:
      "Connect your Google Calendar so the slots sync.",
  },
  {
    id: "prereq:notion",
    name: "Notion",
    signupUrl: "https://www.notion.so/signup",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:validation", "phase:growth"],
    blurb:
      "The protocol's old-school notebook. Pain-point log, ship log, customer log. Free tier is plenty.",
    setupTip:
      "Create a workspace called indie-dashboard on Day 1. Mirror this app's structure if you prefer the manual workflow.",
  },
  {
    id: "prereq:producthunt",
    name: "Product Hunt (Maker account)",
    signupUrl: "https://www.producthunt.com/signup",
    cost: "Free",
    category: "phase-stack",
    phaseIds: ["phase:mvp-launch"],
    blurb:
      "Day 100 launchpad. Top-5-of-the-day = 100+ upvotes = 20+ signups in 24 hours.",
    setupTip:
      "Apply to be a Maker (separate form) by Day 90. Don't launch until you've gotten accepted.",
  },
  {
    id: "prereq:posthog",
    name: "PostHog",
    signupUrl: "https://posthog.com/signup",
    cost: "Free tier",
    category: "phase-stack",
    phaseIds: ["phase:growth"],
    blurb:
      "Product analytics. Find your activation event on Day 110+, ship toward it.",
    setupTip:
      "Deploy the JS snippet on Day 100. Land your first $1 the same day.",
  },

  // ---------- community ----------
  {
    id: "prereq:indiehackers",
    name: "Indie Hackers",
    signupUrl: "https://indiehackers.com/signup",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validation", "phase:growth"],
    blurb:
      "Interviews + forums. The accountability loop and the place your first customers lurk.",
  },
  {
    id: "prereq:rsaas",
    name: "r/SaaS",
    signupUrl: "https://reddit.com/r/SaaS",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validation", "phase:growth"],
    blurb:
      "Daily Q&A. Where founders compare CAC and churn. lurk first; post after Day 80.",
  },
  {
    id: "prereq:rindie",
    name: "r/IndieHackers",
    signupUrl: "https://reddit.com/r/IndieHackers",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validation", "phase:growth"],
    blurb: "Build-in-public accountability. One helpful comment/day, no spam.",
  },
  {
    id: "prereq:microconf",
    name: "MicroConf YouTube",
    signupUrl: "https://microconf.com/youtube",
    cost: "Free",
    category: "community",
    phaseIds: ["phase:validation", "phase:growth"],
    blurb:
      "Rob Walling + MicroConf crew. Free founder talks. Watch before Day 76.",
  },

  // ---------- paid ----------
  {
    id: "prereq:cursor",
    name: "Cursor",
    signupUrl: "https://cursor.sh",
    cost: "$20/mo",
    category: "paid",
    phaseIds: [
      "phase:fullstack-js",
      "phase:validation",
      "phase:mvp-launch",
      "phase:growth",
    ],
    blurb:
      "AI editor. The only expense you should have for the first 100 days. $20/mo for 3× shipping speed is the highest ROI in the protocol.",
    setupTip:
      "Buy it after Day 50 only — first learn to ship without help, then add the AI.",
  },
  {
    id: "prereq:makebook",
    name: "Make Book (Pieter Levels)",
    signupUrl: "https://makebook.io",
    cost: "$30 one-time",
    category: "paid",
    phaseIds: [
      "phase:fundamentals",
      "phase:web-basics",
      "phase:fullstack-js",
    ],
    blurb:
      "The playbook this protocol was reverse-engineered from. Buy it on Day 1 of Phase 1.",
    setupTip:
      "Read chapters 1-3 in your first week. Skim the rest.",
  },
];

// -------- HELPERS --------

export function getPhase(id: PhaseId): Phase {
  const p = PHASES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown phase: ${id}`);
  return p;
}

export function getPhaseForDay(day: number): Phase {
  // Find the phase whose day range includes `day`. If past Day 200, default to growth.
  const p =
    PHASES.find((x) => day >= x.dayStart && day <= x.dayEnd) ??
    PHASES[PHASES.length - 1];
  return p;
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
