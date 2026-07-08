import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import "./types/global.d.ts";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";


// Lazy load route components for better code splitting (extensionless paths)
const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const LicensingTest = lazy(() => import("./pages/LicensingTest"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard sub-routes
const DashboardLayout = lazy(() => import("./components/dashboard-layout"));
const DashboardIndex = lazy(() => import("./pages/dashboard/Index"));
const TodayPage = lazy(() => import("./pages/dashboard/Today"));
const PhasesPage = lazy(() => import("./pages/dashboard/Phases"));
const ActionsPage = lazy(() => import("./pages/dashboard/Actions"));
const InputsPage = lazy(() => import("./pages/dashboard/Inputs"));
const MilestonesPage = lazy(() => import("./pages/dashboard/Milestones"));
const LogbookPage = lazy(() => import("./pages/dashboard/Logbook"));
const ReviewPage = lazy(() => import("./pages/dashboard/Review"));
const RulesPage = lazy(() => import("./pages/dashboard/Rules"));
const MonthlyReviewPage = lazy(() => import("./pages/dashboard/MonthlyReview"));
const DistributionPage = lazy(() => import("./pages/dashboard/Distribution"));
const ConciergePage = lazy(() => import("./pages/dashboard/Concierge"));
const ResourcesPage = lazy(() => import("./pages/dashboard/Resources"));
const SetupPage = lazy(() => import("./pages/dashboard/Setup"));
const PrereqsPage = lazy(() => import("./pages/dashboard/Prereqs"));
const SettingsPage = lazy(() => import("./pages/dashboard/Settings"));
const BillingPage = lazy(() => import("./pages/dashboard/Billing"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/*" element={<AuthPage />} />
              <Route path="/licensing-test" element={<LicensingTest />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardIndex />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="phases" element={<PhasesPage />} />
                <Route path="actions" element={<ActionsPage />} />
                <Route path="inputs" element={<InputsPage />} />
                <Route path="milestones" element={<MilestonesPage />} />
                <Route path="logbook" element={<LogbookPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="monthly-review" element={<MonthlyReviewPage />} />
                <Route path="distribution" element={<DistributionPage />} />
                <Route path="concierge" element={<ConciergePage />} />
                <Route path="rules" element={<RulesPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="prereqs" element={<PrereqsPage />} />
                <Route path="setup" element={<SetupPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexProviderWithClerk>
    </InstrumentationProvider>
    </ClerkProvider>
  </StrictMode>,
);
