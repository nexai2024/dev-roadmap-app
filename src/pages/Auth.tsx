import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import logo from "@/assets/logo.svg";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const isSignUp = searchParams.get("mode") === "sign-up";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-6">
          <img
            src={logo}
            alt="Logo"
            width={64}
            height={64}
            className="rounded-lg cursor-pointer"
            onClick={() => navigate("/")}
          />
          {!isLoaded ? (
            <div className="text-sm text-muted-foreground animate-pulse">
              Loading sign-in…
            </div>
          ) : isSignUp ? (
            <SignUp
              routing="hash"
              forceRedirectUrl="/dashboard"
              signInUrl="/auth?mode=sign-in"
              signInForceRedirectUrl="/dashboard"
            />
          ) : (
            <SignIn
              routing="hash"
              forceRedirectUrl="/dashboard"
              signUpUrl="/auth?mode=sign-up"
              signUpForceRedirectUrl="/dashboard"
            />
          )}
        </div>
      </div>
    </div>
  );
}
