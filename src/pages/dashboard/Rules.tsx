import { HARD_RULES, NON_NEGOTIABLES, PHILOSOPHY, PHASES } from "@/data/protocol";
import { Clock, Shield } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          Hard rules · no exceptions
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          The doctrine.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          {PHILOSOPHY.operatingModel}. Zero → MRR. {PHILOSOPHY.horizon}.
        </p>
      </div>

      <div className="nb-page nb-holes p-5 sm:p-8 relative">
        <div className="absolute -top-3 left-6 nb-tape px-2 font-mono text-[10px] uppercase tracking-widest rotate-[-1deg]">
          Operating model
        </div>
        <ul className="grid sm:grid-cols-3 gap-3 mt-2">
          {PHILOSOPHY.pillars.map((p, i) => (
            <li key={i} className="nb-card p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                pillar {String(i + 1).padStart(2, "0")}
              </p>
              <p className="font-mono text-sm mt-1.5 leading-snug">{p}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-mono text-lg nb-rule">Hard rules</h2>
        {HARD_RULES.map((r, i) => (
          <div key={r.id} className="nb-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="nb-stamp text-primary shrink-0 mt-0.5">
                R{String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-mono text-base leading-snug">{r.text}</p>
                <p className="nb-hand text-lg text-muted-foreground mt-2">
                  "{r.annotation}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="nb-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-lg">Daily non-negotiables</h2>
        </div>
        <ul className="mt-3 space-y-2.5">
          {NON_NEGOTIABLES.map((nn, i) => (
            <li key={nn.time} className="flex gap-3 text-sm">
              <span className="font-mono font-bold text-primary shrink-0 w-[110px] tabular-nums">
                {nn.time}
              </span>
              <span>{nn.rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="nb-card p-5 sm:p-6">
        <h2 className="font-mono text-lg">Exit gates</h2>
        <p className="text-xs text-muted-foreground mt-1">
          You cannot skip a phase's exit gate, even if you "feel ready."
        </p>
        <ol className="mt-3 space-y-2.5">
          {PHASES.map((p, i) => (
            <li key={p.id} className="flex gap-3 text-sm">
              <span className="font-mono font-bold text-primary tabular-nums shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="font-mono">{p.label}.</span> {p.exitGate}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
