import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import "./types/global.d.ts";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Dashboard sub-routes
const DashboardLayout = lazy(() => import("./components/dashboard-layout.tsx"));
const DashboardIndex = lazy(() => import("./pages/dashboard/Index.tsx"));
const TodayPage = lazy(() => import("./pages/dashboard/Today.tsx"));
const PhasesPage = lazy(() => import("./pages/dashboard/Phases.tsx"));
const ActionsPage = lazy(() => import("./pages/dashboard/Actions.tsx"));
const InputsPage = lazy(() => import("./pages/dashboard/Inputs.tsx"));
const MilestonesPage = lazy(() => import("./pages/dashboard/Milestones.tsx"));
const LogbookPage = lazy(() => import("./pages/dashboard/Logbook.tsx"));
const ReviewPage = lazy(() => import("./pages/dashboard/Review.tsx"));
const RulesPage = lazy(() => import("./pages/dashboard/Rules.tsx"));
const ResourcesPage = lazy(() => import("./pages/dashboard/Resources.tsx"));
const SetupPage = lazy(() => import("./pages/dashboard/Setup.tsx"));

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
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardIndex />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="phases" element={<PhasesPage />} />
                <Route path="actions" element={<ActionsPage />} />
                <Route path="inputs" element={<InputsPage />} />
                <Route path="milestones" element={<MilestonesPage />} />
                <Route path="logbook" element={<LogbookPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="rules" element={<RulesPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="setup" element={<SetupPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
