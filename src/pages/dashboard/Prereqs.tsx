import {
  PREREQUISITES,
  PHASES,
  type PrerequisiteCategory,
} from "@/data/protocol";
import {
  ArrowUpRight,
  BookOpen,
  CircleDot,
  CreditCard,
  KeyRound,
  Rocket,
  Send,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  PrerequisiteCategory,
  {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    blurb: string;
  }
> = {
  "before-day-1": {
    title: "Before Day 1",
    icon: KeyRound,
    blurb:
      "5 free accounts. 10 minutes each. You're ready the moment Day 1 hits.",
  },
  "ai-tools": {
    title: "AI tooling (the only paid expense)",
    icon: SparklesIcon,
    blurb:
      "Cursor ($20/mo) + Claude + v0 + Bolt + Lovable. Use Composer before every function.",
  },
  "phase-stack": {
    title: "Phase stack",
    icon: Wrench,
    blurb:
      "Next.js + Supabase + Vercel + Resend + PostHog + Stripe. Sign up on the day you enter that phase.",
  },
  launch: {
    title: "Launch platforms",
    icon: Rocket,
    blurb:
      "Apply to be a Product Hunt Maker by Day 75. Submit sitemap to Google Search Console on Day 62.",
  },
  "cold-outreach": {
    title: "Cold outreach",
    icon: Send,
    blurb:
      "Apollo + Hunter for 50 cold pitches Day 88-89. Free tier covers the first sprint.",
  },
  community: {
    title: "Community",
    icon: Users,
    blurb:
      "Indie Hackers + r/SaaS + r/IndieHackers + r/SideProject + MicroConf YouTube. Lurk first, contribute after Day 76.",
  },
  paid: {
    title: "Paid (worth it)",
    icon: CreditCard,
    blurb:
      "Cursor ($20/mo) + Make Book ($30) are the only costs for 100 days. Don't add anything else.",
  },
};

const CATEGORY_ORDER: PrerequisiteCategory[] = [
  "before-day-1",
  "ai-tools",
  "phase-stack",
  "launch",
  "cold-outreach",
  "community",
  "paid",
];

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function PrereqsPage() {
  const total = PREREQUISITES.length;
  const paid = PREREQUISITES.filter((p) => /\$/.test(p.cost)).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" />
          Signup links · {total} {total === 1 ? "service" : "services"}
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Prerequisites.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Every account, tool, community, and launch platform the 100-day
          AI-accelerated protocol needs. Free + paid. Tap a card to sign up.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat
          label="Total signup links"
          value={total.toString()}
          footnote="clickable in every card"
        />
        <Stat
          label="Free tier coverage"
          value={`${total - paid}/${total}`}
          footnote="covers the full 100 days"
        />
        <Stat
          label="Minimum spend · 100 days"
          value="$100"
          footnote="Cursor $20/mo + Make Book $30"
          accent
        />
      </div>

      <div className="space-y-8">
        {CATEGORY_ORDER.map((cat) => {
          const items = PREREQUISITES.filter((p) => p.category === cat);
          if (!items.length) return null;
          return (
            <Category
              key={cat}
              category={cat}
              meta={CATEGORY_META[cat]}
              items={items}
            />
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  footnote,
  accent,
}: {
  label: string;
  value: string;
  footnote: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "nb-card p-3 sm:p-4",
        accent && "border-[color:var(--chart-4)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold mt-1">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{footnote}</p>
    </div>
  );
}

function Category({
  meta,
  items,
}: {
  category: PrerequisiteCategory;
  meta: (typeof CATEGORY_META)[PrerequisiteCategory];
  items: typeof PREREQUISITES;
}) {
  const Icon = meta.icon;
  return (
    <section>
      <div className="flex items-baseline gap-2 nb-rule">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-lg shrink-0">{meta.title}</h2>
      </div>
      <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
        {meta.blurb}
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {items.map((p) => (
          <PrereqCard key={p.id} item={p} />
        ))}
      </div>
    </section>
  );
}

function PrereqCard({ item }: { item: (typeof PREREQUISITES)[number] }) {
  const phases = item.phaseIds
    .map((id) => PHASES.find((p) => p.id === id))
    .filter(Boolean) as typeof PHASES;
  const isPaid = /\$/.test(item.cost);

  return (
    <div
      className={cn(
        "nb-card p-4 sm:p-5 flex flex-col gap-3",
        isPaid && "border-[color:var(--chart-4)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                "font-mono text-base",
                isPaid && "nb-underline decoration-[color:var(--chart-4)]",
              )}
            >
              {item.name}
            </h3>
            <span
              className={cn(
                "text-[10px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded-sm border",
                isPaid
                  ? "border-[color:var(--chart-4)] text-[color:var(--chart-4)]"
                  : "border-[color:var(--chart-3)] text-[color:var(--chart-3)]",
              )}
            >
              {item.cost}
            </span>
          </div>
          <a
            href={item.signupUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] mt-1 truncate font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-1 max-w-full"
          >
            {item.signupUrl}
            <ArrowUpRight className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      <p className="text-xs leading-relaxed">{item.blurb}</p>

      {item.setupTip && (
        <div className="nb-card p-2.5 bg-[color:var(--chart-4)]/5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1">
            <CircleDot className="h-3 w-3" />
            Setup tip
          </p>
          <p className="text-[11px] mt-1 leading-snug">{item.setupTip}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-auto">
        {phases.map((p) => (
          <span
            key={p.id}
            className="text-[10px] uppercase tracking-widest font-mono px-1.5 py-0.5 border border-border rounded-sm bg-card text-foreground"
            title={`${p.label} · ${p.window}`}
          >
            P{p.number} · {p.window}
          </span>
        ))}
      </div>

      <a
        href={item.signupUrl}
        target="_blank"
        rel="noreferrer"
        className="nb-press self-start text-xs font-mono px-3 py-1.5 rounded-sm bg-primary text-primary-foreground inline-flex items-center gap-1.5"
      >
        Sign up <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
