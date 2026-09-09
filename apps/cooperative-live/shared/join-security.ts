export const ENTRY_KEY_BYTES = 32;
export const ENTRY_CREDENTIAL_TTL_MS = 15 * 60 * 1000;
export const STUDENT_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
export const ATTEMPT_RETENTION_MS = 15 * 60 * 1000;

export type AttemptPolicy = {
  maxFailures: number;
  windowMs: number;
  blockMs: number;
};

export type AttemptState = {
  failedAttempts: number;
  windowStartedAt: number;
  blockedUntil?: number;
  deleteAfter: number;
};

export const BROWSER_ATTEMPT_POLICY: AttemptPolicy = {
  maxFailures: 5,
  windowMs: 5 * 60 * 1000,
  blockMs: 10 * 60 * 1000,
};

export const CODE_ATTEMPT_POLICY: AttemptPolicy = {
  maxFailures: 30,
  windowMs: 5 * 60 * 1000,
  blockMs: 5 * 60 * 1000,
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createOpaqueToken(byteLength = ENTRY_KEY_BYTES) {
  if (byteLength < 16) throw new Error("보안 토큰은 128비트 이상이어야 합니다.");
  return bytesToHex(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret: string, scope: string, value: string) {
  if (secret.length < 32) {
    throw new Error("JOIN_ATTEMPT_HMAC_SECRET은 32자 이상이어야 합니다.");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${scope}:${value}`),
  );
  return bytesToHex(new Uint8Array(signature));
}

export function expiresAt(now: number, parentDeleteAfter: number, ttlMs: number) {
  return Math.min(now + ttlMs, parentDeleteAfter);
}

export function isCredentialActive(expiresAtValue: number | undefined, now: number) {
  return typeof expiresAtValue === "number" && expiresAtValue > now;
}

export function isAttemptBlocked(
  state: Pick<AttemptState, "blockedUntil"> | null,
  now: number,
) {
  return typeof state?.blockedUntil === "number" && state.blockedUntil > now;
}

export function nextFailureState(
  current: AttemptState | null,
  now: number,
  policy: AttemptPolicy,
): AttemptState {
  const remainsInWindow = Boolean(
    current && now - current.windowStartedAt < policy.windowMs,
  );
  const failedAttempts = remainsInWindow ? current!.failedAttempts + 1 : 1;
  const windowStartedAt = remainsInWindow ? current!.windowStartedAt : now;
  const blockedUntil = failedAttempts >= policy.maxFailures
    ? now + policy.blockMs
    : undefined;

  return {
    failedAttempts,
    windowStartedAt,
    blockedUntil,
    deleteAfter: Math.max(now + ATTEMPT_RETENTION_MS, blockedUntil ?? 0),
  };
}
