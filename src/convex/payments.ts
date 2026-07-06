"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
// @ts-expect-error - vly-ai/integrations is a dynamic import in some environments
import { vly } from "@vly-ai/integrations";

export const createCheckoutSession = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // This uses the VLY integration gateway to create a checkout session
    // In a real app, you would provide a success and cancel URL.
    const result = await vly.payments.createCheckoutSession({
      amount: 2000, // $20.00
      currency: "usd",
      description: "Protocol100 Full Access",
      customer: {
        email: args.email,
      },
      success_url: `${process.env.SITE_URL}/dashboard?status=success`,
      cancel_url: `${process.env.SITE_URL}/dashboard?status=cancel`,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create checkout session");
    }

    return result.data.url;
  },
});
