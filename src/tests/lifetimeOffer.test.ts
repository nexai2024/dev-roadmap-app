import { describe, it, expect } from "vitest";
import {
  EARLY_BIRD_ENDS_AT_MS,
  EARLY_BIRD_PERCENT_OFF,
  EARLY_BIRD_PRICE_CENTS,
  EARLY_BIRD_SPOT_CAP,
  LIFETIME_LIST_PRICE_CENTS,
  formatUsdFromCents,
  getLifetimeOffer,
} from "../convex/lifetimeOffer";

describe("lifetime offer", () => {
  it("lists lifetime at $99.99 with a 75% early-bird price of $24.99", () => {
    expect(LIFETIME_LIST_PRICE_CENTS).toBe(9999);
    expect(EARLY_BIRD_PERCENT_OFF).toBe(75);
    expect(EARLY_BIRD_PRICE_CENTS).toBe(2499);
    expect(EARLY_BIRD_SPOT_CAP).toBe(100);
    expect(formatUsdFromCents(LIFETIME_LIST_PRICE_CENTS)).toBe("$99.99");
    expect(formatUsdFromCents(EARLY_BIRD_PRICE_CENTS)).toBe("$24.99");
  });

  it("applies early bird before the deadline and list price after", () => {
    const during = getLifetimeOffer(EARLY_BIRD_ENDS_AT_MS - 1, EARLY_BIRD_SPOT_CAP);
    expect(during.earlyBird).toBe(true);
    expect(during.soldOut).toBe(false);
    expect(during.amountCents).toBe(EARLY_BIRD_PRICE_CENTS);
    expect(during.remainingSpots).toBe(100);

    const after = getLifetimeOffer(EARLY_BIRD_ENDS_AT_MS, EARLY_BIRD_SPOT_CAP);
    expect(after.earlyBird).toBe(false);
    expect(after.soldOut).toBe(false);
    expect(after.amountCents).toBe(LIFETIME_LIST_PRICE_CENTS);
  });

  it("ends early bird when the first 100 licenses are claimed", () => {
    const soldOut = getLifetimeOffer(EARLY_BIRD_ENDS_AT_MS - 1, 0);
    expect(soldOut.earlyBird).toBe(false);
    expect(soldOut.soldOut).toBe(true);
    expect(soldOut.amountCents).toBe(LIFETIME_LIST_PRICE_CENTS);
    expect(soldOut.claimedSpots).toBe(100);

    const oneLeft = getLifetimeOffer(EARLY_BIRD_ENDS_AT_MS - 1, 1);
    expect(oneLeft.earlyBird).toBe(true);
    expect(oneLeft.remainingSpots).toBe(1);
    expect(oneLeft.claimedSpots).toBe(99);
  });
});
