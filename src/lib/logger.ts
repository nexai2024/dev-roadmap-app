/**
 * Centralized logging service for the application.
 * Sends logs to the custom POST /api/logs endpoint.
 */
export const Logger = {
  /**
   * Log an error to the centralized logging service.
   * @param error The error object or message to log.
   * @param context Optional context information (e.g., component stack, action name).
   */
  logError: async (error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const timestamp = Date.now();

    // Use the site's own API endpoint
    const url = "/api/logs";

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
