export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const isLiveConfigured = Boolean(
  process.env.NEXT_PUBLIC_CONVEX_URL &&
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN &&
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID &&
    !isDemoMode,
);

export function studentStorageKey(sessionId: string) {
  return `cooperative-live:${sessionId}`;
}

export function clearCooperativeSessionStorage() {
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith("cooperative-live:")) {
      sessionStorage.removeItem(key);
    }
  }
}
