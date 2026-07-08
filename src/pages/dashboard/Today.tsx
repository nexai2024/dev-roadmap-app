import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useAction } from "convex/react";
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
  Lock,
  MoonStar,
  Pencil,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const WEEKDAY_OF_DAY = (n: number) => {
  // Day 1 = Monday. (n - 1) % 7 = 0..6 → Mon..Sun.
  const idx = (n - 1) % 7;
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx];
};

export default function TodayPage() {
  const { user } = useAuth();
  const profile = useQuery(api.notebook.currentProfile);
  const [searchParams, setSearchParams] = useSearchParams();
  const dayParam = searchParams.get("day");

  const logs = useQuery(api.notebook.listLogs, { limit: 200 });
  const unlockProtocol = useMutation(api.notebook.unlockProtocol);
  const createCheckoutSession = useAction(api.payments.createCheckoutSession);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const actualToday = useMemo(() => {
    if (!profile?.startedAt) return 1;
    const start = new Date(profile.startedAt);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, diff + 1);
  }, [profile?.startedAt]);

  const today = useMemo(() => {
    if (dayParam) {
      const parsed = parseInt(dayParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        return parsed;
      }
    }
    return actualToday;
  }, [actualToday, dayParam]);

  const todayStr = useMemo(() => {
    if (!profile?.startedAt) return new Date().toISOString().slice(0, 10);
    const start = new Date(profile.startedAt);
    const targetDate = new Date(start.getTime() + (today - 1) * 24 * 60 * 60 * 1000);
    return targetDate.toISOString().slice(0, 10);
  }, [profile?.startedAt, today]);

  const todayLog = useQuery(api.notebook.todayLog, { date: todayStr });
  const upsertLog = useMutation(api.notebook.upsertLog);

  const currentPhase =
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:ai-fundamentals";
  const phaseMeta = PHASES.find((p) => p.id === currentPhase) ?? PHASES[0];

  const scheduleEntry: ScheduleEntry | null = useMemo(() => {
    if (today < 1 || today > HUNDRED_DAY_SCHEDULE.length) return null;
    return HUNDRED_DAY_SCHEDULE[today - 1] ?? null;
  }, [today]);

  const getDayNumberFromDate = (logDateStr: string, startedAt: number) => {
    const start = new Date(startedAt);
    const logDate = new Date(logDateStr);
    const diff = Math.floor((logDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  };

  const loggedDays = useMemo(() => {
    if (!profile?.startedAt || !logs) return new Set<number>();
    const set = new Set<number>();
    for (const l of logs) {
      const dayNum = getDayNumberFromDate(l.date, profile.startedAt);
      set.add(dayNum);
    }
    return set;
  }, [profile?.startedAt, logs]);

  const hasPreviousUnloggedDays = useMemo(() => {
    for (let d = 1; d < today; d++) {
      if (!loggedDays.has(d)) {
        return true;
      }
    }
    return false;
  }, [today, loggedDays]);

  const maxAllowedDay = useMemo(() => {
    if (profile?.isPaid) return 100;
    const type = profile?.licenseType ?? "free";
    if (type === "lifetime") return 100;
    if (type === "subscription") return 30;
    return 3; // "free" or "trial"
  }, [profile?.isPaid, profile?.licenseType]);

  const handleUpgrade = async () => {
    setIsUnlocking(true);
    try {
      try {
        const checkoutUrl = await createCheckoutSession({
          email: profile?.email || profile?.displayName || "founder@protocol100.com"
        });
        window.location.href = checkoutUrl;
      } catch (e) {
        console.warn("Upgrade checkout failed, simulating unlock...", e);
        toast.info("Redirecting to secure upgrade checkout...");
        setTimeout(async () => {
          toast.error("Manual upgrade is disabled. Please complete the purchase flow.");
          setIsUnlocking(false);
        }, 2000);
      }
    } catch (err) {
      toast.error("Failed to initiate checkout. Please try again.");
      setIsUnlocking(false);
    }
  };

  const handleNavigateDay = (targetDay: number) => {
    const targetPhase = PHASES.find((p) => targetDay >= p.dayStart && targetDay <= p.dayEnd) ?? PHASES[0];
    if (targetPhase.id !== currentPhase) {
      const proceed = window.confirm(
        `You are trying to view Day ${targetDay}, which is in the "${targetPhase.label}" phase. Your current active phase is "${phaseMeta.label}". The Protocol100 steps must be completed in order. Do you want to proceed?`
      );
      if (!proceed) return;
    }
    setSearchParams({ day: targetDay.toString() });
  };

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
    if (!todayLog) {
      setHoursCoded(0);
      setCommits(0);
      setShippedUrl("");
      setBipPostUrl("");
      setCustomersContacted(0);
      setMrrUsd(0);
      setNotes("");
      setShippedNote("");
      setInputsDone([]);
      setMood(undefined);
      return;
    }
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
      toast.success("Daily log saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save daily log");
    } finally {
      setBusy(false);
    }
  };

  const greet = greeting();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-border pb-6">
        <Header
          title={`Day ${today} of 100 · ${greet}, ${profile?.displayName ?? user?.name ?? "founder"}.`}
          subtitle={`${scheduleEntry ? `Phase ${phaseMeta.number} · ${phaseMeta.label}` : "Beyond Day 100"} · ${scheduleEntry?.focus ?? "Build the next milestone."}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {today !== actualToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateDay(actualToday)}
              className="nb-press h-8 text-[11px] font-mono hover:bg-primary hover:text-primary-foreground"
            >
              Go to Today (Day {actualToday})
            </Button>
          )}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-sm border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateDay(today - 1)}
              disabled={today <= 1}
              className="nb-press h-8 w-8 p-0 text-xs font-mono"
            >
              ←
            </Button>
            <span className="text-xs font-mono px-3 font-semibold min-w-[90px] text-center select-none">
              Day {today} / 100
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateDay(today + 1)}
              disabled={today >= 100}
              className="nb-press h-8 w-8 p-0 text-xs font-mono"
            >
              →
            </Button>
          </div>
        </div>
      </div>

      {today > maxAllowedDay ? (
        <UpgradeGateCard
          maxAllowedDay={maxAllowedDay}
          licenseType={profile?.licenseType ?? "free"}
          onUnlock={handleUpgrade}
          busy={isUnlocking}
        />
      ) : (
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
            hasPreviousUnloggedDays={hasPreviousUnloggedDays}
            activeDay={today}
          />
        </div>
      )}

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
  hasPreviousUnloggedDays: boolean;
  activeDay: number;
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

      <div className="flex items-center gap-2 mt-5 flex-wrap">
        <Button onClick={props.onSave} disabled={props.busy || props.hasPreviousUnloggedDays}>
          <Save className="h-4 w-4 mr-1" />
          {props.busy ? "Logging…" : props.hasExistingLog ? "Update log" : "Log day"}
        </Button>
        {props.hasPreviousUnloggedDays && (
          <p className="text-xs text-destructive font-mono mt-1">
            ⚠ Cannot log Day {props.activeDay} yet. There are unlogged days before this day.
          </p>
        )}
        {props.savedAt && !props.hasPreviousUnloggedDays && (
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

function UpgradeGateCard({
  maxAllowedDay,
  licenseType,
  onUnlock,
  busy,
}: {
  maxAllowedDay: number;
  licenseType: string;
  onUnlock: () => void;
  busy: boolean;
}) {
  const licenseName =
    licenseType === "free" || licenseType === "free-trial" || licenseType === "free"
      ? "Free Trial"
      : licenseType === "subscription"
        ? "Monthly Subscription"
        : "Standard Trial";

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="nb-page nb-holes p-8 sm:p-12 relative overflow-hidden text-center">
        <div className="nb-tape inline-block px-3 py-1 text-[12px] uppercase tracking-widest font-mono rotate-[-2deg] bg-primary text-primary-foreground mb-6">
          License Gated
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <h1 className="font-mono text-2xl md:text-3xl font-bold leading-tight">
            Day Locked.
          </h1>

          <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-md">
            Your current license ({licenseName}) only allows access to days 1 to {maxAllowedDay} of the Protocol100 curriculum. Upgrade your license to unlock the full 100 days.
          </p>

          <Button onClick={onUnlock} disabled={busy} className="mt-6 h-12 px-8 font-mono">
            {busy ? "Unlocking..." : "Upgrade License to Lifetime"}
          </Button>
        </div>
      </div>
    </div>
  );
}
