"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import type { ReactNode } from "react";

import { isLiveConfigured } from "@/lib/runtime";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function AppProviders({ children }: { children: ReactNode }) {
  if (!isLiveConfigured || !convex) return children;

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri:
          typeof window === "undefined" ? undefined : `${window.location.origin}/teacher`,
      }}
      useRefreshTokens
    >
      <ConvexProviderWithAuth0 client={convex}>{children}</ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
