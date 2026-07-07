import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

auth.addHttpRoutes(http);

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
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
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

export default http;
