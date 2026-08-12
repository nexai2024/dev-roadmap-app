export type RoadmapStatus = "shipped" | "building" | "planned" | "exploring";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  eta: string;
};

export const ROADMAP_STATUS_LABEL: Record<RoadmapStatus, string> = {
  shipped: "Shipped",
  building: "In progress",
  planned: "Planned",
  exploring: "Exploring",
};

/**
 * Public product roadmap for AppSumo + customers.
 * Keep items concrete and tied to the actual Protocol100 product surface.
 */
export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: "core-notebook",
    title: "100-day protocol notebook",
    description:
      "Day-by-day schedule, phases, key actions, milestones, logbook, and weekly/monthly reviews — the full engineer’s notebook.",
    status: "shipped",
    eta: "Live",
  },
  {
    id: "ai-coach",
    title: "AI daily debriefs",
    description:
      "Paid users get a private coaching summary from their logs — what shipped, what’s stuck, and what to do tomorrow.",
    status: "shipped",
    eta: "Live",
  },
  {
    id: "appsumo-licensing",
    title: "AppSumo lifetime licensing",
    description:
      "OAuth activation, webhook license sync, upgrade/downgrade handling, and Settings key redeem for Sumo-lings.",
    status: "shipped",
    eta: "Live",
  },
  {
    id: "accountability-reminders",
    title: "Accountability toggles & reminders",
    description:
      "Opt-in accountability mode and reminder preferences so the protocol doesn’t silently die on Day 12.",
    status: "shipped",
    eta: "Live",
  },
  {
    id: "progress-export",
    title: "Progress PDF / Markdown export",
    description:
      "One-click export of your logbook, milestones, and MRR trail — for investors, mentors, or your own archive after Day 100.",
    status: "building",
    eta: "Q3 2026",
  },
  {
    id: "email-digest",
    title: "Morning email digests",
    description:
      "Optional weekday email with today’s schedule, unfinished key actions, and a one-line nudge from your last debrief.",
    status: "building",
    eta: "Q3 2026",
  },
  {
    id: "streak-calendar",
    title: "Streak calendar & miss recovery",
    description:
      "Visual heat map of logged days, plus a “missed day” recovery flow that doesn’t nuke your protocol streak guilt-spiral.",
    status: "planned",
    eta: "Q4 2026",
  },
  {
    id: "public-progress",
    title: "Shareable progress pages",
    description:
      "Optional public URL (twitter-ready) showing current day, phase, and shipped proof links — built for BIP / build-in-public.",
    status: "planned",
    eta: "Q4 2026",
  },
  {
    id: "pwa-mobile",
    title: "Installable PWA for phone check-ins",
    description:
      "Add-to-home-screen notebook so evening logs and MRR updates don’t require a laptop session.",
    status: "planned",
    eta: "Q4 2026",
  },
  {
    id: "cohort-mode",
    title: "Cohort & accountability partner mode",
    description:
      "Join a start-date cohort or pair with one partner. Shared check-ins, not a noisy social feed.",
    status: "planned",
    eta: "Q1 2027",
  },
  {
    id: "mentor-dashboard",
    title: "Mentor / coach dashboard",
    description:
      "For operators running Protocol100 with clients: view anonymized progress, flag stuck founders, leave notes.",
    status: "exploring",
    eta: "2027",
  },
  {
    id: "protocol-variants",
    title: "Protocol variants & custom day packs",
    description:
      "Alternate tracks (e.g. no-code, agency, second product) while keeping the same notebook UX and hard rules.",
    status: "exploring",
    eta: "2027",
  },
];

export const ROADMAP_INTRO = {
  title: "Product roadmap",
  subtitle:
    "What we already shipped, what we’re building next, and what we’re exploring — so AppSumo buyers know this product keeps moving after launch day.",
  note: "Dates are targets, not contracts. Shipped items stay free for lifetime license holders unless we mark something as a paid add-on in advance.",
};
