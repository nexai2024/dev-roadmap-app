import {
  PREREQUISITES,
  PHASES,
  type PhaseId,
  type PrerequisiteCategory,
} from "@/data/protocol";
import {
  ArrowUpRight,
  BookOpen,
  CircleDot,
  CreditCard,
  ExternalLink,
  KeyRound,
  Users,
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
      "Set up on Day -7 to Day -1. None of these take more than 10 minutes each. You'll be ready the moment Day 1 hits.",
  },
  "phase-stack": {
    title: "Phase stack",
    icon: CircleDot,
    blurb:
      "Sign up the day you enter the phase. Free tiers cover you for the first 100 days.",
  },
  community: {
    title: "Community & playbooks",
    icon: Users,
    blurb:
      "Lurk first, contribute second. Don't post Day 1. Post after Day 76.",
  },
  paid: {
    title: "Paid (worth it)",
    icon: CreditCard,
    blurb:
      "The minimum viable spend. Don't add anything else until Day 100.",
  },
};

const CATEGORY_ORDER: PrerequisiteCategory[] = [
  "before-day-1",
  "phase-stack",
  "community",
  "paid",
];

export default function PrereqsPage() {
  const total = PREREQUISITES.length;
  const free = PREREQUISITES.filter((p) => !p.cost.match(/\$/)).length;

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
          Every account, tool, community, and subscription the 100-day plan
          requires. Free + paid. Tap a card to sign up. Don't optimize — start.
        </p>
      </div>

      <div className="nb-card p-4 sm:p-5 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Total minimum spend · 100 days
          </p>
          <p className="font-mono text-2xl font-bold mt-1">
            $100 <span className="text-sm text-muted-foreground font-normal">(~ $1/day)</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Free tier coverage
          </p>
          <p className="font-mono text-base mt-1">
            {free} of {total} services
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Cursor ($20/mo) + Make Book ($30) are the only costs
          </p>
        </div>
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

function Category({
  category,
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
  const isPaid = !!item.cost.match(/\$/);

  return (
    <div
      className={cn(
        "nb-card p-4 sm:p-5 flex flex-col gap-3",
        isPaid && "border-[color:var(--chart-4)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
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
          <p className="text-[10px] mt-1 truncate font-mono text-muted-foreground">
            {item.signupUrl}
          </p>
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
