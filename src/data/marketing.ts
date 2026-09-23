/**
 * Protocol100 marketing kit.
 * Catalog listing + channel copy, SEO, emails, and ads.
 * Keep prices in sync with src/convex/lifetimeOffer.ts.
 */

export const SITE_URL = "https://www.protocol100.xyz";
export const SIGN_UP_URL = `${SITE_URL}/auth?mode=sign-up`;
export const SIGN_IN_URL = `${SITE_URL}/auth?mode=sign-in`;
export const ROADMAP_URL = `${SITE_URL}/roadmap`;
export const BILLING_URL = `${SITE_URL}/dashboard/billing`;

export const BRAND = {
  name: "Protocol100",
  shortName: "PROTOCOL·100",
  legalName: "Solopreneur Solutions",
  founder: "David Parker",
  founderHandle: "davidpreneur",
  parentUrl: "https://solopreneur.solutions",
  supportEmail: "hello@protocol100.xyz",
  voice: [
    "Engineer's notebook, not a course landing page.",
    "Blunt. Anti-tutorial. Revenue is the only KPI.",
    "Ship ugly, ship weekly, charge from Day 38.",
    "Speak to first-time solo founders who will actually sit down for 5 hours.",
  ],
  colors: {
    ink: "#1c1c1f",
    cream: "#f3eddc",
    paper: "#fbf6e9",
    amber: "#b45309",
    gradient: "from-stone-800 to-amber-600",
  },
} as const;

export const OFFER = {
  listPrice: 99.99,
  listPriceLabel: "$99.99",
  earlyBirdPrice: 24.99,
  earlyBirdPriceLabel: "$24.99",
  earlyBirdPercentOff: 75,
  earlyBirdEndsAt: "2026-10-09",
  earlyBirdEndsAtLabel: "Oct 9, 2026",
  earlyBirdSpotCap: 100,
  trialDays: 3,
  pricingPeriod: "lifetime access",
  currency: "USD",
  included: [
    "Full 100-day schedule and deliverables",
    "Unlimited logbook entries",
    "All 11 key-action trackers",
    "Weekly and monthly reviews plus AI debriefs",
    "Concierge MVP and distribution trackers",
    "Milestones with proof URLs",
  ],
} as const;

export const CATALOG = {
  id: "solopreneur-solutions-protocol100",
  slug: "protocol100",
  name: "Protocol100",
  tagline: "Cursor + Claude + 99 days of shipping.",
  shortDesc:
    "The solo founder's 100-day AI-accelerated notebook: go from zero coding experience to first 3 paying customers, then a path to $1,000 MRR.",
  description:
    "A day-by-day engineer's notebook for the Protocol100 challenge. Seven sequential phases, eleven key actions, and a 100-day minute-by-minute plan with rest and review baked in. Track daily logs, milestones, concierge outreach, and distribution. AI debriefs tell you what shipped, what's stuck, and what to do tomorrow. Revenue is the only KPI. Ship ugly, ship weekly, charge from Day 38.",
  idealFor:
    "Solo founders, indie hackers, and first-time builders who want a pre-loaded 100-day path from zero to first MRR.",
  iconName: "BookOpen",
  features: [
    "Full 100-day schedule across 7 phases — every day pre-loaded with tasks, links, and exit gates",
    "Engineer's notebook: daily inputs, logbook, milestones, weekly and monthly reviews",
    "AI Protocol Coach debriefs from your logs — what shipped, what's stuck, what to do tomorrow",
    "Concierge MVP + distribution trackers: talk to 30 humans, first $20, then charge from Day 38",
  ],
  price: OFFER.listPriceLabel,
  priceNumeric: OFFER.listPrice,
  earlyBirdPrice: OFFER.earlyBirdPrice,
  earlyBirdEndsAt: OFFER.earlyBirdEndsAt,
  earlyBirdSpotCap: OFFER.earlyBirdSpotCap,
  trialDays: OFFER.trialDays,
  pricingPeriod: OFFER.pricingPeriod,
  url: SITE_URL,
  tags: ["React", "AI Integration", "Indie Hacking"],
  color: BRAND.colors.gradient,
  ctaText: "Start Day 1",
  image:
    "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=800&auto=format&fit=crop",
  imageAlt:
    "Planner and calendar spread representing a 100-day shipping protocol with daily checklists.",
  featured: true,
  featuredOrder: 2,
  badge: "100-Day Protocol",
  badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  demoKey: "protocol100",
  demoAccent: "text-amber-500",
  seoTitle: "Protocol100 | 100-Day AI-Accelerated Path from Zero to First MRR",
  seoDescription:
    "Solo founder's 100-day notebook: seven phases, day-by-day schedule, AI coaching, concierge validation, and lifetime access. Built by David Parker.",
  keywords: [
    "100 day saas challenge",
    "solo founder MRR protocol",
    "AI accelerated coding bootcamp",
    "indie hacker 100 day plan",
    "cursor claude shipping protocol",
    "first paying customers in 100 days",
  ],
} as const;

const HORIZON =
  "100 days from absolute zero to first 3 paying customers, then a path to $1,000 MRR.";

export const POSITIONING = {
  category: "100-day shipping protocol for solo founders",
  oneLiner:
    "A pre-loaded notebook that takes you from zero code to 3 paying customers in 100 days.",
  uniqueMechanism:
    "Minute-by-minute days, seven sequential phases, and a hard rule to charge from Day 38 — not another tutorial pile.",
  enemy: [
    "Tutorial hell and unfinished Udemy carts",
    "Endless boilerplate shopping",
    "Building for months before talking to a customer",
    "Side-project stacking with $0 MRR",
  ],
  promise: HORIZON,
  differentiators: [
    "Every day is already written. You execute, you don't plan the plan.",
    "AI-first: Cursor + Claude are the pair-programmer, not a side note.",
    "Validation before code: first $20 by Day 38 or pivot.",
    "Lifetime unlock. No monthly drip of lessons.",
  ],
} as const;

export const AUDIENCE = {
  icp: "Solo founder or indie hacker with little-to-no production coding experience who will work 5 hours/day, 5 days/week, and wants first MRR — not another certificate.",
  personas: [
    {
      name: "Career-switcher",
      who: "Employed, wants a SaaS on the side, tired of tutorials.",
      job: "Need a daily sequence so evenings aren't wasted picking a stack.",
    },
    {
      name: "Indie hacker restart",
      who: "Has abandoned 3 side projects. Knows the stack names, not the order.",
      job: "Need one product, one protocol, a charge-or-pivot date.",
    },
    {
      name: "Consultant going product",
      who: "Sells time, wants a productized workflow.",
      job: "Need concierge validation and a path to 3 paying customers.",
    },
  ],
  pains: [
    "I don't know what to do today.",
    "I keep rebuilding the stack instead of talking to users.",
    "I shipped nothing people will pay for.",
    "Courses taught me syntax, not how to charge.",
  ],
  desiredOutcome:
    "3 active paying customers by Day 100. First real MRR. A path to $1k after.",
} as const;

export const PHASES_MARKETING = [
  { number: 1, label: "AI Fundamentals", window: "Day 1–10", promise: "Think with Cursor + Claude. Personal site live." },
  { number: 2, label: "Stack Crash", window: "Day 11–25", promise: "Lock Next.js + Supabase + Stripe. Ship 3 throwaways." },
  { number: 3, label: "Validation & Concierge", window: "Day 26–40", promise: "Talk to 30 humans. First $20 before writing the real app." },
  { number: 4, label: "Real MVP", window: "Day 41–65", promise: "Payments, email, analytics, paywall. 5 active users." },
  { number: 5, label: "Beta & Hardening", window: "Day 66–80", promise: "Watch users struggle. Ship the #1 request." },
  { number: 6, label: "Launch", window: "Day 81–90", promise: "Product Hunt + Indie Hackers. Distribution machine on." },
  { number: 7, label: "MRR Push", window: "Day 91–100", promise: "Hand-sell until 3 paying customers." },
] as const;

export const MESSAGING = {
  headlines: [
    "Cursor + Claude + 99 days of shipping.",
    "100 days from zero to first MRR.",
    "Stop collecting tutorials. Start Day 1.",
    "A notebook, not a course.",
    "Charge from Day 38. Or pivot.",
  ],
  subheads: [
    "Seven phases. Eleven key actions. A 100-day minute-by-minute plan with rest and review baked in.",
    "Every external tool linked. Every day pre-loaded. Revenue is the only KPI.",
    "3-day free trial. Then lifetime unlock — $99.99, or 75% off for the first 100 licenses.",
  ],
  primaryCta: "Start Day 1",
  primaryCtaLong: "Start Day 1 free",
  secondaryCta: "See prerequisites",
  paidCta: "Get lifetime access",
  proofPoints: [
    "Featured on Nick Launches",
    "7 sequential phases, 100 pre-written days",
    "AI Protocol Coach debriefs from your logs",
    "First payment target: Day 38",
    "Finish line: 3 paying customers on Day 100",
  ],
  objections: [
    {
      objection: "I already know how to code.",
      reply: "This is not a syntax course. It's the order of operations to first MRR — validation, concierge, launch, hand-sell.",
    },
    {
      objection: "Another 100-day challenge will fizzle on Day 12.",
      reply: "Accountability toggles, weekly reviews, and an AI debrief so the protocol doesn't silently die.",
    },
    {
      objection: "$99 is a lot for a notebook.",
      reply: "It's lifetime access to the full 100 days. Early bird is $24.99 for the first 100 licenses. Trial is 3 days free.",
    },
    {
      objection: "I don't have 5 hours a day.",
      reply: "Then don't start. The protocol is 5 hours × 5 days. Rest Saturday. Review Sunday. It is not a vibe.",
    },
  ],
} as const;

export const SEO = {
  title: CATALOG.seoTitle,
  description: CATALOG.seoDescription,
  keywords: CATALOG.keywords,
  canonical: SITE_URL,
  og: {
    type: "website",
    url: SITE_URL,
    title: "Protocol100 — 100 days to MRR",
    description:
      "The solo founder's 100-day AI-accelerated notebook. From zero coding experience to first 3 paying customers.",
    image: CATALOG.image,
    imageAlt: CATALOG.imageAlt,
    siteName: "Protocol100",
  },
  twitter: {
    card: "summary_large_image",
    title: "Protocol100 — 100 days to MRR",
    description:
      "Cursor + Claude + 99 days of shipping. 3-day trial, then lifetime unlock.",
    image: CATALOG.image,
  },
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Protocol100",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: CATALOG.seoDescription,
    offers: {
      "@type": "Offer",
      price: String(OFFER.listPrice),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    creator: {
      "@type": "Person",
      name: BRAND.founder,
    },
    brand: {
      "@type": "Brand",
      name: BRAND.legalName,
    },
  },
} as const;

export const SOCIAL = {
  xLaunch: `Cursor + Claude + 99 days of shipping.

Protocol100 is the 100-day notebook I wish I had on Day 1:

• 7 phases, every day pre-loaded
• Charge from Day 38 (or pivot)
• 3 paying customers by Day 100

3-day free trial. Lifetime ${OFFER.listPriceLabel} — early bird ${OFFER.earlyBirdPriceLabel} for the first ${OFFER.earlyBirdSpotCap}.

${SIGN_UP_URL}`,
  xShort: `Stop tutorial-collecting. Protocol100 is a 100-day notebook from zero → 3 paying customers. Day 1 is free. ${SIGN_UP_URL}`,
  linkedin: `I built Protocol100 for solo founders who are done with tutorial hell.

It's an engineer's notebook: 100 pre-written days, seven phases, AI debriefs, and a hard date to charge (Day 38).

Not a bootcamp. Not a community. A protocol.

Start a 3-day trial, then unlock lifetime access.

${SITE_URL}`,
  redditTitle: "I wrote a 100-day protocol from zero coding to 3 paying customers (Cursor + Claude, charge by Day 38)",
  redditBody: `I kept seeing people stall in tutorial hell or rebuild the same SaaS boilerplate for months without talking to a customer.

Protocol100 is the notebook I use as the sequence:

Days 1–10 AI fundamentals (Cursor, Claude, first Vercel site)
Days 11–25 stack crash (3 throwaway apps, master boilerplate)
Days 26–40 validation + concierge (talk to 30 humans, first $20)
Days 41–65 real MVP
Days 66–80 beta
Days 81–90 launch
Days 91–100 hand-sell to 3 paying customers

It's a product (lifetime notebook), not a course drip. 3-day free trial.

Live: ${SITE_URL}

Happy to answer how a given day actually looks.`,
  indieHackersTitle: "Protocol100 — a 100-day notebook from zero to first MRR",
  productHuntTagline: "100-day AI-accelerated notebook from zero to first MRR",
  productHuntDescription:
    "Pre-loaded days, seven phases, concierge validation, and AI debriefs. Trial 3 days. Lifetime after.",
  nickLaunchesUrl:
    "https://nicklaunches.com/products/protocol100/?utm_source=protocol100.xyz&utm_medium=badge&utm_campaign=featured",
} as const;

export const ADS = {
  google: [
    {
      headline: "100 Days to First MRR",
      description: "AI-accelerated notebook for solo founders. 3-day trial. Lifetime access.",
    },
    {
      headline: "Stop Tutorial Hell",
      description: "Pre-written 100-day protocol. Charge from Day 38. Start Day 1 free.",
    },
  ],
  meta: [
    {
      primary: "You don't need another course. You need today's page already written.",
      headline: "Protocol100",
      description: "From zero to 3 paying customers in 100 days.",
    },
  ],
  x: [
    "5 hours/day. 5 days/week. Charge by Day 38. That's the protocol.",
    `${OFFER.earlyBirdPriceLabel} lifetime for the first ${OFFER.earlyBirdSpotCap} licenses. Then ${OFFER.listPriceLabel}. Trial is 3 days.`,
  ],
} as const;

export const EMAILS = {
  welcomeTrial: {
    subject: "Day 1 is open. Don't plan — execute.",
    preview: "Your 3-day trial of Protocol100 starts now.",
    body: `You're in.

Protocol100 is not a library. Open Today, do the morning block, ship the EOD.

Rules for the trial:
1. AI first.
2. One product.
3. Log the day before you sleep.

Start here: ${SITE_URL}/dashboard

— ${BRAND.founder}`,
  },
  trialDay3: {
    subject: "Trial ends tomorrow. The other 96 days are the point.",
    preview: "Unlock the rest of the protocol for life.",
    body: `You've seen the notebook. Days 4–100 are the stack crash, first $20, MVP, launch, and MRR push.

Unlock lifetime (${OFFER.earlyBirdPriceLabel} early bird / ${OFFER.listPriceLabel} list):
${BILLING_URL}

— Protocol100`,
  },
  earlyBird: {
    subject: `First ${OFFER.earlyBirdSpotCap} licenses: ${OFFER.earlyBirdPercentOff}% off through ${OFFER.earlyBirdEndsAtLabel}`,
    preview: `${OFFER.earlyBirdPriceLabel} lifetime. Then ${OFFER.listPriceLabel}.`,
    body: `Early bird is ${OFFER.earlyBirdPriceLabel} once, for the first ${OFFER.earlyBirdSpotCap} lifetime licenses, through ${OFFER.earlyBirdEndsAtLabel} ET.

No monthly drip. All 100 days.

${SIGN_UP_URL}`,
  },
  abandonedCheckout: {
    subject: "Your lifetime unlock is still sitting there",
    preview: "Same price. Same 100 days.",
    body: `Checkout didn't finish. The protocol doesn't drip by email — you either unlock the notebook or you don't.

Resume: ${BILLING_URL}`,
  },
} as const;

export const FAQ = [
  {
    q: "Is this a coding bootcamp?",
    a: "No. It's a 100-day execution notebook. You use Cursor and Claude as the pair-programmer. The curriculum is shipping and charging, not lectures.",
  },
  {
    q: "What do I get after the 3-day trial?",
    a: "The trial covers the initiation days. Lifetime unlock opens the remaining 96 days, logbook, reviews, AI debriefs, concierge and distribution trackers — forever.",
  },
  {
    q: "What stack does it assume?",
    a: "Cursor, Claude, Next.js, Supabase, Stripe, Vercel, Resend, PostHog. Prerequisites and sign-up links are inside the notebook. Minimum extra spend for 100 days is about $100 (Cursor + Make Book).",
  },
  {
    q: "What if I miss a day?",
    a: "Log it. Saturday is rest. Sunday is review. The protocol is sequential; you don't skip phases to 'catch up' by watching videos.",
  },
  {
    q: "Do I own it after I pay?",
    a: "Yes. One-time lifetime access. No subscription.",
  },
] as const;

export const UTM = {
  sourceCatalog: "solopreneur.solutions",
  campaigns: {
    catalog: `${SITE_URL}?utm_source=solopreneur.solutions&utm_medium=catalog&utm_campaign=protocol100`,
    nickLaunches: SOCIAL.nickLaunchesUrl,
    x: `${SIGN_UP_URL}&utm_source=twitter&utm_medium=social&utm_campaign=protocol100_launch`,
    reddit: `${SIGN_UP_URL}&utm_source=reddit&utm_medium=social&utm_campaign=protocol100_launch`,
    indieHackers: `${SIGN_UP_URL}&utm_source=indiehackers&utm_medium=community&utm_campaign=protocol100_launch`,
    productHunt: `${SIGN_UP_URL}&utm_source=producthunt&utm_medium=launch&utm_campaign=protocol100_ph`,
  },
} as const;

export const DIRECTORY_BLURBS = {
  fiftyChars: "100-day notebook from zero to first MRR",
  oneTwenty:
    "AI-accelerated 100-day protocol for solo founders. Pre-written days, charge by Day 38, 3 paying customers by Day 100.",
  threeHundred:
    "Protocol100 is a lifetime engineer's notebook that walks a solo founder from zero coding experience to first MRR. Seven phases, eleven key actions, daily logs, AI debriefs, and a concierge-first validation path. 3-day trial, then one-time unlock.",
} as const;

export const protocol100Marketing = {
  brand: BRAND,
  offer: OFFER,
  catalog: CATALOG,
  positioning: POSITIONING,
  audience: AUDIENCE,
  phases: PHASES_MARKETING,
  messaging: MESSAGING,
  seo: SEO,
  social: SOCIAL,
  ads: ADS,
  emails: EMAILS,
  faq: FAQ,
  utm: UTM,
  directoryBlurbs: DIRECTORY_BLURBS,
} as const;

export default protocol100Marketing;
