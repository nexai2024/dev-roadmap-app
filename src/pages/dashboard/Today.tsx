import { useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useSearchParams } from "react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  HUNDRED_DAY_SCHEDULE,
  PHASES,
  type PhaseId,
  DAILY_INPUTS,
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
  Bot,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ListChecks,
  Lock,
  MoonStar,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LifetimeDealCard } from "@/components/LifetimeDealCard";
import * as Sentry from '@sentry/react';
// Add this button component to your app to test Sentry's error tracking
function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
    >
      Break the world
    </button>
  );
}
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

  // AI Coach state
  const generateDebrief = useAction(api.coach.generateDailyDebrief);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

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
    return profile?.suggestedDay ?? actualToday;
  }, [actualToday, dayParam, profile?.suggestedDay]);

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

  const triggerCoach = async (date: string) => {
    if (!profile?.isPaid) return; // Only for paid users
    setCoachLoading(true);
    setCoachError(null);
    try {
      await generateDebrief({ date });
    } catch (error: any) {
      console.error("AI Coach error:", error);
      setCoachError(error.message || "Coach is temporarily unavailable.");
    } finally {
      setCoachLoading(false);
    }
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
      // Trigger AI Coach after successful save
      triggerCoach(todayStr);
    } catch (error: any) {
      toast.error(error.message || "Failed to save daily log");
    } finally {
      setBusy(false);
    }
  };

  const greet = greeting();

  const checkAccountability = useAction(api.notebook.checkAccountability);
  const accountabilityCheckedRef = useRef(false);

  useEffect(() => {
    if (profile?.accountabilityEnabled && !accountabilityCheckedRef.current) {
      accountabilityCheckedRef.current = true;
      checkAccountability().catch(console.error);
    }
  }, [profile?.accountabilityEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <ErrorButton />
          </div>
        </div>
      </div>

      {today > maxAllowedDay ? (
        <UpgradeGateCard
          maxAllowedDay={maxAllowedDay}
          licenseType={profile?.licenseType ?? "free"}
        />
      ) : (
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="space-y-4">
            {/* Schedule card */}
            <ScheduleCard
              entry={scheduleEntry}
              phaseName={phaseMeta.label}
              phaseNumber={phaseMeta.number}
            />

            {/* Timer section */}
            <TimerCard />
          </div>

          {/* Quick log with key to handle unmount/remount on day change */}
          <LogCard
            key={todayStr}
            todayStr={todayStr}
            todayLog={todayLog}
            currentPhase={currentPhase}
            upsertLog={async (args) => {
              const res = await upsertLog(args);
              triggerCoach(args.date);
              return res;
            }}
            hasPreviousUnloggedDays={hasPreviousUnloggedDays}
            activeDay={today}
          />
        </div>
      )}

      {/* AI Coach Card */}
      {today <= maxAllowedDay && (
        <CoachCard
          date={todayStr}
          isPaid={!!profile?.isPaid}
          hasLog={!!todayLog}
          loading={coachLoading}
          error={coachError}
          onRegenerate={() => triggerCoach(todayStr)}
        />
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

interface LogType {
  hoursCoded: number;
  commits: number;
  shippedUrl?: string;
  bipPostUrl?: string;
  customersContacted: number;
  mrrUsd: number;
  notes?: string;
  shippedNote?: string;
  inputsDone: string[];
  mood?: "locked-in" | "shipping" | "stuck" | "shipping-slow";
}

function LogCard({
  todayStr,
  todayLog,
  currentPhase,
  upsertLog,
  hasPreviousUnloggedDays,
  activeDay,
}: {
  todayStr: string;
  todayLog: LogType | null | undefined;
  currentPhase: string;
  upsertLog: (args: {
    date: string;
    phaseId: string;
    hoursCoded: number;
    commits: number;
    shippedUrl?: string;
    bipPostUrl?: string;
    customersContacted: number;
    mrrUsd: number;
    notes?: string;
    inputsDone: string[];
    shippedNote?: string;
    mood?: "locked-in" | "shipping" | "stuck" | "shipping-slow";
  }) => Promise<unknown>;
  hasPreviousUnloggedDays: boolean;
  activeDay: number;
}) {
  if (todayLog === undefined) {
    return (
      <div className="nb-card p-5 sm:p-7 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-2">Loading daily log...</p>
      </div>
    );
  }

  return (
    <LogForm
      todayStr={todayStr}
      todayLog={todayLog}
      currentPhase={currentPhase}
      upsertLog={upsertLog}
      hasPreviousUnloggedDays={hasPreviousUnloggedDays}
      activeDay={activeDay}
    />
  );
}

function LogForm({
  todayStr,
  todayLog,
  currentPhase,
  upsertLog,
  hasPreviousUnloggedDays,
  activeDay,
}: {
  todayStr: string;
  todayLog: LogType | null | undefined;
  currentPhase: string;
  upsertLog: (args: {
    date: string;
    phaseId: string;
    hoursCoded: number;
    commits: number;
    shippedUrl?: string;
    bipPostUrl?: string;
    customersContacted: number;
    mrrUsd: number;
    notes?: string;
    inputsDone: string[];
    shippedNote?: string;
    mood?: "locked-in" | "shipping" | "stuck" | "shipping-slow";
  }) => Promise<unknown>;
  hasPreviousUnloggedDays: boolean;
  activeDay: number;
}) {
  const [hoursCoded, setHoursCoded] = useState(todayLog?.hoursCoded ?? 0);
  const [commits, setCommits] = useState(todayLog?.commits ?? 0);
  const [shippedUrl, setShippedUrl] = useState(todayLog?.shippedUrl ?? "");
  const [bipPostUrl, setBipPostUrl] = useState(todayLog?.bipPostUrl ?? "");
  const [customersContacted, setCustomersContacted] = useState(todayLog?.customersContacted ?? 0);
  const [mrrUsd, setMrrUsd] = useState(todayLog?.mrrUsd ?? 0);
  const [notes, setNotes] = useState(todayLog?.notes ?? "");
  const [shippedNote, setShippedNote] = useState(todayLog?.shippedNote ?? "");
  const [inputsDone, setInputsDone] = useState<string[]>(todayLog?.inputsDone ?? []);
  const [mood, setMood] = useState<
    "locked-in" | "shipping" | "stuck" | "shipping-slow" | undefined
  >(todayLog?.mood);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

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
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      toast.error(errMsg || "Failed to save daily log");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nb-card p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-xl">Log today</h2>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        {todayStr} — upserts your daily row.
      </p>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ListChecks className="h-3 w-3" /> Daily inputs
        </p>
        <div className="mt-2 grid sm:grid-cols-2 gap-1.5">
          {DAILY_INPUTS.map((i) => {
            const on = inputsDone.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggleInput(i.id)}
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
            value={hoursCoded}
            onChange={(e) => setHoursCoded(parseFloat(e.target.value) || 0)}
          />
        </MiniField>
        <MiniField label="Commits" hint="gh / vercel">
          <Input
            type="number"
            min={0}
            value={commits}
            onChange={(e) => setCommits(parseInt(e.target.value) || 0)}
          />
        </MiniField>
        <MiniField label="Customers" hint="20 DMs/day target">
          <Input
            type="number"
            min={0}
            value={customersContacted}
            onChange={(e) =>
              setCustomersContacted(parseInt(e.target.value) || 0)
            }
          />
        </MiniField>
        <MiniField label="MRR today" hint="Stripe $USD">
          <Input
            type="number"
            min={0}
            value={mrrUsd}
            onChange={(e) => setMrrUsd(parseInt(e.target.value) || 0)}
          />
        </MiniField>
      </div>

      <MiniField label="Shipped URL" hint="Vercel deploy or commit">
        <Input
          value={shippedUrl}
          onChange={(e) => setShippedUrl(e.target.value)}
          placeholder="https://github.com/you/repo or https://*.vercel.app"
        />
      </MiniField>
      <MiniField label="Build-in-public post" hint="X / Makerlog URL">
        <Input
          value={bipPostUrl}
          onChange={(e) => setBipPostUrl(e.target.value)}
          placeholder="https://x.com/you/status/..."
        />
      </MiniField>
      <MiniField label="What did you ship?" hint="one line">
        <Input
          value={shippedNote}
          onChange={(e) => setShippedNote(e.target.value)}
          placeholder="Day 22 made my SaaS boilerplate."
        />
      </MiniField>
      <MiniField label="Notes">
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
              onClick={() => setMood(mood === id ? undefined : id)}
              className={cn(
                "nb-press px-2.5 py-1 text-xs rounded-sm border",
                mood === id
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
        <Button onClick={handleSave} disabled={busy || hasPreviousUnloggedDays}>
          <Save className="h-4 w-4 mr-1" />
          {busy ? "Logging…" : todayLog ? "Update log" : "Log day"}
        </Button>
        {hasPreviousUnloggedDays && (
          <p className="text-xs text-destructive font-mono mt-1">
            ⚠ Cannot log Day {activeDay} yet. There are unlogged days before this day.
          </p>
        )}
        {savedAt && !hasPreviousUnloggedDays && (
          <span className="text-[11px] text-muted-foreground">
            saved · {new Date(savedAt).toLocaleTimeString()}
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
}: {
  maxAllowedDay: number;
  licenseType: string;
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

          <div className="mt-6 w-full max-w-md text-left">
            <LifetimeDealCard cta="checkout" compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimerCard() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsActive(true);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="nb-card p-5 border-2 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm uppercase tracking-widest">Protocol Timer</h3>
        </div>
        {isActive && (
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="text-4xl font-mono font-bold tracking-tighter tabular-nums">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="nb-press h-8 text-[10px] font-mono"
            onClick={() => startTimer(120)}
          >
            2H Block
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="nb-press h-8 text-[10px] font-mono"
            onClick={() => startTimer(180)}
          >
            3H Block
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="nb-press h-8 text-[10px] font-mono"
            onClick={() => startTimer(25)}
          >
            Pomodoro
          </Button>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTimer}
            disabled={timeLeft === 0}
            className="h-10 w-10 rounded-full border border-border"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={resetTimer}
            className="h-10 w-10 rounded-full border border-border"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CoachCard({
  date,
  isPaid,
  hasLog,
  loading,
  error,
  onRegenerate,
}: {
  date: string;
  isPaid: boolean;
  hasLog: boolean;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
}) {
  const insight = useQuery(api.coach.getDailyInsight, { date });

  if (!isPaid) {
    return (
      <div className="nb-card p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute -top-3 -right-3 rotate-12 opacity-10">
          <Bot className="h-32 w-32" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-primary/20 text-primary p-1.5 rounded-full">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-sm uppercase tracking-widest font-bold">AI Coach</h3>
        </div>
        <p className="text-muted-foreground text-sm max-w-md relative z-10 font-mono">
          Save your daily logs and get personalized, no-BS feedback from your AI coach to stay on track.
        </p>
        <Button variant="outline" className="mt-4 font-mono text-xs z-10 relative" asChild>
          <Link to="/dashboard/billing">
            <Lock className="mr-2 h-3 w-3" /> Unlock with Lifetime License
          </Link>
        </Button>
      </div>
    );
  }

  if (!hasLog) {
    return (
      <div className="nb-card p-5 border-2 border-dashed border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">AI Coach</h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          Save your daily log to get personalized feedback.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="nb-card p-6 border-2 border-primary/30 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
            <Bot className="h-4 w-4" />
          </div>
          <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Coach is thinking...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-primary/10 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-primary/10 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-primary/10 rounded w-5/6 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-card p-5 border-2 border-destructive/50 bg-destructive/5">
        <p className="text-sm text-destructive font-mono">{error}</p>
        <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-3 font-mono text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  if (insight) {
    return (
      <div className="nb-card p-6 border-2 border-primary/30 bg-primary/5 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
              <Bot className="h-4 w-4" />
            </div>
            <h3 className="font-mono text-sm uppercase tracking-widest font-bold text-primary">Protocol Coach</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Regenerate"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="prose prose-sm dark:prose-invert font-sans nb-hand text-lg leading-relaxed max-w-none prose-p:my-2">
          <ReactMarkdown>{insight.content}</ReactMarkdown>
        </div>
      </div>
    );
  }
  return null;
}

