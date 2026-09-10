import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  EARLY_BIRD_SPOT_CAP,
  getLifetimeOffer,
  type LifetimeOffer,
} from "@/convex/lifetimeOffer";

export function useLifetimeOffer(): LifetimeOffer {
  const inventory = useQuery(api.lifetime.earlyBirdInventory);
  const remainingSpots = inventory?.remaining ?? EARLY_BIRD_SPOT_CAP;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return getLifetimeOffer(nowMs, remainingSpots);
}
