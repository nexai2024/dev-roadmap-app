import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

function redirectToUrl(url: string) {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function useLifetimeCheckout() {
  const createCheckout = useAction(api.payments.createLifetimeCheckout);
  const [busy, setBusy] = useState(false);

  const startCheckout = async () => {
    setBusy(true);
    try {
      const session = await createCheckout({});
      redirectToUrl(session.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setBusy(false);
    }
  };

  return { startCheckout, busy };
}
