import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DAILY_INPUTS, type PhaseId } from "@/data/protocol";
import { useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  CircleDot,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function InputsPage() {
  const profile = useQuery(api.notebook.currentProfile);
  const todayLog = useQuery(api.notebook.todayLog, {});
  const logs = useQuery(api.notebook.listLogs, { limit: 30 });
  const upsertLog = useMutation(api.notebook.upsertLog);
  const [busy, setBusy] = useState<string | null>(null);

  const currentPhase =
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:fundamentals";
  const inputsDone = todayLog?.inputsDone ?? [];

  const toggleInput = async (id: string) => {
    setBusy(id);
    try {
      const next = inputsDone.includes(id)
        ? inputsDone.filter((x) => x !== id)
        : [...inputsDone, id];
      const todayStr = new Date().toISOString().slice(0, 10);
      await upsertLog({
        date: todayStr,
        phaseId: currentPhase,
        hoursCoded: todayLog?.hoursCoded ?? 0,
        commits: todayLog?.commits ?? 0,
        shippedUrl: todayLog?.shippedUrl,
        bipPostUrl: todayLog?.bipPostUrl,
        customersContacted: todayLog?.customersContacted ?? 0,
        mrrUsd: todayLog?.mrrUsd ?? 0,
        notes: todayLog?.notes,
        inputsDone: next,
        shippedNote: todayLog?.shippedNote,
        mood: todayLog?.mood,
      });
      toast.success("Daily inputs updated!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      toast.error(errMsg || "Failed to update daily inputs");
    } finally {
      setBusy(null);
    }
  };

  // 7-day roll-up of hits per input
  const last7 = (logs ?? []).slice(0, 7);
  const tallyByInput: Record<string, number> = {};
  for (const i of DAILY_INPUTS) tallyByInput[i.id] = 0;
  for (const log of last7) {
    for (const id of log.inputsDone) {
      tallyByInput[id] = (tallyByInput[id] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ListChecks className="h-3 w-3" />
          Daily inputs · 6 non-negotiables
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Daily inputs.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          These are the inputs that drive every other output. Check them as
          you hit them. The protocol dashboard rolls them up to MRR.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAILY_INPUTS.map((i) => {
          const on = inputsDone.includes(i.id);
          const days = tallyByInput[i.id] ?? 0;
          return (
            <div
              key={i.id}
              className={cn(
                "nb-card p-5 transition-shadow",
                on && "border-primary shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    {i.frequency}
                  </p>
                  <h3 className="font-mono text-base mt-0.5">{i.label}</h3>
                </div>
                <button
                  disabled={busy === i.id}
                  onClick={() => toggleInput(i.id)}
                  className={cn(
                    "nb-press size-10 rounded-sm border flex items-center justify-center",
                    on
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-sidebar-accent",
                  )}
                  title={on ? "Mark not done today" : "Mark done today"}
                >
                  {on ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {i.description}
              </p>
              <div className="mt-3 pt-3 border-t border-dashed border-border flex items-center justify-between text-[11px]">
                <span className="font-mono uppercase tracking-widest text-muted-foreground">
                  last 7d
                </span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "size-2.5 rounded-sm border",
                        idx < days
                          ? "bg-primary border-primary"
                          : "border-border",
                      )}
                    />
                  ))}
                  <span className="font-mono text-foreground ml-1">
                    {days}/7
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="nb-card p-5">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-base">What "tracking metrics" looks like</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Each Sunday at 18:00 you run the weekly review form: hours_coded / goal,
          weeks since last deploy, mrr_week / mrr_week_last_week. Today you can
          log a single day's row from the{" "}
          <a className="underline" href="/dashboard/today">
            Today
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
