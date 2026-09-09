import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

const http = httpRouter();

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      console.warn("[Stripe Webhook] Signature verification failed:", message);
      return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
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
        await ctx.runAction(internal.clerkSync.syncClerkUser, {
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
