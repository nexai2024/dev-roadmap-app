/**
 * Centralized logging service for the application.
 * Sends logs to the Convex HTTP /api/logs endpoint.
 */

function getLogsEndpoint(): string {
  // Convex URL looks like https://xxx.convex.cloud
  // HTTP routes are at the same origin under the path
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (convexUrl) {
    // Replace the protocol from convex cloud URL to the HTTP site URL
    // Convex HTTP actions are served from the same deployment URL
    const base = convexUrl.replace(/\.cloud$/, ".site");
    return `${base}/api/logs`;
  }
  // Fallback (dev only)
  return "/api/logs";
}

export const Logger = {
  /**
   * Log an error to the centralized logging service.
   * @param error The error object or message to log.
   * @param context Optional context information (e.g., component stack, action name).
   */
  logError: async (error: any, context?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const timestamp = Date.now();

    const url = getLogsEndpoint();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          stack,
          context,
          timestamp,
        }),
      });

      if (!response.ok) {
        // Fallback to console if logging fails
        console.warn("Failed to send log to central service:", response.statusText);
      }
    } catch (err) {
      // Fallback to console if logging fails
      console.error("Critical failure in Logger.logError:", err);
    }
  },
};

