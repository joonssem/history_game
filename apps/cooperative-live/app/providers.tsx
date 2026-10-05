"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

import { isLiveConfigured } from "@/lib/runtime";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function AppProviders({ children }: { children: ReactNode }) {
  if (!isLiveConfigured || !convex) return children;

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
