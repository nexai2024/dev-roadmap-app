import { v } from "convex/values";
import { action } from "./_generated/server";

export const syncClerkUser = action({
  args: {
    email: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn("CLERK_SECRET_KEY not set. Skipping Clerk metadata update.");
      return;
    }

    try {
      // 1. Get user by email
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
        return;
      }

      const clerkUsers = (await searchRes.json()) as any[];
      for (const clerkUser of clerkUsers) {
        // 2. Update public metadata
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
  },
});
