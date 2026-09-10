/** Canonical lifetime pricing. Shared by the SPA and Convex checkout. */

export const LIFETIME_LIST_PRICE_CENTS = 9999; // $99.99
export const EARLY_BIRD_PERCENT_OFF = 75;
/** 75% off $99.99 with .99 pricing → $24.99 */
export const EARLY_BIRD_PRICE_CENTS = 2499;
/** Friday Oct 9, 2026 11:59:59pm Eastern */
export const EARLY_BIRD_ENDS_AT_MS = Date.parse("2026-10-10T03:59:59.000Z");
/** First N lifetime licenses get the early-bird price. */
export const EARLY_BIRD_SPOT_CAP = 100;

export type LifetimeOffer = {
  listPriceCents: number;
  amountCents: number;
  earlyBird: boolean;
  soldOut: boolean;
  percentOff: number;
  endsAtMs: number;
  remainingMs: number;
  remainingSpots: number;
  spotCap: number;
  claimedSpots: number;
};

export function getLifetimeOffer(
  nowMs: number,
  remainingSpots: number = EARLY_BIRD_SPOT_CAP,
): LifetimeOffer {
  const withinWindow = nowMs < EARLY_BIRD_ENDS_AT_MS;
  const spotsLeft = Math.max(0, Math.min(EARLY_BIRD_SPOT_CAP, remainingSpots));
  const earlyBird = withinWindow && spotsLeft > 0;
  const soldOut = withinWindow && spotsLeft === 0;
  return {
    listPriceCents: LIFETIME_LIST_PRICE_CENTS,
    amountCents: earlyBird ? EARLY_BIRD_PRICE_CENTS : LIFETIME_LIST_PRICE_CENTS,
    earlyBird,
    soldOut,
    percentOff: EARLY_BIRD_PERCENT_OFF,
    endsAtMs: EARLY_BIRD_ENDS_AT_MS,
    remainingMs: Math.max(0, EARLY_BIRD_ENDS_AT_MS - nowMs),
    remainingSpots: spotsLeft,
    spotCap: EARLY_BIRD_SPOT_CAP,
    claimedSpots: EARLY_BIRD_SPOT_CAP - spotsLeft,
  };
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatEarlyBirdDeadline(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(EARLY_BIRD_ENDS_AT_MS));
}
