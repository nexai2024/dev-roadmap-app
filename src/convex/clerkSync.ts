import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Internal-only: Stripe webhook syncs Clerk public_metadata.tier.
 * Not callable from the client — keeps CLERK_SECRET_KEY usage off the public API.
 */
export const syncClerkUser = internalAction({
  args: {
    email: v.string(),
    tier: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn("CLERK_SECRET_KEY not set. Skipping Clerk metadata update.");
      return null;
    }

    try {
      const searchRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(args.email)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );
      if (!searchRes.ok) {
        console.error("Failed to query Clerk users by email", await searchRes.text());
        return null;
      }

      interface ClerkUser {
        id: string;
      }
      const clerkUsers = (await searchRes.json()) as ClerkUser[];
      for (const clerkUser of clerkUsers) {
        const updateRes = await fetch(
          `https://api.clerk.com/v1/users/${clerkUser.id}/metadata`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              public_metadata: {
                tier: args.tier,
              },
            }),
          }
        );
        if (!updateRes.ok) {
          console.error(`Failed to update Clerk user metadata for ${clerkUser.id}`, await updateRes.text());
        } else {
          console.log(`Successfully synced Clerk user ${clerkUser.id} to tier ${args.tier}`);
        }
      }
    } catch (error) {
      console.error("Error updating Clerk metadata:", error);
    }
    return null;
  },
});
