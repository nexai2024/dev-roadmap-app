import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://d3b19bee108d629dbebd26153d10672e@o4510662650363904.ingest.us.sentry.io/4511767886168065",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  }
});



/* import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,

  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Tracing — 1.0 for development, lower to 0.1–0.2 in production
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/acoustic-camel-128\.convex\.(cloud|site)/],

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Structured logging
  enableLogs: true,
});
 */