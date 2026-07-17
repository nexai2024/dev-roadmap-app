import { httpRouter } from "convex/server";
import { api, internal } from "./_generated/api";
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
      console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env variables");
      return new Response("Stripe integration not configured on server", { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20" as unknown as "2026-06-24.dahlia",
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("Signature verification failed:", err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email || session.customer_email;
      
      if (customerEmail) {
        // 1. Generate & send license key (automatically inserts license record)
        await ctx.runAction(internal.licenses.generateAndSend, {
          userEmail: customerEmail,
          type: "lifetime",
        });

        // 2. Locate user and upgrade to paid (lifetime)
        await ctx.runMutation(internal.users.upgradeUserByEmail, {
          email: customerEmail,
          licenseType: "lifetime",
        });

        // 3. Synchronize to Clerk user metadata
        await ctx.runAction(api.clerkSync.syncClerkUser, {
          email: customerEmail,
          tier: "lifetime",
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Webhook to generate and send license
http.route({
  path: "/webhook/license/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Basic shared secret authentication
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.VLY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("VLY_WEBHOOK_SECRET is not set");
      return new Response("Configuration Error", { status: 500 });
    }
    if (authHeader !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { userEmail, type } = await request.json();
    if (!userEmail || !type) {
      return new Response("Missing userEmail or type", { status: 400 });
    }
    await ctx.runAction(internal.licenses.generateAndSend, { userEmail, type });
    return new Response(null, { status: 200 });
  }),
});

// API to activate license
http.route({
  path: "/api/license/activate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { key, hardwareId } = await request.json();
    if (!key || !hardwareId) {
      return new Response("Missing key or hardwareId", { status: 400 });
    }
    try {
      const result = await ctx.runMutation(api.licenses.activate, { key, hardwareId });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// API to validate license
http.route({
  path: "/api/license/validate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { key, hardwareId } = await request.json();
    if (!key || !hardwareId) {
      return new Response("Missing key or hardwareId", { status: 400 });
    }
    const result = await ctx.runQuery(api.licenses.validate, { key, hardwareId });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
        return new Response("Missing message", { status: 400 });
      }

      await ctx.runMutation(internal.logs.create, {
        message,
        stack,
        context,
        timestamp: timestamp ?? Date.now(),
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error processing log request:", errMsg);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
