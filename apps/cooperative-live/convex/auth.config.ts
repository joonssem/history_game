import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN ?? "not-configured.invalid",
      applicationID: process.env.AUTH0_CLIENT_ID ?? "not-configured",
    },
  ],
} satisfies AuthConfig;
