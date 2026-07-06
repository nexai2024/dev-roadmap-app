import { OUTPUTS, PHASES } from "@/data/protocol";
import { CheckCircle2, CircleDashed, Flag, Link2, Save } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MilestonesPage() {
  const milestones = useQuery(api.notebook.listMilestones);
  const setMilestoneStatus = useMutation(api.notebook.setMilestoneStatus);
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const proofFor = (id: string) => {
    return milestones?.find((m) => m.milestoneId === id)?.proofUrl ?? "";
  };

  const statusFor = (id: string): "not_started" | "in_progress" | "completed" => {
    const m = milestones?.find((ms) => ms.milestoneId === id);
    if (!m) return "not_started";
    return m.status as "not_started" | "in_progress" | "completed";
  };

  const setStatus = async (id: string, status: "not_started" | "in_progress" | "completed") => {
    setBusy(id);
    try {
      const url = drafts[id] ?? proofFor(id);
      await setMilestoneStatus({
        milestoneId: id,
        status,
        proofUrl: url || undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Flag className="h-3 w-3" />
          Outputs · 6 shippable milestones
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Milestones.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Each milestone has a verification. Paste the proof URL and the
          protocol moves you closer to $1k MRR.
        </p>
      </div>

      <div className="space-y-3">
        {milestones === undefined && (
          <div className="nb-card p-10 text-center animate-pulse text-muted-foreground font-mono">
            Loading milestones...
          </div>
        )}
        {OUTPUTS.map((m) => {
          const status = statusFor(m.id);
          const proof = proofFor(m.id);
          const phaseMeta = PHASES.find((p) => p.number === m.phase);
          return (
            <div
              key={m.id}
              className={cn(
                "nb-card p-5",
                status === "completed" && "border-[color:var(--chart-3)]",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "size-10 rounded-sm border flex items-center justify-center shrink-0",
                    status === "completed"
                      ? "bg-[color:var(--chart-3)] text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CircleDashed className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    Phase {m.phase} · {phaseMeta?.label}
                  </p>
                  <h3 className="font-mono text-base mt-0.5">{m.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Verification · {m.verification}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusPill
                      label="Not started"
                      active={status === "not_started"}
                      onClick={() => setStatus(m.id, "not_started")}
                    />
                    <StatusPill
                      label="In progress"
                      active={status === "in_progress"}
                      onClick={() => setStatus(m.id, "in_progress")}
                    />
                    <StatusPill
                      label="Completed"
                      active={status === "completed"}
                      onClick={() => setStatus(m.id, "completed")}
                    />
                  </div>

                  <div className="mt-3 flex gap-2 items-start">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> Proof URL
                      </p>
                      <Input
                        placeholder="Certificate / screenshot / dashboard URL"
                        value={drafts[m.id] ?? proof}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [m.id]: e.target.value }))
                        }
                      />
                    </div>
                    <Button
                      onClick={() => setStatus(m.id, status)}
                      disabled={busy === m.id}
                      className="mt-6"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>

                  {proof && (
                    <p className="text-[11px] mt-2">
                      <span className="text-muted-foreground">current ·</span>{" "}
                      <a
                        href={proof}
                        target="_blank"
                        rel="noreferrer"
                        className="underline break-all"
                      >
                        {proof}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nb-press text-xs font-mono px-2.5 py-1 rounded-sm border",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-sidebar-accent",
      )}
    >
      {label}
    </button>
  );
}
