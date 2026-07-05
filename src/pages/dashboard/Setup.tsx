import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PHASES } from "@/data/protocol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Compass } from "lucide-react";

export default function SetupPage() {
  const navigate = useNavigate();
  const completeSetup = useMutation(api.notebook.completeSetup);
  const [displayName, setDisplayName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [bio, setBio] = useState("");
  const [dayOne, setDayOne] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [busy, setBusy] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setBusy(true);
    try {
      const startedAt = new Date(dayOne).getTime();
      await completeSetup({
        displayName: displayName.trim(),
        startedAt,
        currentPhase: PHASES[0].id,
        currentDay: 1,
        bio: bio.trim() || undefined,
        twitterHandle: twitterHandle.trim() || undefined,
      });
      navigate("/dashboard/today");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="nb-page nb-holes p-6 sm:p-10 relative overflow-hidden">
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg]">
          First page · Setup
        </p>
        <div className="flex items-start gap-3 mt-3">
          <Compass className="h-6 w-6 text-primary shrink-0" />
          <div>
            <h1 className="font-mono text-2xl md:text-3xl font-semibold leading-tight">
              Date the notebook.
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Tell the protocol your name, when Day 1 starts, and which X
              handle to credit when you ship. This is your cover page. You can
              edit everything later.
            </p>
          </div>
        </div>

        <form onSubmit={handleStart} className="mt-6 space-y-5">
          <Field label="Display name" hint="How you'll sign your build-in-public posts.">
            <Input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sam River"
            />
          </Field>
          <Field label="X / Twitter handle" hint="Optional. Without @ — used to attribute public posts.">
            <Input
              value={twitterHandle}
              onChange={(e) =>
                setTwitterHandle(e.target.value.replace(/^@/, ""))
              }
              placeholder="samriver"
            />
          </Field>
          <Field label="One-line bio" hint="Optional. The 17-word origin story.">
            <Textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex-accountant. Building tiny tools. Targeting $1k MRR by month 18."
            />
          </Field>
          <Field label="Day 1 date" hint="The date CS50x Lecture 0 hits your screen.">
            <Input
              type="date"
              value={dayOne}
              onChange={(e) => setDayOne(e.target.value)}
            />
          </Field>

          <div className="nb-card p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              You start here
            </p>
            <p className="font-mono text-sm mt-1">
              {PHASES[0].label} · {PHASES[0].window} · Day 1 of month 1
            </p>
            <p className="nb-hand text-base text-muted-foreground mt-2">
              "Phone in another room. Open CS50. Code for ninety minutes."
            </p>
          </div>

          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Saving…" : "Date the notebook"}{" "}
            {!busy && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </form>
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
    <div className="space-y-1.5">
      <Label className="font-mono text-xs uppercase tracking-widest">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
