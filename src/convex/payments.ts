"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { vly } from "../lib/vly-integrations";

export const createCheckoutSession = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    let result;
    try {
      if ((vly as any).payments) {
        result = await (vly as any).payments.createCheckoutSession({
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
    } catch (error: any) {
      throw new Error(error.message || "Failed to create checkout session");
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to create checkout session");
    }

    return result.data.url;
  },
});
