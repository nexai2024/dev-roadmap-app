import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MONTH_1_SCHEDULE, PHASES, type PhaseId, DAILY_INPUTS, NON_NEGOTIABLES } from "@/data/protocol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  ListChecks,
  Pencil,
  Save,
  Sparkles,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function TodayPage() {
  const { user } = useAuth();
  const profile = useQuery(api.notebook.currentProfile);
  const todayLog = useQuery(api.notebook.todayLog);
  const upsertLog = useMutation(api.notebook.upsertLog);

  // Compute today's day-of-protocol number based on startedAt
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
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:fundamentals";
  const phaseMeta = PHASES.find((p) => p.id === currentPhase) ?? PHASES[0];

  // The current schedule entry — Month 1 has the only detailed daily plan.
  // Day 31+: we fall back to phase-level guidance (Months 2/3 schedules
  // arrive when the user supplies them).
  const inMonthOne =
    currentPhase === "phase:fundamentals" && today <= MONTH_1_SCHEDULE.length;
  const scheduleEntry = inMonthOne
    ? MONTH_1_SCHEDULE[today - 1]
    : null;

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

  // Hydrate from today's log
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

  // First-time-setup gate is handled in DashboardLayout; this is a safety net.

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

  return (
    <div className="space-y-6">
      <Header
        title={`Day ${today} of 100 · Good ${greeting()}, ${profile?.displayName ?? user?.name ?? "founder"}.`}
        subtitle={`Phase ${phaseMeta.number} · ${phaseMeta.label} · ${phaseMeta.window} · ${inMonthOne ? "Month 1 detailed plan" : "Phase-level plan"}`}
      />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        {/* Schedule card */}
        <div className="nb-page nb-holes p-5 sm:p-7">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Today's schedule
          </p>
          <h2 className="font-mono text-xl mt-1">
            {scheduleEntry
              ? `Day ${scheduleEntry.day} · ${scheduleEntry.weekday}`
              : `Day ${today} · post-Month 1`}
          </h2>
          <p className="font-mono text-base mt-2 nb-highlight inline-block">
            {scheduleEntry?.focus ?? "Pick the next action that ships revenue."}
          </p>

          {scheduleEntry ? (
            <ol className="mt-5 space-y-2.5">
              {scheduleEntry.schedule.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-mono font-bold text-primary shrink-0 tabular-nums">
                    ▢
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4 nb-card p-3 bg-[color:var(--chart-1)]/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Phase-level guidance
              </p>
              <p className="text-sm mt-1.5 leading-relaxed">
                {phaseMeta.internals.split(".")[0]}.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Day {today} is in phase {phaseMeta.number}: <span className="font-mono">{phaseMeta.label}</span>. Open the{" "}
                <a href="/dashboard/actions" className="underline">
                  Actions page
                </a>{" "}
                to find today's deliverable for this phase, and the{" "}
                <a href="/dashboard/phases" className="underline">
                  Phases page
                </a>{" "}
                for the exit gate.
              </p>
              <p className="nb-hand text-base text-muted-foreground mt-2">
                "Phone in another room. Open the tutorial. Ship ugly."
              </p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-dashed border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ship by EOD
            </p>
            <p className="text-sm mt-1 leading-relaxed">
              {scheduleEntry?.ship ??
                `Push a commit. Log a row. Read 30 min of docs. Tick today's action as 'in_progress'.`}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Non-negotiables
            </p>
            <ul className="mt-2 space-y-1.5">
              {NON_NEGOTIABLES.map((nn) => (
                <li key={nn.time} className="flex gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <span>
                    <span className="font-mono font-bold">{nn.time}</span> — {nn.rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick log */}
        <div className="nb-card p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            <h2 className="font-mono text-xl">Log today</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {todayStr} — upserts your daily row.
          </p>

          {/* Daily inputs checklist */}
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
            <MiniField label="Hours coded" hint="min 90 min">
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
            <MiniField label="Customers" hint="2x/wk target">
              <Input
                type="number"
                min={0}
                value={customersContacted}
                onChange={(e) =>
                  setCustomersContacted(parseInt(e.target.value) || 0)
                }
              />
            </MiniField>
            <MiniField label="MRR today" hint="$USD">
              <Input
                type="number"
                min={0}
                value={mrrUsd}
                onChange={(e) => setMrrUsd(parseInt(e.target.value) || 0)}
              />
            </MiniField>
          </div>

          <MiniField label="Shipped URL" hint="the link that proves it">
            <Input
              value={shippedUrl}
              onChange={(e) => setShippedUrl(e.target.value)}
              placeholder="https://github.com/you/repo/commit/... or *.vercel.app"
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
              placeholder="Pushed CS50 PS1. Clean commit, no warnings."
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

          <div className="flex items-center gap-2 mt-5">
            <Button onClick={handleSave} disabled={busy}>
              <Save className="h-4 w-4 mr-1" />
              {busy ? "Logging…" : todayLog ? "Update log" : "Log day"}
            </Button>
            {savedAt && (
              <span className="text-[11px] text-muted-foreground">
                saved · {new Date(savedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <LinkCard
          to="/dashboard/actions"
          icon={Sparkles}
          title="Active actions"
          text="See what's in_progress and what you're one commit away from completing."
        />
        <LinkCard
          to="/dashboard/logbook"
          icon={Wrench}
          title="Logbook"
          text="All your daily rows, newest first. Engineer-grade history."
        />
        <LinkCard
          to="/dashboard/review"
          icon={CheckCircle2}
          title="Sunday review"
          text="Compute. Post. Iterate. Every week."
        />
      </div>
    </div>
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
      <p className="text-muted-foreground text-xs mt-1 font-mono">
        {subtitle}
      </p>
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
        {hint ? <span className="ml-2 normal-case tracking-normal text-muted-foreground">— {hint}</span> : null}
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
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-snug">{text}</p>
    </a>
  );
}
