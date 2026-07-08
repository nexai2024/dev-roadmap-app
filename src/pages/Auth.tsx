import { SignIn } from "@clerk/clerk-react";
import logo from "@/assets/logo.svg";
import { useNavigate } from "react-router";

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Auth Content */}
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
          <SignIn 
            routing="path" 
            path="/auth" 
            forceRedirectUrl="/dashboard" 
            signUpForceRedirectUrl="/dashboard" 
          />
        </div>
      </div>
    </div>
  );
}
