"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { vly } from "../lib/vly-integrations";

interface VlyIntegrationInstance {
  payments?: {
    createCheckoutSession: (params: {
      amount: number;
      currency: string;
      description: string;
      customer: { email: string };
      success_url: string;
      cancel_url: string;
    }) => Promise<{
      success: boolean;
      error?: string;
      data: { url: string };
    }>;
  };
}

export const createCheckoutSession = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    let result;
    const typedVly = vly as unknown as VlyIntegrationInstance;
    try {
      if (typedVly.payments) {
        result = await typedVly.payments.createCheckoutSession({
          amount: 2000, // $20.00
          currency: "usd",
          description: "Protocol100 Full Access",
          customer: {
            email: args.email,
          },
          success_url: `${process.env.SITE_URL}/dashboard?status=success`,
          cancel_url: `${process.env.SITE_URL}/dashboard?status=cancel`,
        });
      } else {
        throw new Error("Payments integration not supported on this deployment");
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(errMsg || "Failed to create checkout session");
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to create checkout session");
    }

    return result.data.url;
  },
});
