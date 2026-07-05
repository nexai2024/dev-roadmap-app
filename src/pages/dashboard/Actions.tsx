import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KEY_ACTIONS, PHASES } from "@/data/protocol";
import { useState } from "react";
import { CheckCircle2, CircleDashed, CircleDotDashed, ClipboardList, Link2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ActionsPage() {
  const allProgress = useQuery(api.notebook.allActionProgress);
  const setActionStatus = useMutation(api.notebook.setActionStatus);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftProof, setDraftProof] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const statusFor = (actionId: string) =>
    allProgress?.find((p) => p.actionId === actionId)?.status ?? "not_started";
  const proofFor = (actionId: string) =>
    allProgress?.find((p) => p.actionId === actionId)?.proofUrl ?? "";
  const notesFor = (actionId: string) =>
    allProgress?.find((p) => p.actionId === actionId)?.notes ?? "";

  const setStatus = async (actionId: string, status: "not_started" | "in_progress" | "completed") => {
    setBusyId(actionId);
    try {
      await setActionStatus({
        actionId,
        status,
        proofUrl: proofFor(actionId) || undefined,
        notes: notesFor(actionId) || undefined,
      });
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (actionId: string) => {
    setBusyId(actionId);
    try {
      await setActionStatus({
        actionId,
        status: statusFor(actionId),
        proofUrl: draftProof || undefined,
        notes: draftNotes || undefined,
      });
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
  };

  const completed = allProgress?.filter((p) => p.status === "completed").length ?? 0;
  const total = KEY_ACTIONS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <ClipboardList className="h-3 w-3" />
            11 numbered actions
          </p>
          <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
            Key actions.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Each action has a deliverable and a success criteria. Toggle status as
            you ship. Paste your proof URL.
          </p>
        </div>
        <div className="nb-card p-3 text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Progress
          </p>
          <p className="font-mono text-xl font-bold">
            {String(completed).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="h-1.5 mt-2 w-40 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--chart-3)] transition-all"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {KEY_ACTIONS.map((a, idx) => {
          const status = statusFor(a.id);
          const phaseMeta = PHASES.find((p) => p.id === a.phaseId);
          const isEditing = editingId === a.id;
          return (
            <div
              key={a.id}
              className={cn(
                "nb-card overflow-hidden",
                status === "completed" && "border-[color:var(--chart-3)]",
              )}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-3xl font-mono font-bold text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-mono text-base">{a.title}</h3>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {phaseMeta?.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-auto">
                        {a.window}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Resource:{" "}
                      {a.resource?.startsWith("http") ? (
                        <a
                          className="underline hover:text-primary"
                          href={a.resource}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {a.resource}
                        </a>
                      ) : (
                        a.resource
                      )}
                    </p>
                    {a.dailyTime && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Daily time · {a.dailyTime}
                      </p>
                    )}
                    {a.deliverable && (
                      <p className="text-[11px] mt-1.5">
                        <span className="text-muted-foreground">Deliverable · </span>
                        {a.deliverable}
                      </p>
                    )}
                    {a.method && (
                      <p className="text-[11px] mt-1.5">
                        <span className="text-muted-foreground">Method · </span>
                        {a.method}
                      </p>
                    )}
                    <div className="mt-2.5 pt-2 border-t border-dashed border-border">
                      <p className="text-[11px]">
                        <span className="text-muted-foreground uppercase text-[10px] tracking-widest font-mono">
                          success ·
                        </span>{" "}
                        {a.successCriteria}
                      </p>
                    </div>
                    {a.channels && (
                      <div className="mt-2.5 grid sm:grid-cols-2 gap-1.5">
                        {a.channels.map((c) => (
                          <div key={c.label} className="nb-card p-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {c.label}
                            </p>
                            <p className="text-[11px] mt-0.5">{c.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-wrap items-center gap-2">
                  <StatusButton
                    active={status === "not_started"}
                    onClick={() => setStatus(a.id, "not_started")}
                    icon={CircleDashed}
                    label="Not started"
                  />
                  <StatusButton
                    active={status === "in_progress"}
                    onClick={() => setStatus(a.id, "in_progress")}
                    icon={CircleDotDashed}
                    label="In progress"
                  />
                  <StatusButton
                    active={status === "completed"}
                    onClick={() => setStatus(a.id, "completed")}
                    icon={CheckCircle2}
                    label="Completed"
                  />
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditingId(null);
                      } else {
                        setDraftProof(proofFor(a.id));
                        setDraftNotes(notesFor(a.id));
                        setEditingId(a.id);
                      }
                    }}
                    className="nb-press ml-auto text-xs font-mono px-2.5 py-1 rounded-sm border border-border hover:bg-sidebar-accent flex items-center gap-1"
                  >
                    <Link2 className="h-3 w-3" />
                    {proofFor(a.id) || notesFor(a.id) ? "Edit proof" : "Add proof"}
                  </button>
                </div>

                {(proofFor(a.id) && !isEditing) && (
                  <div className="mt-2 text-[11px]">
                    <span className="text-muted-foreground">proof ·</span>{" "}
                    <a
                      href={proofFor(a.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline truncate inline-block max-w-full align-bottom"
                    >
                      {proofFor(a.id)}
                    </a>
                  </div>
                )}
                {(notesFor(a.id) && !isEditing) && (
                  <p className="mt-1 text-[11px] text-muted-foreground italic">
                    "{notesFor(a.id)}"
                  </p>
                )}

                {isEditing && (
                  <div className="mt-3 space-y-2.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                        Proof URL
                      </p>
                      <Input
                        value={draftProof}
                        onChange={(e) => setDraftProof(e.target.value)}
                        placeholder="Link to the ship — GitHub, Stripe dashboard, Product Hunt page."
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                        Notes
                      </p>
                      <Textarea
                        rows={2}
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder="What you'd tell yourself next time."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(a.id)}
                        disabled={busyId === a.id}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nb-press text-xs font-mono px-2.5 py-1 rounded-sm border flex items-center gap-1.5",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-sidebar-accent",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
