import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Flag,
  ListChecks,
  Loader,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHASES, PHILOSOPHY, KEY_ACTIONS, OUTPUTS, HARD_RULES, NON_NEGOTIABLES } from "@/data/protocol";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen nb-margin"
    >
      {/* Top nav bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="font-mono font-bold tracking-tight nb-press">
            INDIE·DEV·BOSS
            <span className="nb-hand text-base text-primary ml-1">protocol</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a href="#phases" className="px-3 py-1 hover:underline">Phases</a>
            <a href="#actions" className="px-3 py-1 hover:underline">Actions</a>
            <a href="#inside" className="px-3 py-1 hover:underline">Inside</a>
            <a href="#rules" className="px-3 py-1 hover:underline">Hard Rules</a>
          </nav>
          <div className="flex-1" />
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <Button asChild>
              <Link to="/dashboard">
                Open notebook <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost">
                <Link to="/auth?mode=sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=sign-up">
                  Start Day 1 <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
        <div className="relative">
          <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg] mb-4">
            Day 01 · The Indie Dev Boss Protocol
          </p>
          <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Zero → MRR, <br />
            <span className="nb-hand text-primary text-5xl md:text-6xl lg:text-7xl">
              one bug at a time.
            </span>
          </h1>

          <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed">
            A {PHILOSOPHY.horizon}. Twelve months. Six phases. Eleven
            actions. Thirty days of hour-by-hour drills for Month 1.
            The {PHILOSOPHY.shortLabel}: revenue is the only KPI that
            matters. Tutorials are procrastination.{" "}
            <span className="nb-highlight">Ship ugly, ship weekly, charge from day one.</span>
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Open my notebook <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/auth?mode=sign-up">
                    Start Day 1 <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth?mode=sign-in">I already have a notebook</Link>
                </Button>
              </>
            )}
          </div>

          {/* Operating model triple */}
          <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-2xl">
            {PHILOSOPHY.pillars.map((p, i) => (
              <div key={i} className="nb-card p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  pillar {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-mono text-sm mt-2 leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: notebook page showing Day 1 */}
        <div className="relative">
          <div className="nb-page nb-holes p-6 sm:p-8 transform rotate-[0.5deg]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                The Notebook
              </span>
              <span className="nb-stamp text-destructive">Day 1</span>
            </div>
            <h3 className="font-mono text-xl mt-2">Your first action.</h3>
            <p className="text-sm text-muted-foreground mt-1 italic">
              "Phone in another room. Open the tutorial. Code for ninety minutes."
            </p>

            <ol className="mt-5 space-y-3 text-sm">
              <Step n={1} text="Create your free notebook account below." />
              <Step n={2} text="Pick your Day 1. Notify: Phase 01 — Fundamentals." />
              <Step n={3} text="Open CS50x, watch Lecture 0, post your first #buildinpublic." />
              <Step n={4} text="Push a commit. Log it. Check in. Tomorrow, ship again." />
            </ol>

            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Non-negotiables
              </p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {NON_NEGOTIABLES.map((nn) => (
                  <li key={nn.time} className="flex gap-2">
                    <span className="font-mono font-bold text-primary shrink-0">{nn.time}</span>
                    <span>{nn.rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ink corner */}
          <div className="absolute -bottom-3 -right-3 nb-card nb-tape px-3 py-1 font-mono text-xs rotate-[3deg]">
            RFI: phone in another room
          </div>
        </div>
      </section>

      {/* PHASES TIMELINE */}
      <section id="phases" className="border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <SectionHeader
            kicker="Architecture"
            title="Six sequential phases. Hard exit gates."
            description="Every phase feeds the next. You can't skip an exit gate, even if you feel ready."
          />
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHASES.map((p, idx) => (
              <div key={p.id} className="nb-card p-5 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="font-mono font-bold text-2xl text-primary">
                    {String(p.number).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {p.window} · {p.name}
                    </p>
                    <h3 className="font-mono text-lg mt-0.5">{p.label}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {p.purpose}
                </p>
                <div className="mt-4 pt-4 border-t border-dashed border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Exit gate
                  </p>
                  <p className="text-xs mt-1 leading-relaxed">{p.exitGate}</p>
                </div>
                {idx < PHASES.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <section id="actions" className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader
          kicker="Key Actions"
          title="Eleven numbered actions. Each has a deliverable and a success criteria."
          description="Logbook entries are pushed to your dashboard. The protocol is your accountability engine."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KEY_ACTIONS.slice(0, 6).map((a, i) => (
            <div key={a.id} className="nb-card p-4 flex gap-3">
              <div className="font-mono text-2xl font-bold text-primary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h4 className="font-mono text-sm leading-tight">{a.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {a.phaseId.replace("phase:", "")} · {a.window}
                </p>
              </div>
            </div>
          ))}
          <div className="nb-card p-4 flex items-center justify-center">
            <p className="font-mono text-sm text-muted-foreground">
              + 5 more in the notebook →
            </p>
          </div>
        </div>
      </section>

      {/* INSIDE THE NOTEBOOK */}
      <section id="inside" className="border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <SectionHeader
            kicker="What's inside"
            title="Eight pages of your engineer's grid notebook."
            description="Every page renders data from the protocol. Every input is logged. Every milestone is verified."
          />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsideCard icon={ClipboardList} title="Today" desc="The current day's pre-loaded schedule + quick log form." />
            <InsideCard icon={Flag} title="Phases" desc="Six phases with status, internals, mechanics, exit gates." />
            <InsideCard icon={ListChecks} title="Daily Inputs" desc="Six non-negotiables: code, ship, build-in-public, learn, talk, track." />
            <InsideCard icon={CheckCircle2} title="Milestones" desc="Six outputs with verification. CS50 cert → $1k MRR." />
            <InsideCard icon={BookOpen} title="Logbook" desc="Every daily log you've ever filed. Engineer-grade history." />
            <InsideCard icon={CalendarRange} title="Weekly Review" desc="Sunday 18:00 ritual. Compute. Post. Iterate." />
            <InsideCard icon={Shield} title="Hard Rules" desc="No tutorial after Month 6. Charge from day one. One product." />
            <InsideCard icon={BookOpen} title="Resources" desc="CS50, Odin, Full Stack Open, Next, Supabase, Stripe, Resend, PostHog." />
          </div>

          <div className="mt-12 grid lg:grid-cols-2 gap-4">
            <div className="nb-card p-6">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Outputs tracked
              </p>
              <ol className="mt-3 space-y-2.5">
                {OUTPUTS.map((o) => (
                  <li key={o.id} className="flex gap-3 items-start">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-mono text-sm">{o.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Phase {o.phase} · {o.verification}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="nb-card p-6 relative">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Hard Rules
              </p>
              <ul className="mt-3 space-y-3">
                {HARD_RULES.map((r, i) => (
                  <li key={r.id} className="flex gap-3">
                    <span className="nb-stamp text-primary shrink-0">{i + 1}</span>
                    <div>
                      <p className="font-mono text-sm">{r.text}</p>
                      <p className="nb-hand text-base text-muted-foreground mt-0.5">{r.annotation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="rules" className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[1deg] mb-4">
          Open the notebook
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-semibold leading-tight max-w-2xl mx-auto">
          Day 1 is staring at you. <span className="nb-hand text-primary text-4xl md:text-5xl">Take it.</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Free forever. Multi-user. Engineer's grid notebook. Tracks every commit, every shipped day, every paid customer.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/dashboard">
                Open my notebook <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/auth?mode=sign-up">
                Start Day 1 free <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 justify-between text-xs text-muted-foreground">
          <span>© INDIE·DEV·BOSS · Pieter Levels doctrine</span>
          <span className="font-mono">[ makebook.io · cs50.harvard.edu/x/2025 ]</span>
        </div>
      </footer>
    </motion.div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="font-mono font-bold text-primary tabular-nums shrink-0">
        {String(n).padStart(2, "0")}.
      </span>
      <span className="leading-snug">{text}</span>
    </li>
  );
}

function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {kicker}
      </p>
      <h2 className="font-mono text-2xl md:text-3xl mt-2 leading-tight">{title}</h2>
      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function InsideCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="nb-card p-5 hover:shadow-md transition-shadow nb-press">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-base">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2 leading-snug">{desc}</p>
    </div>
  );
}
