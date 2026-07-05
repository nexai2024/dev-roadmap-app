import { OUTPUTS, PHASES } from "@/data/protocol";
import { CheckCircle2, CircleDashed, Flag, Link2, Save } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Per-user milestone proof stored on a dailyLog entry keyed by `notes` line
// "milestone:<id>:<status>:<url>" — kept simple, no new table.

export default function MilestonesPage() {
  const logs = useQuery(api.notebook.listLogs, { limit: 200 });
  const upsertLog = useMutation(api.notebook.upsertLog);
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Parse stored proof from the most recent log line containing "milestone:<id>:"
  const proofFor = (id: string) => {
    if (!logs) return "";
    for (const log of logs) {
      if (!log.notes) continue;
      const lines = log.notes.split("\n");
      for (const line of lines) {
        const m = line.match(new RegExp(`^milestone:${id}:(.*):(.*)$`));
        if (m) return m[2] ?? "";
      }
    }
    return "";
  };

  const statusFor = (id: string): "not_started" | "in_progress" | "completed" => {
    if (!logs) return "not_started";
    for (const log of logs) {
      if (!log.notes) continue;
      const lines = log.notes.split("\n");
      for (const line of lines) {
        const m = line.match(new RegExp(`^milestone:${id}:(.*):(.*)$`));
        if (m) {
          const value = m[1] as "not_started" | "in_progress" | "completed";
          return value;
        }
      }
    }
    return "not_started";
  };

  const setStatus = async (id: string, status: "not_started" | "in_progress" | "completed") => {
    setBusy(id);
    try {
      const url = drafts[id] ?? proofFor(id);
      const marker = `milestone:${id}:${status}:${url}`;
      const today = {
        date: new Date().toISOString().slice(0, 10),
        phaseId: "phase:growth",
        hoursCoded: 0,
        commits: 0,
        customersContacted: 0,
        mrrUsd: 0,
        inputsDone: [],
        notes: marker,
      };
      await upsertLog(today);
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
