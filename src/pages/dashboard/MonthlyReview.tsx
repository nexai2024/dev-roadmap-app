import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarRange, Save, Trash2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MonthlyReviewPage() {
  const reviews = useQuery(api.notebook.listMonthlyReviews);
  const createReview = useMutation(api.notebook.createMonthlyReview);

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  // Aggregate stats for the selected month via server-side query
  const aggregated = useQuery(api.notebook.aggregateMonthStats, { month }) || {
    hours: 0,
    commits: 0,
    mrr: 0,
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createReview({
        month,
        totalHours: aggregated.hours,
        totalCommits: aggregated.commits,
        mrrEnd: aggregated.mrr,
        summary,
        notes: notes || undefined,
      });
      setSummary("");
      setNotes("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3" />
          30-Day Review · Monthly Aggregation
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Monthly review.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Long-term trend analysis. Aggregate your daily logs into a monthly
          snapshot to see the big picture.
        </p>
      </div>

      <form onSubmit={save} className="nb-page nb-holes p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-mono text-lg">Month of {month}</h2>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Total Hours" value={aggregated.hours.toFixed(1)} />
          <StatBox label="Total Commits" value={aggregated.commits.toString()} />
          <StatBox label="End MRR" value={`$${aggregated.mrr}`} />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Monthly Summary
          </p>
          <Textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What was the biggest win this month? What's the main obstacle for the next 30 days?"
            required
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Private Notes
          </p>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Honest reflections..."
          />
        </div>

        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4 mr-1" />
          {busy ? "Saving…" : "Save Monthly Review"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-mono text-lg nb-rule">Past Monthly Reviews</h2>
        {reviews === undefined ? (
          <div className="nb-card p-6 text-center animate-pulse text-muted-foreground">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="nb-card p-6 text-center">
            <p className="font-mono text-sm">No monthly reviews yet.</p>
          </div>
        ) : null}
        {reviews?.map((r) => (
          <div key={r._id} className="nb-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-lg">{r.month}</h3>
              <div className="flex gap-2">
                <Tag>H: {r.totalHours}</Tag>
                <Tag>C: {r.totalCommits}</Tag>
                <Tag accent>${r.mrrEnd} MRR</Tag>
              </div>
            </div>
            <p className="text-sm whitespace-pre-line">{r.summary}</p>
            {r.notes && (
              <p className="text-[11px] text-muted-foreground italic border-t pt-2 mt-2">
                "{r.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-card p-3 text-center">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
        {label}
      </p>
      <p className="text-xl font-mono font-bold mt-1">{value}</p>
    </div>
  );
}

function Tag({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-sm",
        accent
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border",
      )}
    >
      {children}
    </span>
  );
}
