import { Link } from "react-router";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCountdown,
  formatEarlyBirdDeadline,
  formatUsdFromCents,
} from "@/convex/lifetimeOffer";
import { useLifetimeOffer } from "@/hooks/useLifetimeOffer";
import { useLifetimeCheckout } from "@/hooks/useLifetimeCheckout";

const INCLUDED = [
  "Full 100-day schedule and deliverables",
  "Unlimited logbook entries",
  "All 11 key-action trackers",
  "Weekly and monthly reviews plus AI debriefs",
];

type LifetimeDealCardProps = {
  cta: "checkout" | "signup" | "dashboard";
  compact?: boolean;
};

export function LifetimeDealCard({ cta, compact = false }: LifetimeDealCardProps) {
  const offer = useLifetimeOffer();
  const { startCheckout, busy } = useLifetimeCheckout();
  const price = formatUsdFromCents(offer.amountCents);
  const listPrice = formatUsdFromCents(offer.listPriceCents);

  return (
    <div className={`nb-card border-2 border-primary/40 overflow-hidden ${compact ? "p-5" : "p-6 sm:p-8"}`}>
      {offer.earlyBird ? (
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg] mb-4 bg-primary text-primary-foreground">
          Early bird · {offer.percentOff}% off · first {offer.spotCap}
        </p>
      ) : offer.soldOut ? (
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg] mb-4">
          Early bird sold out
        </p>
      ) : (
        <p className="nb-tape inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-mono rotate-[-1deg] mb-4">
          Lifetime access
        </p>
      )}

      <h2 className={`font-mono font-semibold tracking-tight leading-tight ${compact ? "text-xl" : "text-2xl md:text-3xl"}`}>
        Unlock all 100 days. Forever.
      </h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        One-time payment. No subscription. 3-day free trial first — then keep the whole protocol.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <span className="font-mono text-4xl font-bold tabular-nums">{price}</span>
        {offer.earlyBird && (
          <span className="font-mono text-lg text-muted-foreground line-through tabular-nums">
            {listPrice}
          </span>
        )}
        <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground pb-1">
          one-time
        </span>
      </div>

      {offer.earlyBird ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono text-primary flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Ends {formatEarlyBirdDeadline()} · {formatCountdown(offer.remainingMs)} left
          </p>
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {offer.remainingSpots <= 10
                  ? `Only ${offer.remainingSpots} early-bird ${offer.remainingSpots === 1 ? "spot" : "spots"} left`
                  : `${offer.remainingSpots} of ${offer.spotCap} early-bird spots left`}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {offer.claimedSpots}/{offer.spotCap}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={offer.spotCap}
              aria-valuenow={offer.claimedSpots}
              aria-label="Early bird licenses claimed"
            >
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${Math.min(100, (offer.claimedSpots / offer.spotCap) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : offer.soldOut ? (
        <p className="mt-3 text-xs font-mono text-muted-foreground">
          The first {offer.spotCap} early-bird licenses are gone. Lifetime is {listPrice}.
        </p>
      ) : (
        <p className="mt-3 text-xs font-mono text-muted-foreground">
          Early bird has ended. Lifetime is {listPrice}.
        </p>
      )}

      {!compact && (
        <ul className="mt-6 space-y-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {cta === "checkout" && (
          <Button
            size="lg"
            className="w-full h-12 font-mono"
            onClick={() => void startCheckout()}
            disabled={busy}
          >
            {busy ? "Opening checkout…" : `Get lifetime for ${price}`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {cta === "signup" && (
          <Button asChild size="lg" className="w-full h-12 font-mono">
            <Link to="/auth?mode=sign-up">
              Start 3-day trial · then {price}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {cta === "dashboard" && (
          <Button asChild size="lg" className="w-full h-12 font-mono">
            <Link to="/dashboard/billing">
              Open billing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-widest font-mono flex items-center justify-center gap-1">
        <Sparkles className="h-3 w-3" /> Secure checkout via Stripe
      </p>
    </div>
  );
}
