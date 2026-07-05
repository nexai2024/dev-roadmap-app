import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router";
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Flag,
  Home,
  KeyRound,
  Layers,
  Library,
  ListChecks,
  Loader,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PHASES, type PhaseId } from "@/data/protocol";

const NAV = [
  { to: "/dashboard", icon: Home, label: "Today", end: true },
  { to: "/dashboard/prereqs", icon: KeyRound, label: "Prerequisites" },
  { to: "/dashboard/phases", icon: Layers, label: "Phases" },
  { to: "/dashboard/actions", icon: ClipboardList, label: "Actions" },
  { to: "/dashboard/inputs", icon: ListChecks, label: "Daily Inputs" },
  { to: "/dashboard/milestones", icon: Flag, label: "Milestones" },
  { to: "/dashboard/logbook", icon: BookOpen, label: "Logbook" },
  { to: "/dashboard/review", icon: CalendarRange, label: "30-day review" },
  { to: "/dashboard/rules", icon: Shield, label: "Hard Rules" },
  { to: "/dashboard/resources", icon: Library, label: "Resources" },
];

export default function DashboardLayout() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(api.notebook.currentProfile);
  const stats = useQuery(api.notebook.aggregateStats);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" /> Opening notebook…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-mono text-2xl">Sign in to open your notebook.</h1>
        <p className="text-muted-foreground max-w-md">
          Your progress, daily logs, and weekly reviews are tied to your
          account. Sign in to keep writing.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/auth?mode=sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth?mode=sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  // First-time setup gate
  if (profile && !profile.startedAt) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/dashboard/setup")) {
      // navigate via effect-free pattern — we just render the setup page
      return <NavigateToSetup />;
    }
  }

  const currentPhase =
    (profile?.currentPhase as PhaseId | undefined) ?? "phase:fundamentals";
  const phaseMeta = PHASES.find((p) => p.id === currentPhase) ?? PHASES[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — notebook spine */}
      <aside className="hidden md:flex md:w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex-col sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-4">
          <Link
            to="/"
            className="nb-press inline-flex items-baseline gap-1 text-left"
          >
            <span className="font-mono font-bold text-sm tracking-tight">
              INDIE·DEV·BOSS
            </span>
            <span className="nb-hand text-base text-primary">v1</span>
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            The protocol notebook
          </p>
        </div>

        <nav className="px-2 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "nb-press flex items-center gap-3 px-3 py-2 text-sm rounded-sm border border-transparent",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-sidebar-accent hover:border-sidebar-border text-sidebar-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-mono">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 mx-2 p-3 nb-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Current phase
            </p>
            <p className="font-mono text-sm mt-1 leading-tight">
              {phaseMeta.number}. {phaseMeta.label}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 nb-hand text-base">
              Day {profile?.currentDay ?? 1}
            </p>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono">
              {(profile?.displayName ?? user?.name ?? "IDB")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="text-xs leading-tight">
              <div className="font-mono truncate max-w-[160px]">
                {profile?.displayName ?? user?.name ?? "Founder"}
              </div>
              <button
                onClick={handleSignOut}
                className="text-[11px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2 px-4 sm:px-8 py-3">
            <div className="md:hidden">
              <Link
                to="/"
                className="font-mono font-bold text-sm tracking-tight nb-press"
              >
                INDIE·DEV·BOSS
              </Link>
            </div>

            <PhaseStrip currentPhaseId={currentPhase} currentDay={profile?.currentDay ?? 1} />

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-2">
              <KpiPill
                label={`Day ${profile?.currentDay ?? 1}/100`}
                value={`$${stats?.totalMRR ?? 0}`}
                accent="bg-[color:var(--chart-3)]"
              />
              <KpiPill label="Streak" value={`${stats?.streakDays ?? 0}d`} accent="bg-[color:var(--chart-4)]" />
              <KpiPill label="Ships" value={`${stats?.totalCommits ?? 0}`} accent="bg-[color:var(--chart-1)]" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="md:hidden"
            >
              <Link to="/dashboard/setup">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile bottom nav */}
          <nav className="md:hidden border-t border-border bg-background/95 backdrop-blur sticky top-[57px]">
            <ul className="flex overflow-x-auto">
              {NAV.slice(0, 6).map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px]",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-mono">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10 nb-margin">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavigateToSetup() {
  return <Navigate to="/dashboard/setup" replace />;
}

function PhaseStrip({
  currentPhaseId,
  currentDay,
}: {
  currentPhaseId: PhaseId;
  currentDay: number;
}) {
  return (
    <div className="hidden lg:flex items-center gap-1 ml-4">
      {PHASES.map((p) => {
        const isCurrent = p.id === currentPhaseId;
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-wider",
              isCurrent
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground",
            )}
            title={`${p.label} · ${p.window}`}
          >
            <span className="font-bold">{p.number}</span>
            <span className="hidden xl:inline">{p.name.slice(0, 6)}</span>
          </div>
        );
      })}
      <span className="ml-3 nb-hand text-base text-muted-foreground">
        day {currentDay}
      </span>
    </div>
  );
}

function KpiPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="nb-card flex items-center gap-2 px-2.5 py-1.5 rounded-sm">
      <span className={cn("size-2 rounded-sm", accent)} />
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="font-mono text-xs font-bold">{value}</div>
      </div>
    </div>
  );
}
