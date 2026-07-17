import { useCallback } from "react";
import { Logger } from "@/lib/logger";
import { toast } from "sonner";

/**
 * Hook for manual error handling in components.
 * Useful for catching errors in event handlers or async effects.
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    // Log the error centrally
    Logger.logError(error, context);

    // Show a generic toast
    toast.error("An unexpected error occurred", {
      description: "We've logged the issue and will investigate.",
      duration: 5000,
    });
  }, []);

  return { handleError };
}
