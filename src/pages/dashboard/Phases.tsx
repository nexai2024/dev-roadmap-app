import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PHASES, type PhaseId } from "@/data/protocol";
import { ArrowRight, CheckCircle2, Layers, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function PhasesPage() {
  const profile = useQuery(api.notebook.currentProfile);
  const updateProfile = useMutation(api.notebook.updateProfile);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentPhaseId =
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:ai-fundamentals";
  const currentPhaseIndex = PHASES.findIndex((p) => p.id === currentPhaseId);

  const advancePhase = async (id: PhaseId) => {
    const idx = PHASES.findIndex((p) => p.id === id);
    await updateProfile({
      currentPhase: id,
      currentDay: idx === 0 ? 1 : (profile?.currentDay ?? 1),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          Architecture · 7 phases with hard exit gates
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1 leading-tight">
          Phases.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Every phase feeds the next. Each exit gate is a real artifact. You
          cannot skip. Pick where you are, then don't move on until your exit
          gate is shipped.
        </p>
      </div>

      <div className="space-y-3">
        {PHASES.map((p, idx) => {
          const isCurrent = p.id === currentPhaseId;
          const isPast = idx < currentPhaseIndex;
          const isLocked = idx > currentPhaseIndex;
          const isOpen = expandedId === p.id || isCurrent;
          return (
            <div
              key={p.id}
              className={cn(
                "nb-card overflow-hidden transition-shadow",
                isCurrent && "border-primary shadow-md",
              )}
            >
              <button
                onClick={() => setExpandedId(isOpen && !isCurrent ? null : p.id)}
                className="w-full text-left p-5 sm:p-6 nb-press"
              >
                <div className="flex items-start gap-4">
                  <div className="text-center shrink-0">
                    <div
                      className={cn(
                        "font-mono font-bold text-3xl tabular-nums",
                        isCurrent ? "text-primary" : isPast ? "text-[color:var(--chart-3)]" : "text-muted-foreground",
                      )}
                    >
                      {String(p.number).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {p.window}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-lg">{p.label}</h2>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                        {p.slug}
                      </span>
                      {isCurrent && (
                        <span className="nb-stamp text-primary ml-auto">current</span>
                      )}
                      {isPast && (
                        <span className="nb-stamp text-[color:var(--chart-3)] ml-auto">
                          <CheckCircle2 className="inline h-3 w-3 mr-1" />
                          passed
                        </span>
                      )}
                      {isLocked && (
                        <span className="nb-stamp text-muted-foreground ml-auto">
                          <Lock className="inline h-3 w-3 mr-1" />
                          locked
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-2 leading-relaxed">{p.purpose}</p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 border-t border-dashed border-border pt-5 space-y-4">
                  <Grid
                    label="Internals"
                    text={p.internals}
                  />
                  <Grid
                    label="Mechanics"
                    text={p.mechanics}
                  />
                  <div className="nb-highlight inline-block">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
                      Exit gate ·{" "}
                    </span>
                    <span className="text-sm">{p.exitGate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Feeds: {p.connectsTo}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {!isCurrent && idx > currentPhaseIndex && (
                      <button
                        onClick={() => advancePhase(p.id)}
                        className="nb-press text-xs font-mono px-2.5 py-1.5 border border-border rounded-sm hover:bg-sidebar-accent"
                      >
                        Set as current {p.label}
                      </button>
                    )}
                    {isCurrent && idx < PHASES.length - 1 && (
                      <button
                        onClick={() => advancePhase(PHASES[idx + 1].id)}
                        className="nb-press text-xs font-mono px-2.5 py-1.5 bg-primary text-primary-foreground rounded-sm inline-flex items-center gap-1"
                      >
                        Advance to phase {p.number + 1}: {PHASES[idx + 1].label}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                    {isPast && (
                      <button
                        onClick={() => advancePhase(p.id)}
                        className="nb-press text-xs font-mono px-2.5 py-1.5 border border-border rounded-sm hover:bg-sidebar-accent"
                      >
                        Make current again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Grid({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid sm:grid-cols-[100px_1fr] gap-x-3 gap-y-1 items-start">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono pt-1">
        {label}
      </span>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
