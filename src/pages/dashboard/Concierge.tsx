import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConciergeBell, Save, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConciergePage() {
  const orders = useQuery(api.notebook.listConciergeOrders);
  const logOrder = useMutation(api.notebook.logConciergeOrder);
  const updateOrder = useMutation(api.notebook.updateConciergeOrder);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState(20);
  const [notes, setNotes] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await logOrder({
        date,
        customerName: customer,
        amount,
        status: "pending",
        notes: notes || undefined,
      });
      setCustomer("");
      setAmount(20);
      setNotes("");
    } finally {
      setBusy(false);
    }
  };

  const markFulfilled = async (id: Id<"conciergeOrders">) => {
    await updateOrder({
      id,
      status: "fulfilled",
      feedback: feedbackMap[id] || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ConciergeBell className="h-3 w-3" />
          Phase 3 · Validation & Concierge
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Concierge.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Don't build features until someone pays for the manual version. Track
          your first orders and fulfillment here.
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
              Amount ($)
            </p>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Customer Name / Handle
          </p>
          <Input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="e.g. @startup_founder, John Doe"
            required
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Initial Requirements / Notes
          </p>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What do they need? What did they pay for?"
          />
        </div>

        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4 mr-1" />
          {busy ? "Saving…" : "Log Concierge Order"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-mono text-lg nb-rule">Active Orders</h2>
        {orders === undefined ? (
          <div className="nb-card p-6 text-center animate-pulse text-muted-foreground">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="nb-card p-6 text-center text-muted-foreground">
            No orders logged. Go find a customer who will pay you $20.
          </div>
        ) : null}
        {orders?.map((o) => (
          <div key={o._id} className={cn("nb-card p-4 flex flex-col gap-3", o.status === "fulfilled" && "opacity-75")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold">{o.customerName}</p>
                <Badge variant={o.status === "fulfilled" ? "default" : "outline"}>
                  {o.status}
                </Badge>
              </div>
              <p className="font-mono font-bold">${o.amount}</p>
            </div>

            <p className="text-sm">{o.notes}</p>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-[10px] font-mono text-muted-foreground">
                Ordered on {o.date}
              </p>
              {o.status === "pending" && (
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-mono text-muted-foreground">Customer Feedback</p>
                    <Input
                      placeholder="Optional feedback..."
                      className="h-8 text-xs w-48"
                      value={feedbackMap[o._id] || ""}
                      onChange={(e) => setFeedbackMap(prev => ({ ...prev, [o._id]: e.target.value }))}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markFulfilled(o._id)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Fulfill
                  </Button>
                </div>
              )}
            </div>

            {o.status === "fulfilled" && o.feedback && (
              <div className="bg-muted p-2 rounded-sm mt-1">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Feedback</p>
                <p className="text-xs italic">"{o.feedback}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
