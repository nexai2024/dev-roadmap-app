import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface TrialGateProps {
  children: React.ReactNode;
  profile: {
    _id?: string;
    startedAt?: number;
    isPaid?: boolean;
    displayName?: string;
    email?: string;
  } | null;
}

export function TrialGate({ children, profile }: TrialGateProps) {
  const navigate = useNavigate();

  // If no profile or no startedAt, we don't gate (yet)
  if (!profile || !profile.startedAt) {
    return <>{children}</>;
  }

  const start = new Date(profile.startedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(1, diff + 1);

  const isTrialExpired = currentDay > 3 && !profile.isPaid;

  if (!isTrialExpired) {
    return <>{children}</>;
  }

  const stripeUrl = profile.email
    ? `https://buy.stripe.com/00w6oIbKTaPCdVCbxlgA801?client_reference_id=${profile._id}&prefilled_email=${encodeURIComponent(profile.email)}`
    : `https://buy.stripe.com/00w6oIbKTaPCdVCbxlgA801?client_reference_id=${profile._id}`;

  const handleUnlock = () => {
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = stripeUrl;
      } else {
        window.location.href = stripeUrl;
      }
    } catch {
      window.open(stripeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const activateLicense = useMutation(api.licenses.activate);
  const [inputKey, setInputKey] = useState("");
  const [isActivatingKey, setIsActivatingKey] = useState(false);

  const handleActivateKey = async () => {
    if (!inputKey.trim()) return;
    setIsActivatingKey(true);
    try {
      const res = await activateLicense({ key: inputKey.trim() });
      if (res.success) {
        toast.success(`License key activated! Tier: ${res.type}`);
        setInputKey("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Activation failed. Please check your key.");
    } finally {
      setIsActivatingKey(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="nb-page nb-holes p-8 sm:p-12 relative overflow-hidden text-center">
        <div className="nb-tape inline-block px-3 py-1 text-[12px] uppercase tracking-widest font-mono rotate-[-2deg] bg-primary text-primary-foreground mb-6">
          Trial Expired · Day {currentDay}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <h1 className="font-mono text-3xl md:text-4xl font-bold leading-tight">
            The free trial ends here.
          </h1>

          <p className="text-muted-foreground mt-4 text-sm md:text-base leading-relaxed max-w-md">
            You've completed the 3-day initiation. To utilize the remaining 96 days of the
            Protocol100 curriculum—including the Stack Crash, MVP Build, and MRR Push—you
            must unlock the full notebook.
          </p>

          <div className="mt-8 grid gap-4 w-full max-w-sm">
            <div className="nb-card p-4 text-left border-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs uppercase font-bold">What's included:</span>
              </div>
              <ul className="text-xs space-y-2 mt-2 font-mono">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Full 100-day schedule & deliverables
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Unlimited Logbook entries
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> All 11 Key Action trackers
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Weekly & Monthly performance reviews
                </li>
              </ul>
            </div>
            <Button
              size="lg"
              className="w-full h-14 text-lg font-mono"
              onClick={handleUnlock}
            >
              Unlock Full Protocol ($99)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* License Key Activation Form directly on Paywall */}
            <div className="pt-2 pb-1 space-y-2 border-t border-dashed border-border mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste License Key (XXXX-XXXX-XXXX-XXXX)"
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  size="sm"
                  variant="default"
                  className="font-mono text-xs shrink-0"
                  onClick={handleActivateKey}
                  disabled={isActivatingKey || !inputKey.trim()}
                >
                  {isActivatingKey ? "Activating..." : "Activate Key"}
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full font-mono text-xs text-muted-foreground"
              onClick={() => navigate("/dashboard/billing")}
            >
              View Billing & Membership Details
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              One-time payment · Lifetime access
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dashed border-border">
          <p className="nb-hand text-xl text-muted-foreground">
            "Tutorials are procrastination. Shipping is the only way out."
          </p>
        </div>
      </div>
    </div>
  );
}
