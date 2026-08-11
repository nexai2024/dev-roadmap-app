import { useAuth, SignInButton } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "need_auth" | "activating" | "success" | "error" | "ready";

/**
 * AppSumo OAuth callback.
 * Partner Portal Redirect URL should point here (or to Convex /appsumo/redirect which forwards here).
 * Flow: land with ?code= → sign in if needed → exchange code → bind license → unlock access.
 */
export default function AppsumoActivatePage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { isLoaded, isSignedIn } = useAuth();
  const completeOAuth = useAction(api.appsumo.completeOAuth);
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!code) {
      setStatus("ready");
      return;
    }

    if (!isSignedIn) {
      setStatus("need_auth");
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;
    setStatus("activating");

    void (async () => {
      try {
        const result = await completeOAuth({ code });
        setLicenseKey(result.licenseKey);
        setStatus("success");
        toast.success("AppSumo license activated — full access unlocked");
        window.setTimeout(() => {
          void navigate("/dashboard", { replace: true });
        }, 1800);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Activation failed";
        setError(message);
        setStatus("error");
        toast.error(message);
      }
    })();
  }, [isLoaded, isSignedIn, code, completeOAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-mono text-2xl font-bold tracking-tight">AppSumo Activation</h1>
          <p className="text-sm text-muted-foreground">
            Connect your AppSumo purchase to your Protocol100 account.
            OAuth redirect URL: protocol100.xyz/appsumo
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          {!isLoaded || status === "idle" || status === "activating" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {status === "activating" ? "Activating license…" : "Loading…"}
              </p>
            </div>
          ) : null}

          {status === "ready" && !code ? (
            <div className="space-y-3 text-left">
              <p className="text-sm text-muted-foreground">
                This page completes AppSumo OAuth after you buy or activate on AppSumo.
                Start from your AppSumo product page, or paste a license key in Settings.
              </p>
              <Button asChild className="w-full font-mono text-xs uppercase">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full font-mono text-xs uppercase">
                <Link to="/dashboard/settings">Open Settings</Link>
              </Button>
            </div>
          ) : null}

          {status === "need_auth" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in or create an account to link your AppSumo license.
              </p>
              <SignInButton
                mode="modal"
                forceRedirectUrl={`/appsumo?code=${encodeURIComponent(code ?? "")}`}
                signUpForceRedirectUrl={`/appsumo?code=${encodeURIComponent(code ?? "")}`}
              >
                <Button className="w-full font-mono text-xs uppercase tracking-widest">
                  Continue with sign in
                </Button>
              </SignInButton>
            </div>
          ) : null}

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <p className="font-mono text-sm font-bold uppercase tracking-wider">License linked</p>
              {licenseKey ? (
                <p className="font-mono text-xs break-all text-muted-foreground">{licenseKey}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">Redirecting to your dashboard…</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Authorization codes are single-use. Restart activation from AppSumo, or contact
                support with your license key.
              </p>
              <Button asChild variant="outline" className="w-full font-mono text-xs uppercase">
                <Link to="/dashboard/settings">Go to Settings</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
