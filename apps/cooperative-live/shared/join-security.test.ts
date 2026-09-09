import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BROWSER_ATTEMPT_POLICY,
  CODE_ATTEMPT_POLICY,
  createOpaqueToken,
  expiresAt,
  hmacSha256Hex,
  isAttemptBlocked,
  isCredentialActive,
  nextFailureState,
  sha256Hex,
} from "./join-security.ts";

describe("협동 MUD 입장 보안", () => {
  it("QR 입장키를 256비트 난수로 만들고 원문 대신 SHA-256 해시를 만든다", async () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();

    assert.match(first, /^[0-9a-f]{64}$/);
    assert.match(second, /^[0-9a-f]{64}$/);
    assert.notEqual(first, second);
    assert.match(await sha256Hex(first), /^[0-9a-f]{64}$/);
    assert.notEqual(await sha256Hex(first), first);
  });

  it("같은 값도 용도별 HMAC 버킷을 다르게 만든다", async () => {
    const secret = "test-secret-that-is-longer-than-thirty-two-characters";
    const browserBucket = await hmacSha256Hex(secret, "browser", "same-value");
    const codeBucket = await hmacSha256Hex(secret, "code", "same-value");

    assert.match(browserBucket, /^[0-9a-f]{64}$/);
    assert.notEqual(browserBucket, codeBucket);
  });

  it("입장 자격 만료를 세션 삭제 시각보다 늦게 잡지 않는다", () => {
    assert.equal(expiresAt(1_000, 5_000, 10_000), 5_000);
    assert.equal(isCredentialActive(5_000, 4_999), true);
    assert.equal(isCredentialActive(5_000, 5_000), false);
    assert.equal(isCredentialActive(undefined, 1_000), false);
  });

  it("브라우저 버킷은 5회 실패 뒤 10분 차단한다", () => {
    let state = null;
    const now = 1_000_000;
    for (let count = 0; count < 5; count += 1) {
      state = nextFailureState(state, now + count, BROWSER_ATTEMPT_POLICY);
    }

    assert.ok(state);
    assert.equal(state.failedAttempts, 5);
    assert.equal(isAttemptBlocked(state, now + 5), true);
    assert.equal(
      state.blockedUntil,
      now + 4 + BROWSER_ATTEMPT_POLICY.blockMs,
    );
  });

  it("수업 코드 버킷은 새 5분 창에서 횟수를 다시 센다", () => {
    const first = nextFailureState(null, 10_000, CODE_ATTEMPT_POLICY);
    const reset = nextFailureState(
      first,
      10_000 + CODE_ATTEMPT_POLICY.windowMs,
      CODE_ATTEMPT_POLICY,
    );

    assert.equal(reset.failedAttempts, 1);
    assert.equal(reset.windowStartedAt, 10_000 + CODE_ATTEMPT_POLICY.windowMs);
  });

  it("수업 코드 전체 버킷은 30회 실패 뒤 5분 차단한다", () => {
    let state = null;
    const now = 2_000_000;
    for (let count = 0; count < 30; count += 1) {
      state = nextFailureState(state, now + count, CODE_ATTEMPT_POLICY);
    }

    assert.ok(state);
    assert.equal(state.failedAttempts, 30);
    assert.equal(isAttemptBlocked(state, now + 30), true);
    assert.equal(state.blockedUntil, now + 29 + CODE_ATTEMPT_POLICY.blockMs);
  });
});
