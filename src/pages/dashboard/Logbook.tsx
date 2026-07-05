import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Clock, ExternalLink, MessageSquare, Trash2, Wrench, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function LogbookPage() {
  const logs = useQuery(api.notebook.listLogs, { limit: 200 });
  const deleteLog = useMutation(api.notebook.deleteLog);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = useMemo(
    () => (logs ?? []).slice().sort((a, b) => (a.date < b.date ? 1 : -1)),
    [logs],
  );

  const totals = useMemo(() => {
    const r = { hours: 0, commits: 0, customers: 0, mrr: 0, days: 0 };
    for (const l of sorted) {
      r.hours += l.hoursCoded;
      r.commits += l.commits;
      r.customers += l.customersContacted;
      r.mrr = Math.max(r.mrr, l.mrrUsd);
      r.days += 1;
    }
    return r;
  }, [sorted]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" />
          Engineer-grade history
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Logbook.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Every daily row you've ever filed. Newest first. One click to
          delete a wrong entry.
        </p>
      </div>

      <div className="grid sm:grid-cols-5 gap-3">
        <Stat label="Days" value={totals.days} />
        <Stat label="Hours" value={Math.round(totals.hours * 10) / 10} />
        <Stat label="Commits" value={totals.commits} />
        <Stat label="Talked" value={totals.customers} />
        <Stat label="MRR" value={`$${totals.mrr}`} accent />
      </div>

      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="nb-card p-8 text-center">
            <p className="font-mono text-sm">Empty logbook.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your first row appears the day you log a session. Start on the
              <a href="/dashboard/today" className="underline ml-1">
                Today
              </a>{" "}
              page.
            </p>
          </div>
        )}
        {sorted.map((l) => {
          const isConfirming = confirmId === l._id;
          return (
            <div key={l._id} className="nb-card p-4">
              <div className="flex items-start gap-3">
                <div className="font-mono text-base font-bold tabular-nums w-[110px] shrink-0">
                  {l.date}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                      {l.phaseId.replace("phase:", "")}
                    </span>
                    {l.mood && (
                      <span className="nb-stamp text-primary">
                        {l.mood}
                      </span>
                    )}
                    {l.shippedUrl && (
                      <a
                        href={l.shippedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] underline inline-flex items-center gap-1"
                      >
                        <Wrench className="h-3 w-3" /> shipped
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {l.bipPostUrl && (
                      <a
                        href={l.bipPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] underline inline-flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" /> BIP post
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {l.shippedNote && (
                    <p className="text-sm">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-1.5">
                        shipped
                      </span>
                      <span className="nb-highlight">{l.shippedNote}</span>
                    </p>
                  )}
                  <Row label="hours">{l.hoursCoded.toString()}</Row>
                  <Row label="commits">{l.commits.toString()}</Row>
                  <Row label="customers">{l.customersContacted.toString()}</Row>
                  <Row label="MRR">{`$${l.mrrUsd}`}</Row>
                  <Row label="inputs">
                    {l.inputsDone.length}/{l.inputsDone.length || "—"}
                  </Row>
                  {l.notes && (
                    <p className="text-[11px] text-muted-foreground italic mt-1.5 whitespace-pre-line">
                      "{l.notes}"
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {isConfirming ? (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteLog({ id: l._id });
                          setConfirmId(null);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(l._id)}
                      className="text-muted-foreground hover:text-destructive nb-press"
                      title="Delete row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "nb-card p-3 " + (accent ? "border-[color:var(--chart-3)]" : "")
      }
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1">
        <Clock className="h-3 w-3" /> {label}
      </p>
      <p className="font-mono text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-muted-foreground">
      <span className="font-mono uppercase tracking-widest mr-1.5">{label} ·</span>
      {children}
    </p>
  );
}
