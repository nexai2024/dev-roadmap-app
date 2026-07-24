/**
 * Convex Auth Configuration for Clerk Integration
 *
 * Supports both Production (custom domain: clerk.protocol100.xyz / protocol100.xyz)
 * and Development (Clerk dev domain: actual-opossum-46.clerk.accounts.dev).
 * Also supports process.env.CLERK_JWT_ISSUER_DOMAIN set via Convex environment variables.
 */
export default {
  providers: [
    ...(process.env.CLERK_JWT_ISSUER_DOMAIN
      ? [
          {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
            applicationID: "convex",
          },
        ]
      : []),
    {
      // Production Clerk Custom Domain
      domain: "https://clerk.protocol100.xyz",
      applicationID: "convex",
    },
    {
      // Production Apex Domain
      domain: "https://protocol100.xyz",
      applicationID: "convex",
    },
    {
      // Development Clerk Instance Domain
      domain: "https://actual-opossum-46.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};