import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Flag,
  KeyRound,
  ListChecks,
  Loader,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HARD_RULES,
  KEY_ACTIONS,
  NON_NEGOTIABLES,
  OUTPUTS,
  PHASES,
  PHILOSOPHY,
  RESOURCES,
  getDaySchedule,
} from "@/data/protocol";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const sampleDay = getDaySchedule(4);

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
            PROTOCOL·100
            <span className="nb-hand text-base text-primary ml-1">100-day</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a href="#phases" className="px-3 py-1 hover:underline">Phases</a>
            <a href="#day" className="px-3 py-1 hover:underline">A Day</a>
            <a href="#actions" className="px-3 py-1 hover:underline">Actions</a>
            <a href="#inside" className="px-3 py-1 hover:underline">Inside</a>
            <a href="#prereqs" className="px-3 py-1 hover:underline">Prereqs</a>
            <a href="#rules" className="px-3 py-1 hover:underline">Rules</a>
          </nav>
          <Link
            to="/roadmap"
            className="px-3 py-1 text-sm font-mono hover:underline shrink-0"
          >
            Roadmap
          </Link>
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
            Day 01 · Protocol100 · AI-accelerated 100-day challenge
          </p>
          <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            <span className="nb-hand text-primary text-5xl md:text-6xl lg:text-7xl">
              Cursor + Claude
            </span>
            <br />+ 99 days of shipping.
          </h1>

          <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed">
            <span className="nb-highlight">{PHILOSOPHY.horizon}</span>{" "}
            Seven phases. Eleven key actions. <strong>A 100-day minute-by-minute plan</strong>{" "}
            with rest and review blocks baked in. Every external tool linked.
            Every day pre-loaded. {PHILOSOPHY.shortLabel}: revenue is the only
            KPI. Tutorials are procrastination. <strong>Ship ugly, ship weekly,
            charge from Day 38.</strong>
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
                  <Link to="/dashboard/prereqs">
                    See prerequisites <KeyRound className="h-4 w-4 ml-1" />
                  </Link>
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

        {/* Right: a sample day */}
        <div id="day" className="relative">
          <div className="nb-page nb-holes p-6 sm:p-8 transform rotate-[0.5deg]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Sample Day — Day {sampleDay?.day ?? 4}
              </span>
              <span className="nb-stamp text-destructive">
                {sampleDay?.focus.split(" ").slice(0, 2).join(" ") ?? "JS DOM"}
              </span>
            </div>
            <h3 className="font-mono text-xl mt-2">Your first action.</h3>
            <p className="text-[10px] uppercase tracking-widest text-primary font-mono mt-1">
              Day 1 of 100
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              "Install Cursor. Open Odin HTML. Prompt your way to a working form."
            </p>

            {sampleDay && (
              <ol className="mt-5 space-y-3 text-sm">
                {sampleDay.morning.slice(0, 2).map((m, i) => (
                  <li key={`m${i}`} className="flex gap-3">
                    <span className="font-mono font-bold text-primary tabular-nums shrink-0">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
                {sampleDay.afternoon.slice(0, 2).map((m, i) => (
                  <li key={`a${i}`} className="flex gap-3">
                    <span className="font-mono font-bold text-primary tabular-nums shrink-0">
                      {String(i + 3).padStart(2, "0")}.
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
                <li className="flex gap-3 pt-2 border-t border-dashed border-border">
                  <span className="font-mono font-bold text-primary tabular-nums shrink-0">
                    {String(99).padStart(2, "0")}.
                  </span>
                  <span className="italic">{sampleDay.evening}</span>
                </li>
              </ol>
            )}

            {sampleDay && sampleDay.resources.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Day {sampleDay.day} links
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sampleDay.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="nb-press text-[11px] font-mono px-2 py-1 rounded-sm border border-border hover:bg-sidebar-accent inline-flex items-center gap-1"
                    >
                      {r.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Non-negotiables (timed)
              </p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {NON_NEGOTIABLES.map((nn) => (
                  <li key={nn.time} className="flex gap-2">
                    <span className="font-mono font-bold text-primary shrink-0">
                      {nn.time}
                    </span>
                    <span>{nn.rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Total minimum spend · 100 days
              </p>
              <p className="font-mono text-lg mt-1">$100</p>
              <p className="text-[11px] text-muted-foreground">
                Cursor $20/mo + Make Book $30. Everything else has a free tier.
              </p>
              <Link
                to="/dashboard/prereqs"
                className="nb-press inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 mt-3 rounded-sm bg-primary text-primary-foreground"
              >
                See all sign-up links <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Ink corner */}
          <div className="absolute -bottom-3 -right-3 nb-card nb-tape px-3 py-1 font-mono text-xs rotate-[3deg]">
            RFI: AI-first
          </div>
        </div>
      </section>

      {/* PHASES TIMELINE */}
      <section id="phases" className="border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <SectionHeader
            kicker="Architecture"
            title="Seven sequential phases. One product. 100 days."
            description="Every phase feeds the next. Day 100 = 3 paid customers = first MRR. Day 200 + = path to $1,000."
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
                      {p.window} · {p.slug}
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
          description="Day-by-day deliverables wired into your dashboard. Open the notebook for the full 11."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KEY_ACTIONS.slice(0, 6).map((a, i) => (
            <div key={a.id} className="nb-card p-4 flex gap-3">
              <div className="font-mono text-2xl font-bold text-primary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <h4 className="font-mono text-sm leading-tight">{a.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {a.phaseId.replace("phase:", "")} · {a.window}
                </p>
                {a.resourceUrl && (
                  <a
                    href={a.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] mt-1 underline block truncate hover:text-primary"
                  >
                    {a.resource} ↗
                  </a>
                )}
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
            title="Ten pages of your engineer's grid notebook."
            description="Plus a Prerequisites page that lists every signup link for Cursor, Claude, v0, Bolt.new, and the launch stack."
          />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsideCard
              icon={CalendarRange}
              title="Today"
              desc="Day X of 100. Morning block, afternoon block, BIP post prompt, ship-by-EOD, clickable day links."
            />
            <InsideCard
              icon={Flag}
              title="Phases"
              desc="Seven phases with day windows, internals, mechanics, exit gates, and a current-phase switch."
            />
            <InsideCard
              icon={ListChecks}
              title="Daily Inputs"
              desc="Six non-negotiables: code, ship, build-in-public, learn, talk, weekly review. 7-day tally."
            />
            <InsideCard
              icon={CheckCircle2}
              title="Milestones"
              desc="Six outputs on the 100-day timeline: portfolio → $20 → MVP prod → 3 paying customers."
            />
            <InsideCard
              icon={BookOpen}
              title="Logbook"
              desc="Every daily log, newest first. Engineer-grade history with totals."
            />
            <InsideCard
              icon={Sparkles}
              title="Prerequisites"
              desc="30 signup links covering AI tools, code stack, launch platforms, community, and paid services."
            />
            <InsideCard
              icon={Shield}
              title="Hard Rules"
              desc="AI first. 5 hrs / 5 days. Charge or pivot Day 50. MRR is the only KPI."
            />
            <InsideCard
              icon={BookOpen}
              title="Resources"
              desc="CS50 no more — Odin + Cursor + v0 + Bolt + Lovable. Every link live."
            />
          </div>

          <div id="rules" className="mt-12 grid lg:grid-cols-2 gap-4">
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
                        Phase {o.phase} · Day {o.day} · {o.verification}
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
                    <span className="nb-stamp text-primary shrink-0">
                      R{String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-mono text-sm">{r.text}</p>
                      <p className="nb-hand text-base text-muted-foreground mt-0.5">
                        {r.annotation}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id="prereqs" className="mt-12 nb-card p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline gap-3 justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Sign up before Day 1
                </p>
                <h3 className="font-mono text-xl mt-1">5 free accounts.</h3>
              </div>
              <div className="nb-tape px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest">
                Day -7 → Day -1
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              These five accounts are the floor. Free. Each takes under 10
              minutes. The full list of 30+ services (free + paid) lives on the{" "}
              <Link to="/dashboard/prereqs" className="underline">
                Prerequisites page
              </Link>
              {" "}inside the notebook.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { name: "GitHub", url: "https://github.com/signup" },
                { name: "X / Twitter", url: "https://twitter.com/i/flow/signup" },
                { name: "Google Account", url: "https://accounts.google.com/signup" },
                { name: "Cursor", url: "https://cursor.sh" },
                { name: "Notion", url: "https://www.notion.so/signup" },
              ].map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="nb-press text-xs font-mono px-2.5 py-1 rounded-sm border border-border hover:bg-sidebar-accent"
                >
                  {p.name} ↗
                </a>
              ))}
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-2">
              {RESOURCES.filter((r) => r.type === "ai-tool").map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="nb-press flex items-center justify-between gap-2 nb-card p-3 hover:bg-sidebar-accent"
                >
                  <div>
                    <p className="font-mono text-sm">{r.name}</p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground uppercase tracking-widest">
                      AI tool
                      {r.cost ? ` · ${r.cost}` : ""}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[1deg] mb-4">
          Open the notebook
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-semibold leading-tight max-w-2xl mx-auto">
          100 days is staring at you.{" "}
          <span className="nb-hand text-primary text-4xl md:text-5xl">
            Take Day 1.
          </span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Free forever. Multi-user. Engineer's grid notebook. Tracks every
          commit, every shipped day, every paid customer — on the way to 3
          paying customers by Day 100 and $1k MRR after.
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
          <span>          © Protocol100 · AI-accelerated 100-day challenge - A <Link to="https://solopreneur.solutions" className="underline">Solopreneur Solutions</Link> SaaS</span>
          <span className="font-mono">
            [{` `}
            <Link to="/roadmap" className="underline">
              roadmap
            </Link>
            {` · `}
            <a href="https://makebook.io" className="underline" target="_blank" rel="noreferrer">
              makebook.io
            </a>
            {` · `}
            <a href="https://cursor.sh" className="underline" target="_blank" rel="noreferrer">
              cursor.sh
            </a>
            {` · `}
            <a href="https://www.theodinproject.com" className="underline" target="_blank" rel="noreferrer">
              theodinproject.com
            </a>
            {` `}]
          </span>
        </div>
      </footer>
    </motion.div>
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
