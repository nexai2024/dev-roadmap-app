import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CreditCard, ExternalLink } from "lucide-react";
import { PricingTable, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";
import { LifetimeDealCard } from "@/components/LifetimeDealCard";

export default function BillingPage() {
  const profile = useQuery(api.notebook.currentProfile);
  const { openUserProfile } = useClerk();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success("Payment verified! Lifetime access unlocked.");
    } else if (params.get("payment") === "cancel") {
      toast.message("Checkout canceled. Your trial is unchanged.");
    }
  }, []);

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
            Manage your membership, lifetime license, and billing preferences.
          </p>
        </div>

        <div className="grid gap-8">
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
                    {isTrial && "You are currently on the 3-day free trial. Upgrade to lifetime to unlock all 100 days."}
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

          {!isLifetime && (
            <div className="space-y-6">
              <LifetimeDealCard cta="checkout" />

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
