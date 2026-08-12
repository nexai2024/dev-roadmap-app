import { motion } from "framer-motion";
import { Link } from "react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  Compass,
  Construction,
  Loader,
  Map as MapIcon,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  ROADMAP_INTRO,
  ROADMAP_ITEMS,
  ROADMAP_STATUS_LABEL,
  type RoadmapItem,
  type RoadmapStatus,
} from "@/data/roadmap";
import { toast } from "sonner";

const STATUS_STYLE: Record<
  RoadmapStatus,
  { chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  shipped: {
    chip: "bg-accent text-accent-foreground border-border",
    icon: CheckCircle2,
  },
  building: {
    chip: "bg-secondary text-secondary-foreground border-border",
    icon: Construction,
  },
  planned: {
    chip: "bg-card text-foreground border-border",
    icon: MapIcon,
  },
  exploring: {
    chip: "bg-muted text-muted-foreground border-border",
    icon: Compass,
  },
};

const STATUS_ORDER: RoadmapStatus[] = [
  "shipped",
  "building",
  "planned",
  "exploring",
];

const VOTABLE: ReadonlySet<RoadmapStatus> = new Set(["planned", "exploring"]);

export default function RoadmapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const voteSummary = useQuery(api.roadmap.voteSummary);
  const requests = useQuery(api.roadmap.listRequests);
  const toggleRoadmapVote = useMutation(api.roadmap.toggleRoadmapVote);
  const toggleRequestVote = useMutation(api.roadmap.toggleRequestVote);
  const submitRequest = useMutation(api.roadmap.submitRequest);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  const voteCountById = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of voteSummary?.roadmapVotes ?? []) {
      map.set(row.id, row.count);
    }
    return map;
  }, [voteSummary]);

  const myRoadmapVotes = useMemo(
    () => new Set(voteSummary?.myRoadmapVotes ?? []),
    [voteSummary],
  );
  const myRequestVotes = useMemo(
    () => new Set(voteSummary?.myRequestVotes ?? []),
    [voteSummary],
  );

  const itemsByStatus = useMemo(() => {
    const grouped: Record<RoadmapStatus, Array<RoadmapItem & { votes: number }>> = {
      shipped: [],
      building: [],
      planned: [],
      exploring: [],
    };
    for (const item of ROADMAP_ITEMS) {
      grouped[item.status].push({
        ...item,
        votes: voteCountById.get(item.id) ?? 0,
      });
    }
    for (const status of VOTABLE) {
      grouped[status].sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title));
    }
    return grouped;
  }, [voteCountById]);

  async function handleRoadmapVote(itemId: string) {
    if (!isAuthenticated) {
      toast.error("Sign in to vote — AppSumo buyers steer the planned column");
      return;
    }
    setVotingId(itemId);
    try {
      const result = await toggleRoadmapVote({ roadmapItemId: itemId });
      toast.success(result.voted ? "Vote counted" : "Vote removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not vote");
    } finally {
      setVotingId(null);
    }
  }

  async function handleRequestVote(requestId: Id<"featureRequests">) {
    if (!isAuthenticated) {
      toast.error("Sign in to vote");
      return;
    }
    setVotingId(requestId);
    try {
      const result = await toggleRequestVote({ requestId });
      toast.success(result.voted ? "Vote counted" : "Vote removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not vote");
    } finally {
      setVotingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to request a feature");
      return;
    }
    setSubmitting(true);
    try {
      await submitRequest({ title, description });
      setTitle("");
      setDescription("");
      toast.success("Request submitted — others can vote it up");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen nb-margin"
    >
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="font-mono font-bold tracking-tight nb-press">
            PROTOCOL·100
            <span className="nb-hand text-base text-primary ml-1">100-day</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/#phases" className="px-3 py-1 hover:underline">
              Phases
            </Link>
            <Link to="/roadmap" className="px-3 py-1 underline font-medium">
              Roadmap
            </Link>
            <a href="#request" className="px-3 py-1 hover:underline">
              Request
            </a>
            <Link to="/#rules" className="px-3 py-1 hover:underline">
              Rules
            </Link>
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

      <section className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg] mb-4">
          Public roadmap · Vote to reorder planned work
        </p>
        <h1 className="font-mono text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          <span className="nb-hand text-primary text-5xl md:text-6xl">What’s next</span>
          <br />
          after Day 1 — and after Day 100.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed">
          {ROADMAP_INTRO.subtitle}
        </p>
        <p className="text-sm text-muted-foreground mt-3 max-w-2xl leading-relaxed border-l-2 border-border pl-4">
          {ROADMAP_INTRO.note} Sumo-lings: sign in and upvote planned items — highest votes float to the top.
        </p>

        <div className="flex flex-wrap gap-2 mt-8">
          {STATUS_ORDER.map((status) => {
            const count = itemsByStatus[status].length;
            const Icon = STATUS_STYLE[status].icon;
            return (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] uppercase tracking-widest font-mono ${STATUS_STYLE[status].chip}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {ROADMAP_STATUS_LABEL[status]} · {count}
              </span>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12 space-y-10">
        {STATUS_ORDER.map((status) => {
          const items = itemsByStatus[status];
          if (items.length === 0) return null;
          const Icon = STATUS_STYLE[status].icon;
          const canVote = VOTABLE.has(status);

          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="font-mono text-xl tracking-tight">
                  {ROADMAP_STATUS_LABEL[status]}
                </h2>
                {canVote ? (
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    Sorted by Sumo-ling votes
                  </span>
                ) : null}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map((item, index) => {
                  const voted = myRoadmapVotes.has(item.id);
                  return (
                    <motion.article
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="nb-card p-5 nb-press flex gap-3"
                    >
                      {canVote ? (
                        <button
                          type="button"
                          onClick={() => void handleRoadmapVote(item.id)}
                          disabled={votingId === item.id}
                          className={`shrink-0 flex flex-col items-center justify-center min-w-12 h-16 border border-border rounded-sm px-1 transition-colors ${
                            voted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/40 hover:bg-muted text-foreground"
                          }`}
                          aria-label={voted ? "Remove vote" : "Upvote"}
                        >
                          {votingId === item.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span className="font-mono text-xs font-bold">{item.votes}</span>
                            </>
                          )}
                        </button>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-mono text-base leading-snug">{item.title}</h3>
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5">
                            {item.eta}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Community requests */}
      <section id="request" className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <MessageSquarePlus className="h-3.5 w-3.5" /> Request a feature
            </p>
            <h2 className="font-mono text-2xl mt-2 leading-tight">
              Missing something? Add it — votes decide what we pull into Planned.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Signed-in users (including AppSumo lifetime) can submit up to 5 open ideas
              and upvote others. We review high-vote requests when prioritizing the next quarter.
            </p>

            {!isAuthenticated ? (
              <div className="mt-6 nb-card p-5 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to submit a request or cast votes.
                </p>
                <Button asChild>
                  <Link to="/auth?mode=sign-in">Sign in to vote</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 nb-card p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feature-title" className="font-mono text-xs uppercase tracking-widest">
                    Title
                  </Label>
                  <Input
                    id="feature-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Notion sync for daily logs"
                    maxLength={120}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feature-desc" className="font-mono text-xs uppercase tracking-widest">
                    Why it matters
                  </Label>
                  <Textarea
                    id="feature-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What problem does this solve during the 100 days?"
                    maxLength={800}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitting || !title.trim() || !description.trim()}>
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Submit request <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-lg tracking-tight">Community board</h3>
            {requests === undefined ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader className="h-4 w-4 animate-spin" /> Loading requests…
              </div>
            ) : requests.length === 0 ? (
              <p className="text-sm text-muted-foreground nb-card p-5">
                No community requests yet — be the first.
              </p>
            ) : (
              <ul className="space-y-3">
                {requests.map((req) => {
                  const voted = myRequestVotes.has(req._id);
                  return (
                    <li key={req._id} className="nb-card p-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => void handleRequestVote(req._id)}
                        disabled={votingId === req._id}
                        className={`shrink-0 flex flex-col items-center justify-center min-w-12 h-14 border border-border rounded-sm px-1 ${
                          voted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/40 hover:bg-muted"
                        }`}
                        aria-label={voted ? "Remove vote" : "Upvote"}
                      >
                        {votingId === req._id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            <span className="font-mono text-xs font-bold">{req.voteCount}</span>
                          </>
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-mono text-sm font-bold leading-snug">{req.title}</h4>
                          {req.isMine ? (
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border px-1">
                              Yours
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AppSumo lifetime buyers
            </p>
            <h2 className="font-mono text-2xl mt-2 leading-tight">
              Your license covers the shipped product — votes shape what we build next.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Activate at{" "}
              <Link to="/appsumo" className="underline underline-offset-2">
                /appsumo
              </Link>{" "}
              after purchase, or paste your license UUID in Settings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={isAuthenticated ? "/dashboard" : "/auth?mode=sign-up"}>
                {isAuthenticated ? "Open notebook" : "Start Day 1"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 justify-between text-xs text-muted-foreground">
          <span>© Protocol100 · Product roadmap</span>
          <span className="font-mono">
            <Link to="/" className="underline">
              Home
            </Link>
            {" · "}
            <Link to="/appsumo" className="underline">
              AppSumo activate
            </Link>
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
