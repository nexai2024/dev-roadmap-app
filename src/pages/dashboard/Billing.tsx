import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CreditCard, ExternalLink, KeyRound, RefreshCw } from "lucide-react";
import { PricingTable, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const profile = useQuery(api.notebook.currentProfile);
  const syncMyLicense = useMutation(api.users.syncMyLicense);
  const { openUserProfile } = useClerk();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Automatically attempt license sync on page load (e.g., after Stripe redirect)
    const isPaymentReturn = window.location.search.includes("payment=success");
    syncMyLicense({ fromPaymentRedirect: isPaymentReturn || undefined })
      .then((res) => {
        if (res?.success && res?.isPaid) {
          if (isPaymentReturn) {
            toast.success("Payment verified! Lifetime access unlocked.");
          }
        }
      })
      .catch((err) => {
        console.warn("Sync license notice:", err?.message || err);
      });
  }, [syncMyLicense]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMyLicense();
      if (res.success && res.isPaid) {
        toast.success("License synchronized! You have full access.");
      } else {
        toast.info("No new license found for your account email.");
      }
    } catch (err) {
      toast.error("Failed to sync license.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isTrial = profile.licenseType === "trial" || !profile.licenseType || profile.licenseType === "free";
  const isLifetime = profile.licenseType === "lifetime";
  const isSubscription = profile.licenseType === "subscription";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage your membership, subscription plans, and billing preferences.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Current status card */}
          <Card className="nb-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                <CreditCard className="h-4 w-4 text-primary" />
                Membership Status
              </CardTitle>
              <CardDescription>
                Your active subscription tier and billing cycle information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md border bg-muted/50 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold uppercase tracking-wider">
                    Current Plan: <span className="text-primary">{(profile.licenseType ?? "free").toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {isTrial && "You are currently on the 3-day free trial. Upgrade to monthly or lifetime to unlock all 100 days."}
                    {isSubscription && "You have active monthly subscription access. You can view all days up to 30. Upgrade to lifetime for full access."}
                    {isLifetime && "You have permanent lifetime access. All 100 days are fully unlocked."}
                  </p>
                  {isSubscription && (
                    <Button
                      onClick={() => openUserProfile()}
                      variant="outline"
                      size="sm"
                      className="mt-3 font-mono text-xs flex items-center gap-1.5"
                    >
                      Manage Subscription <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License details card */}
          <Card className="nb-card border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                  <KeyRound className="h-4 w-4 text-primary" />
                  License Details
                </CardTitle>
                <CardDescription className="mt-1">
                  Your current license key and activation status.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs flex items-center gap-1.5"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                Sync Status
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {profile.licenseKey ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-md border bg-muted/50">
                    <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">License Key</div>
                    <div className="font-mono text-sm font-bold tracking-widest">{profile.licenseKey}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-md border bg-muted/50">
                      <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">Type</div>
                      <div className="font-mono text-sm font-bold text-primary">{(profile.licenseType ?? "free").toUpperCase()}</div>
                    </div>
                    <div className="p-3 rounded-md border bg-muted/50">
                      <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                      <div className="font-mono text-sm font-bold text-green-500">ACTIVE</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-md border border-dashed bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground font-mono">
                    No license key found. Purchase a plan below to receive your license key.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing / Upgrade section */}
          {!isLifetime && (
            <div className="space-y-6">
              <Card className="border-2 overflow-hidden shadow-sm border-primary/40">
                <CardHeader className="bg-primary/5 border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-mono uppercase tracking-wider text-sm text-primary">Stripe Lifetime License — $99</CardTitle>
                      <CardDescription className="mt-1">One-time payment for permanent lifetime access to all 100 days.</CardDescription>
                    </div>
                    <span className="font-mono text-2xl font-bold">$99</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Button
                    size="lg"
                    className="w-full font-mono text-base h-12"
                    onClick={() => {
                      const url = profile.email
                        ? `https://buy.stripe.com/test_5kQdR9faBgiu5AJ5Mk73G06?prefilled_email=${encodeURIComponent(profile.email)}`
                        : "https://buy.stripe.com/test_5kQdR9faBgiu5AJ5Mk73G06";
                      try {
                        if (window.top && window.top !== window) {
                          window.top.location.href = url;
                        } else {
                          window.location.href = url;
                        }
                      } catch {
                        window.open(url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    Pay $99 via Stripe (One-Time)
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center mt-2 font-mono">
                    Instant unlock upon payment completion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-6">
                  <CardTitle className="font-mono uppercase tracking-wider text-sm">Other Subscription Plans</CardTitle>
                  <CardDescription>Handled securely by Clerk Billing.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PricingTable 
                    for="user"
                    newSubscriptionRedirectUrl="/dashboard"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
