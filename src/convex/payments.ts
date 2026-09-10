"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { action, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { getLifetimeOffer } from "./lifetimeOffer";

const lifetimeCheckoutResult = v.object({
  url: v.string(),
  amountCents: v.number(),
  earlyBird: v.boolean(),
});

async function createStripeLifetimeSession(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.runQuery(api.users.currentUser, {});
  if (!user) {
    throw new Error("User not found — sign in again and retry checkout");
  }
  if (user.isPaid) {
    throw new Error("You already have lifetime access");
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (!secretKey) {
    throw new Error("Stripe is not configured on the server");
  }
  if (!siteUrl) {
    throw new Error("SITE_URL is not configured on the server");
  }

  const inventory = await ctx.runQuery(api.lifetime.earlyBirdInventory, {});
  const offer = getLifetimeOffer(Date.now(), inventory.remaining);
  const email = user.email ?? identity.email;
  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20" as unknown as "2026-06-24.dahlia",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: user._id,
    customer_email: email,
    success_url: `${siteUrl}/dashboard/billing?payment=success`,
    cancel_url: `${siteUrl}/dashboard/billing?payment=cancel`,
    metadata: {
      product: "protocol100_lifetime",
      offer: offer.earlyBird ? "early_bird_75" : "list",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: offer.amountCents,
          product_data: {
            name: offer.earlyBird
              ? "Protocol100 Lifetime Access — Early Bird"
              : "Protocol100 Lifetime Access",
            description: offer.earlyBird
              ? `75% off early bird (${offer.remainingSpots} of 100 spots left). One-time payment. Unlocks all 100 days forever.`
              : "One-time payment. Unlocks all 100 days forever.",
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return {
    url: session.url,
    amountCents: offer.amountCents,
    earlyBird: offer.earlyBird,
  };
}

export const createLifetimeCheckout = action({
  args: {},
  returns: lifetimeCheckoutResult,
  handler: async (ctx) => {
    return await createStripeLifetimeSession(ctx);
  },
});

/** Kept so existing callers still charge the live lifetime offer. */
export const createCheckoutSession = action({
  args: {
    email: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, _args) => {
    const session = await createStripeLifetimeSession(ctx);
    return session.url;
  },
});
