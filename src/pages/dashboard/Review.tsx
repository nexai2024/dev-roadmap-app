import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarRange, ExternalLink, Save, Trash2 } from "lucide-react";

export default function ReviewPage() {
  const reviews = useQuery(api.notebook.listReviews);
  const createReview = useMutation(api.notebook.createReview);
  const deleteReview = useMutation(api.notebook.deleteReview);

  type ReviewRow = NonNullable<typeof reviews>[number];

  const [weekStartDate, setWeekStartDate] = useState(() => lastMondayISO());
  const [hours, setHours] = useState(0);
  const [weeksSinceDeploy, setWeeksSinceDeploy] = useState(0);
  const [mrrWeek, setMrrWeek] = useState(0);
  const [mrrLast, setMrrLast] = useState(0);
  const [summary, setSummary] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createReview({
        weekStartDate,
        hoursCoded: hours,
        weeksSinceLastDeploy: weeksSinceDeploy,
        mrrWeek,
        mrrLastWeek: mrrLast,
        summary,
        publishedUrl: publishedUrl || undefined,
        notes: notes || undefined,
      });
      setSummary("");
      setPublishedUrl("");
      setNotes("");
      setHours(0);
      setWeeksSinceDeploy(0);
      setMrrWeek(0);
      setMrrLast(0);
    } finally {
      setBusy(false);
    }
  };

  const sorted = (reviews ?? [])
    .slice()
    .sort((a, b) => (a.weekStartDate < b.weekStartDate ? 1 : -1));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3" />
          Sunday · 18:00 · 60 min
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Weekly review.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Compute hours / goal · weeks since last deploy · mrr_week /
          mrr_week_last_week · post the summary to X.
        </p>
      </div>

      <form onSubmit={save} className="nb-page nb-holes p-5 sm:p-7 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-mono text-lg">This week</h2>
          <Input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Hours coded">
            <Input
              type="number"
              min={0}
              step="0.25"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Weeks since last deploy">
            <Input
              type="number"
              min={0}
              value={weeksSinceDeploy}
              onChange={(e) => setWeeksSinceDeploy(parseInt(e.target.value) || 0)}
            />
          </Field>
          <Field label="MRR this week">
            <Input
              type="number"
              min={0}
              value={mrrWeek}
              onChange={(e) => setMrrWeek(parseInt(e.target.value) || 0)}
            />
          </Field>
          <Field label="MRR last week">
            <Input
              type="number"
              min={0}
              value={mrrLast}
              onChange={(e) => setMrrLast(parseInt(e.target.value) || 0)}
            />
          </Field>
        </div>
        <Field label="Summary">
          <Textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Three lines: what shipped, what broke, what you'll do next."
            required
          />
        </Field>
        <Field label="Published post URL" hint="X / Indie Hackers / blog">
          <Input
            value={publishedUrl}
            onChange={(e) => setPublishedUrl(e.target.value)}
            placeholder="https://x.com/you/status/..."
          />
        </Field>
        <Field label="Notes" hint="private">
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What you're proud of. What you're lying to yourself about."
          />
        </Field>
        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4 mr-1" />
          {busy ? "Saving…" : "Save weekly review"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-mono text-lg nb-rule">Past reviews</h2>
        {sorted.length === 0 && (
          <div className="nb-card p-6 text-center">
            <p className="font-mono text-sm">No reviews yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your first Sunday review will land here.
            </p>
          </div>
        )}
        {sorted.map((r: ReviewRow) => {
          const delta = r.mrrWeek - r.mrrLastWeek;
          const deltaPct =
            r.mrrLastWeek > 0
              ? Math.round((delta / r.mrrLastWeek) * 100)
              : r.mrrWeek > 0
                ? 100
                : 0;
          return (
            <div key={r._id} className="nb-card p-4">
              <div className="flex items-start gap-3">
                <div className="font-mono font-bold text-base tabular-nums shrink-0">
                  {r.weekStartDate}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 text-[11px]">
                    <Tag>hours {Math.round(r.hoursCoded * 10) / 10}</Tag>
                    <Tag>
                      deploys · {r.weeksSinceLastDeploy === 0 ? "this week" : `${r.weeksSinceLastDeploy}w ago`}
                    </Tag>
                    <Tag>
                      MRR ${r.mrrWeek}{" "}
                      {delta !== 0 && (
                        <span
                          className={
                            delta > 0
                              ? "text-[color:var(--chart-3)]"
                              : "text-[color:var(--chart-2)]"
                          }
                        >
                          {delta > 0 ? "+" : ""}
                          {delta} ({deltaPct}%)
                        </span>
                      )}
                    </Tag>
                    {r.publishedUrl && (
                      <a
                        href={r.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-[11px] inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        published
                      </a>
                    )}
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-line">{r.summary}</p>
                  {r.notes && (
                    <p className="text-[11px] text-muted-foreground italic mt-1.5 whitespace-pre-line">
                      "{r.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteReview({ id: r._id })}
                  className="text-muted-foreground hover:text-destructive nb-press"
                  title="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal">— {hint}</span> : null}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-border rounded-sm bg-card text-foreground">
      {children}
    </span>
  );
}

function lastMondayISO() {
  const d = new Date();
  const day = d.getDay(); // 0 sun .. 6 sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
