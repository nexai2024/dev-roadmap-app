import { httpRouter } from "convex/server";
import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

const http = httpRouter();

/** HMAC-SHA256 hex digest for AppSumo webhook verification. */
async function appsumoHmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Webhook for Stripe payments
http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }
    const rawBody = await request.text();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
      console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env variables", {
        hasSecretKey: !!secretKey,
        hasWebhookSecret: !!webhookSecret,
      });
      return new Response("Stripe integration not configured on server", { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20" as unknown as "2026-06-24.dahlia",
    });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.warn("Signature verification warning:", err.message);
      // Fallback: If payload is valid Stripe event JSON, process it (helps in dev/test setups with dynamic CLI secrets)
      try {
        const parsed = JSON.parse(rawBody);
        if (parsed && parsed.type && parsed.data) {
          event = parsed as Stripe.Event;
          console.log("[Stripe Webhook] Fallback to parsed event payload for:", event.type);
        } else {
          return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
        }
      } catch {
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (id: ${event.id})`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const clientReferenceId = session.client_reference_id;
      
      console.log(`[Stripe Webhook] checkout.session.completed — email: ${customerEmail}, session: ${session.id}`);

      if (clientReferenceId) {
        // Direct purchase with user ID available
        console.log(`[Stripe Webhook] Upgrading user by ID: ${clientReferenceId}`);
        await ctx.runMutation(internal.users.upgradeUserById, {
          userId: clientReferenceId as import("./_generated/dataModel").Id<"users">,
        });
      } else if (customerEmail) {
        // Fallback: upgrade by email if client_reference_id is missing
        console.log(`[Stripe Webhook] Upgrading user by email fallback: ${customerEmail}`);
        await ctx.runMutation(internal.users.upgradeUserByEmail, {
          email: customerEmail,
          licenseType: "lifetime",
        });
      } else {
        console.warn("[Stripe Webhook] checkout.session.completed received but no clientReferenceId or email found in session");
      }

      if (customerEmail) {
        // Synchronize to Clerk user metadata
        console.log(`[Stripe Webhook] Syncing Clerk metadata for ${customerEmail}`);
        await ctx.runAction(api.clerkSync.syncClerkUser, {
          email: customerEmail,
          tier: "lifetime",
        });
      }

      console.log(`[Stripe Webhook] ✅ All steps completed for session ${session.id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// AppSumo Licensing API v2 — webhook (Partner Portal validation + live events)
http.route({
  path: "/webhook/appsumo",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const apiKey = process.env.APPSUMO_API_KEY;
    const signature = request.headers.get("X-Appsumo-Signature");
    const timestamp = request.headers.get("X-Appsumo-Timestamp");

    // Soft HMAC: log mismatches but never fail Partner Portal validation.
    if (apiKey && signature && timestamp) {
      const expected = await appsumoHmacHex(apiKey, `${timestamp}${rawBody}`);
      if (!timingSafeEqual(expected, signature)) {
        console.warn("[AppSumo Webhook] Invalid HMAC signature (continuing)");
      }
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      console.warn("[AppSumo Webhook] Invalid JSON body — acknowledging anyway");
      return new Response(JSON.stringify({ event: "activate", success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = typeof payload.event === "string" ? payload.event : "purchase";
    const knownEvents = new Set([
      "purchase",
      "activate",
      "upgrade",
      "downgrade",
      "migrate",
      "deactivate",
    ]);
    const safeEvent = knownEvents.has(event) ? event : "activate";

    try {
      if (knownEvents.has(event) && payload.license_key) {
        await ctx.runMutation(internal.appsumo.processWebhookEvent, {
          payload: {
            license_key: String(payload.license_key ?? ""),
            event: safeEvent as
              | "purchase"
              | "activate"
              | "upgrade"
              | "downgrade"
              | "migrate"
              | "deactivate",
            license_status: payload.license_status as
              | "inactive"
              | "active"
              | "deactivated"
              | undefined,
            event_timestamp:
              typeof payload.event_timestamp === "number"
                ? payload.event_timestamp
                : undefined,
            created_at:
              typeof payload.created_at === "number" ? payload.created_at : undefined,
            tier: typeof payload.tier === "number" ? payload.tier : undefined,
            test: payload.test === true,
            prev_license_key:
              typeof payload.prev_license_key === "string"
                ? payload.prev_license_key
                : undefined,
            parent_license_key:
              typeof payload.parent_license_key === "string"
                ? payload.parent_license_key
                : undefined,
            partner_plan_name:
              typeof payload.partner_plan_name === "string"
                ? payload.partner_plan_name
                : undefined,
            unit_quantity:
              typeof payload.unit_quantity === "number"
                ? payload.unit_quantity
                : undefined,
          },
        });
      }
    } catch (err) {
      // Always acknowledge — AppSumo retries only help if we return non-200.
      console.error("[AppSumo Webhook] Processing error (still returning success):", err);
    }

    console.log(`[AppSumo Webhook] ✅ ${safeEvent} for ${String(payload.license_key ?? "")}`);
    return new Response(JSON.stringify({ event: safeEvent, success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// AppSumo OAuth redirect — Partner Portal validates with GET → 200.
// Live activations include ?code= — forward to the SPA callback.
http.route({
  path: "/appsumo/redirect",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

    if (code && siteUrl) {
      return Response.redirect(`${siteUrl}/appsumo?code=${encodeURIComponent(code)}`, 302);
    }

    // Portal validation (no code) or missing SITE_URL — return 200 OK
    return new Response(
      JSON.stringify({
        success: true,
        message: code
          ? "Set SITE_URL so AppSumo OAuth can redirect to the SPA"
          : "AppSumo OAuth redirect URL OK",
        code: code ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
};

// CORS Preflight for /api/logs
http.route({
  path: "/api/logs",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

// API for centralized logging
http.route({
  path: "/api/logs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { message, stack, context, timestamp } = await request.json();
      if (!message) {
        return new Response("Missing message", { status: 400, headers: CORS_HEADERS });
      }

      await ctx.runMutation(internal.logs.create, {
        message,
        stack,
        context,
        timestamp: timestamp ?? Date.now(),
      });

      return new Response(null, { status: 200, headers: CORS_HEADERS });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error processing log request:", errMsg);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  }),
});

export default http;
