import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Save, Mail, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const OUTREACH_TYPES = [
  { value: "cold-email", label: "Cold Email", icon: Mail },
  { value: "seo", label: "SEO / Content", icon: Search },
  { value: "social", label: "Social Outreach", icon: MessageSquare },
  { value: "other", label: "Other", icon: Share2 },
];

export default function DistributionPage() {
  const logs = useQuery(api.notebook.listOutreachLogs);
  const logOutreach = useMutation(api.notebook.logOutreach);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("cold-email");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await logOutreach({
        date,
        type,
        target,
        result: result || undefined,
        notes: notes || undefined,
      });
      setTarget("");
      setResult("");
      setNotes("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Share2 className="h-3 w-3" />
          Phases 6 & 7 · Distribution Machine
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Distribution.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Track your cold emails, SEO posts, and manual outreach. Consistency in
          distribution is what leads to MRR.
        </p>
      </div>

      <form onSubmit={save} className="nb-page nb-holes p-5 sm:p-7 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              Date
            </p>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              Type
            </p>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTREACH_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />
                      <span>{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Target / Goal
          </p>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 50 Apollo leads, 'Best SaaS tools' blog post, 20 DMs"
            required
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Immediate Result (Optional)
          </p>
          <Input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="e.g. 2 replies, indexed by Google, 5 clicks"
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Notes
          </p>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Follow-up details, links, etc."
          />
        </div>

        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4 mr-1" />
          {busy ? "Logging…" : "Log Outreach Activity"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-mono text-lg nb-rule">Distribution History</h2>
        {logs === undefined ? (
          <div className="nb-card p-6 text-center animate-pulse text-muted-foreground">
            Loading distribution logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="nb-card p-6 text-center text-muted-foreground">
            No activities logged yet. Time to start the machine.
          </div>
        ) : null}
        {logs?.map((l) => {
          const typeInfo = OUTREACH_TYPES.find((t) => t.value === l.type) || OUTREACH_TYPES[3];
          return (
            <div key={l._id} className="nb-card p-4 flex items-start gap-4">
              <div className="size-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                <typeInfo.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold">{l.target}</p>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {l.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Tag>{typeInfo.label}</Tag>
                  {l.result && <Tag accent>{l.result}</Tag>}
                </div>
                {l.notes && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {l.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
        "font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border rounded-sm",
        accent
          ? "bg-[color:var(--chart-3)] text-primary-foreground border-transparent"
          : "bg-muted text-muted-foreground border-border",
      )}
    >
      {children}
    </span>
  );
}
