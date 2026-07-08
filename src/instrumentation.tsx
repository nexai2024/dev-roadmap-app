import { toast } from "sonner";
import React, { useEffect } from "react";
import { Logger } from "@/lib/logger";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Fallback UI for non-critical render errors.
 */
function ErrorFallback() {
  return (
    <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Something went wrong</h3>
      </div>
      <p className="text-sm mb-4 opacity-90">
        This part of the page couldn't be loaded. We've been notified and are looking into it.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
        className="text-destructive border-destructive/20 hover:bg-destructive/10"
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Reload page
      </Button>
    </div>
  );
}

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the error centrally
    Logger.logError(error, info.componentStack ?? undefined);

    // Show a toast for render errors too (generic message)
    toast.error("An unexpected error occurred", {
      description: "We've logged the issue and will investigate.",
      duration: 5000,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

/**
 * Global provider for error instrumentation.
 * Handles unhandled rejections and global errors.
 */
export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add a marker to indicate global error handling is active
    (window as any).__INSTRUMENTATION_ACTIVE__ = true;

    const handleError = (event: ErrorEvent) => {
      // Prevent the default browser error handling (e.g., the red overlay in some dev environments)
      event.preventDefault();

      // Log the error centrally
      Logger.logError(event.error || event.message, `Filename: ${event.filename}, Line: ${event.lineno}`);

      // Show a generic toast
      toast.error("An unexpected error occurred", {
        description: "We've logged the issue and will investigate.",
        duration: 5000,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      // Log the rejection centrally
      Logger.logError(event.reason, "Unhandled Promise Rejection");

      // Show a generic toast
      toast.error("An unexpected error occurred", {
        description: "We've logged the issue and will investigate.",
        duration: 5000,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
