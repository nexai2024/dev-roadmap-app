import { AuthConfig } from "convex/server";

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
      domain: "https://clerk.protocol100.xyz",
      applicationID: "convex",
    },
    {
      domain: "https://actual-opossum-46.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;