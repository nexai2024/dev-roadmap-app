import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  HUNDRED_DAY_SCHEDULE,
  PHASES,
  type PhaseId,
  DAILY_INPUTS,
  NON_NEGOTIABLES,
  type ScheduleEntry,
} from "@/data/protocol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ArrowUpRight,
  BatteryCharging,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ListChecks,
  MoonStar,
  Pencil,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const WEEKDAY_OF_DAY = (n: number) => {
  // Day 1 = Monday. (n - 1) % 7 = 0..6 → Mon..Sun.
  const idx = (n - 1) % 7;
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx];
};

export default function TodayPage() {
  const { user } = useAuth();
  const profile = useQuery(api.notebook.currentProfile);
  const todayLog = useQuery(api.notebook.todayLog);
  const upsertLog = useMutation(api.notebook.upsertLog);

  const today = useMemo(() => {
    if (!profile?.startedAt) return 1;
    const start = new Date(profile.startedAt);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, diff + 1);
  }, [profile?.startedAt]);

  const currentPhase =
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:ai-fundamentals";
  const phaseMeta = PHASES.find((p) => p.id === currentPhase) ?? PHASES[0];

  const scheduleEntry: ScheduleEntry | null = useMemo(() => {
    if (today < 1 || today > HUNDRED_DAY_SCHEDULE.length) return null;
    return HUNDRED_DAY_SCHEDULE[today - 1] ?? null;
  }, [today]);

  // Form state — bounded by today's existing log or defaults
  const [hoursCoded, setHoursCoded] = useState(0);
  const [commits, setCommits] = useState(0);
  const [shippedUrl, setShippedUrl] = useState("");
  const [bipPostUrl, setBipPostUrl] = useState("");
  const [customersContacted, setCustomersContacted] = useState(0);
  const [mrrUsd, setMrrUsd] = useState(0);
  const [notes, setNotes] = useState("");
  const [shippedNote, setShippedNote] = useState("");
  const [inputsDone, setInputsDone] = useState<string[]>([]);
  const [mood, setMood] = useState<
    "locked-in" | "shipping" | "stuck" | "shipping-slow" | undefined
  >(undefined);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!todayLog) return;
    setHoursCoded(todayLog.hoursCoded);
    setCommits(todayLog.commits);
    setShippedUrl(todayLog.shippedUrl ?? "");
    setBipPostUrl(todayLog.bipPostUrl ?? "");
    setCustomersContacted(todayLog.customersContacted);
    setMrrUsd(todayLog.mrrUsd);
    setNotes(todayLog.notes ?? "");
    setShippedNote(todayLog.shippedNote ?? "");
    setInputsDone(todayLog.inputsDone);
    setMood(todayLog.mood);
  }, [todayLog]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const toggleInput = (id: string) => {
    setInputsDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      await upsertLog({
        date: todayStr,
        phaseId: currentPhase,
        hoursCoded,
        commits,
        shippedUrl: shippedUrl || undefined,
        bipPostUrl: bipPostUrl || undefined,
        customersContacted,
        mrrUsd,
        notes: notes || undefined,
        inputsDone,
        shippedNote: shippedNote || undefined,
        mood,
      });
      setSavedAt(Date.now());
    } finally {
      setBusy(false);
    }
  };

  const greet = greeting();

  return (
    <div className="space-y-6">
      <Header
        title={`Day ${today} of 100 · ${greet}, ${profile?.displayName ?? user?.name ?? "founder"}.`}
        subtitle={`${scheduleEntry ? `Phase ${phaseMeta.number} · ${phaseMeta.label}` : "Beyond Day 100"} · ${scheduleEntry?.focus ?? "Build the next milestone."}`}
      />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        {/* Schedule card */}
        <ScheduleCard
          entry={scheduleEntry}
          phaseName={phaseMeta.label}
          phaseNumber={phaseMeta.number}
        />

        {/* Quick log */}
        <LogCard
          todayStr={todayStr}
          hoursCoded={hoursCoded}
          setHoursCoded={setHoursCoded}
          commits={commits}
          setCommits={setCommits}
          customersContacted={customersContacted}
          setCustomersContacted={setCustomersContacted}
          mrrUsd={mrrUsd}
          setMrrUsd={setMrrUsd}
          shippedUrl={shippedUrl}
          setShippedUrl={setShippedUrl}
          bipPostUrl={bipPostUrl}
          setBipPostUrl={setBipPostUrl}
          shippedNote={shippedNote}
          setShippedNote={setShippedNote}
          notes={notes}
          setNotes={setNotes}
          mood={mood}
          setMood={setMood}
          inputsDone={inputsDone}
          onToggleInput={toggleInput}
          onSave={handleSave}
          busy={busy}
          savedAt={savedAt}
          hasExistingLog={!!todayLog}
        />
      </div>

      {/* Footer hint cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <LinkCard
          to="/dashboard/prereqs"
          icon={Sparkles}
          title="Prerequisites"
          text="Every signup link for the AI tools, community, and launch platforms the protocol needs."
        />
        <LinkCard
          to="/dashboard/actions"
          icon={CalendarCheck2}
          title="11 key actions"
          text="Day-by-day deliverables are wired into your dashboard. Tick progress per action."
        />
        <LinkCard
          to="/dashboard/logbook"
          icon={ListChecks}
          title="Logbook"
          text="Engineer-grade history: every daily row you've ever filed, newest first."
        />
      </div>
    </div>
  );
}

function ScheduleCard({
  entry,
  phaseName,
  phaseNumber,
}: {
  entry: ScheduleEntry | null;
  phaseName: string;
  phaseNumber: number;
}) {
  if (!entry) {
    return (
      <div className="nb-page nb-holes p-5 sm:p-7">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Today's schedule
        </p>
        <h2 className="font-mono text-xl mt-1">Beyond Day 100.</h2>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          You've shipped the 100-day plan. Continue compounding: SEO posts,
          cold email, affiliate payouts. Use the Actions page to add new
          key actions and the Milestones page to track $1k MRR.
        </p>
      </div>
    );
  }

  return (
    <div className="nb-page nb-holes p-5 sm:p-7">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Today's schedule
        </p>
        <span
          className={cn(
            "nb-stamp",
            entry.type === "work"
              ? "text-primary"
              : entry.type === "rest"
                ? "text-[color:var(--chart-4)]"
                : "text-[color:var(--chart-1)]",
          )}
        >
          {entry.type === "work" ? "work" : entry.type === "rest" ? "rest" : "review"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {WEEKDAY_OF_DAY(entry.day)} · Day {entry.day}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          Phase {phaseNumber} · {phaseName}
        </span>
      </div>

      <h2 className="font-mono text-xl mt-2 leading-tight">{entry.focus}</h2>

      {entry.type === "work" && (
        <>
          <DayBlock
            icon={Clock}
            title="Morning block (2 hrs · 09:00-11:00)"
            items={entry.morning}
          />
          <DayBlock
            icon={Pencil}
            title="Afternoon block (3 hrs · 11:00-14:00)"
            items={entry.afternoon}
          />
          <BipPost text={entry.evening} bipUrl={entry.resources[0]?.url} />
          <div className="mt-5 pt-4 border-t border-dashed border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ship by EOD
            </p>
            <p className="font-mono text-sm mt-1 nb-highlight inline-block">
              {entry.shipByEod}
            </p>
          </div>
        </>
      )}

      {entry.type === "rest" && (
        <div className="mt-5 nb-card p-4 bg-[color:var(--chart-4)]/5 flex gap-3 items-start">
          <BatteryCharging className="h-5 w-5 text-[color:var(--chart-4)] shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-sm">Saturday REST. Hard stop.</p>
            <p className="nb-hand text-base text-muted-foreground mt-1">
              "Burnout kills more indie dreams than bad code does."
            </p>
            <p className="text-xs text-muted-foreground mt-2">{entry.shipByEod}</p>
          </div>
        </div>
      )}

      {entry.type === "review" && (
        <>
          <DayBlock
            icon={CalendarCheck2}
            title="Sunday REVIEW (90 min · afternoon)"
            items={entry.afternoon.length ? entry.afternoon : entry.morning}
          />
          <BipPost text={entry.evening} bipUrl={entry.resources[0]?.url} />
          <div className="mt-5 pt-4 border-t border-dashed border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ship by EOD
            </p>
            <p className="font-mono text-sm mt-1 nb-highlight inline-block">
              {entry.shipByEod}
            </p>
          </div>
        </>
      )}

      {entry.resources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Today's links
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="nb-press text-xs font-mono px-2 py-1 rounded-sm border border-border hover:bg-sidebar-accent inline-flex items-center gap-1 max-w-full"
              >
                <span className="truncate max-w-[180px]">{r.label}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayBlock({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <span className="font-mono font-bold text-primary shrink-0 tabular-nums">
              ▢
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BipPost({ text, bipUrl }: { text: string; bipUrl?: string }) {
  if (text === "—") return null;
  return (
    <div className="mt-5 pt-4 border-t border-dashed border-border">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
        <MoonStar className="h-3 w-3" /> Build-in-public (14:00-14:30 · 30 min)
      </p>
      {bipUrl ? (
        <a
          href={bipUrl}
          target="_blank"
          rel="noreferrer"
          className="block mt-1.5 nb-card p-3 hover:bg-sidebar-accent transition-colors"
        >
          <p className="font-mono text-sm italic">"{text}"</p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Post URL homebase
          </p>
        </a>
      ) : (
        <p className="mt-1.5 nb-card p-3 font-mono text-sm italic bg-primary/5">
          "{text}"
        </p>
      )}
    </div>
  );
}

function LogCard(props: {
  todayStr: string;
  hoursCoded: number;
  setHoursCoded: (n: number) => void;
  commits: number;
  setCommits: (n: number) => void;
  customersContacted: number;
  setCustomersContacted: (n: number) => void;
  mrrUsd: number;
  setMrrUsd: (n: number) => void;
  shippedUrl: string;
  setShippedUrl: (s: string) => void;
  bipPostUrl: string;
  setBipPostUrl: (s: string) => void;
  shippedNote: string;
  setShippedNote: (s: string) => void;
  notes: string;
  setNotes: (s: string) => void;
  mood: "locked-in" | "shipping" | "stuck" | "shipping-slow" | undefined;
  setMood: (m: "locked-in" | "shipping" | "stuck" | "shipping-slow" | undefined) => void;
  inputsDone: string[];
  onToggleInput: (id: string) => void;
  onSave: () => void;
  busy: boolean;
  savedAt: number | null;
  hasExistingLog: boolean;
}) {
  return (
    <div className="nb-card p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-xl">Log today</h2>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        {props.todayStr} — upserts your daily row.
      </p>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ListChecks className="h-3 w-3" /> Daily inputs
        </p>
        <div className="mt-2 grid sm:grid-cols-2 gap-1.5">
          {DAILY_INPUTS.map((i) => {
            const on = props.inputsDone.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => props.onToggleInput(i.id)}
                className={cn(
                  "nb-press text-left px-2.5 py-2 rounded-sm border text-xs flex items-start gap-2",
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-sidebar-accent",
                )}
              >
                <CheckCircle2
                  className={cn(
                    "h-3.5 w-3.5 mt-0.5 shrink-0",
                    on ? "text-primary-foreground" : "text-muted-foreground",
                  )}
                />
                <span className={cn(on && "nb-crossed")}>{i.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniField label="Hours coded" hint="5 hrs target">
          <Input
            type="number"
            min={0}
            step="0.25"
            value={props.hoursCoded}
            onChange={(e) => props.setHoursCoded(parseFloat(e.target.value) || 0)}
          />
        </MiniField>
        <MiniField label="Commits" hint="gh / vercel">
          <Input
            type="number"
            min={0}
            value={props.commits}
            onChange={(e) => props.setCommits(parseInt(e.target.value) || 0)}
          />
        </MiniField>
        <MiniField label="Customers" hint="20 DMs/day target">
          <Input
            type="number"
            min={0}
            value={props.customersContacted}
            onChange={(e) =>
              props.setCustomersContacted(parseInt(e.target.value) || 0)
            }
          />
        </MiniField>
        <MiniField label="MRR today" hint="Stripe $USD">
          <Input
            type="number"
            min={0}
            value={props.mrrUsd}
            onChange={(e) => props.setMrrUsd(parseInt(e.target.value) || 0)}
          />
        </MiniField>
      </div>

      <MiniField label="Shipped URL" hint="Vercel deploy or commit">
        <Input
          value={props.shippedUrl}
          onChange={(e) => props.setShippedUrl(e.target.value)}
          placeholder="https://github.com/you/repo or https://*.vercel.app"
        />
      </MiniField>
      <MiniField label="Build-in-public post" hint="X / Makerlog URL">
        <Input
          value={props.bipPostUrl}
          onChange={(e) => props.setBipPostUrl(e.target.value)}
          placeholder="https://x.com/you/status/..."
        />
      </MiniField>
      <MiniField label="What did you ship?" hint="one line">
        <Input
          value={props.shippedNote}
          onChange={(e) => props.setShippedNote(e.target.value)}
          placeholder="Day 22 made my SaaS boilerplate."
        />
      </MiniField>
      <MiniField label="Notes">
        <Textarea
          rows={3}
          value={props.notes}
          onChange={(e) => props.setNotes(e.target.value)}
          placeholder="What broke. What you'd do tomorrow."
        />
      </MiniField>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3 w-3" /> Mood
        </p>
        <div className="mt-1.5 flex gap-1.5 flex-wrap">
          {(
            [
              ["locked-in", "Locked-in"],
              ["shipping", "Shipping"],
              ["shipping-slow", "Slow"],
              ["stuck", "Stuck"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => props.setMood(props.mood === id ? undefined : id)}
              className={cn(
                "nb-press px-2.5 py-1 text-xs rounded-sm border",
                props.mood === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-sidebar-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <Button onClick={props.onSave} disabled={props.busy}>
          <Save className="h-4 w-4 mr-1" />
          {props.busy ? "Logging…" : props.hasExistingLog ? "Update log" : "Log day"}
        </Button>
        {props.savedAt && (
          <span className="text-[11px] text-muted-foreground">
            saved · {new Date(props.savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
        {hint ? (
          <span className="ml-2 normal-case tracking-normal text-muted-foreground">
            — {hint}
          </span>
        ) : null}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function LinkCard({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <a
      href={to}
      className="nb-card p-4 text-left nb-press hover:bg-sidebar-accent transition-colors block"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-sm">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-snug">{text}</p>
    </a>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "evening";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Today
      </p>
      <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1 leading-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-xs mt-1 font-mono">{subtitle}</p>
    </div>
  );
}
