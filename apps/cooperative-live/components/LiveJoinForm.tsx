"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GenericId as Id } from "convex/values";

import { convexApi } from "@/lib/convex-api";
import {
  manualJoinAttemptStorageKey,
  studentJoinStorageKey,
  studentStorageKey,
} from "@/lib/runtime";
import { createOpaqueToken } from "@/shared/join-security";

const SAFE_JOIN_ERROR = "입장 정보를 확인할 수 없습니다. QR을 다시 찍거나 수업 코드를 확인해 주세요.";

type JoinResult = {
  sessionId: Id<"sessions">;
  token: string;
  aliasCandidates: string[];
};

export function LiveJoinForm() {
  const router = useRouter();
  const joinWithEntryKey = useMutation(convexApi.students.joinWithEntryKey);
  const joinWithCode = useMutation(convexApi.students.joinWithCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const handledEntryKey = useRef(false);

  const rememberSession = useCallback((result: JoinResult, manualCode?: string) => {
    sessionStorage.setItem(
      studentStorageKey(result.sessionId),
      JSON.stringify({
        token: result.token,
        aliasCandidates: result.aliasCandidates,
      }),
    );
    if (manualCode) {
      sessionStorage.setItem(studentJoinStorageKey(manualCode), result.sessionId);
    }
    router.push(`/play/${result.sessionId}`);
  }, [router]);

  useEffect(() => {
    if (handledEntryKey.current || !window.location.hash) return;
    const entryKey = new URLSearchParams(window.location.hash.slice(1)).get("entry");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    if (!entryKey) return;

    handledEntryKey.current = true;
    queueMicrotask(() => setBusy(true));
    void joinWithEntryKey({ entryKey })
      .then((result) => rememberSession(result))
      .catch(() => setError(SAFE_JOIN_ERROR))
      .finally(() => setBusy(false));
  }, [joinWithEntryKey, rememberSession]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const normalizedCode = code.trim();
      const rememberedSessionId = sessionStorage.getItem(
        studentJoinStorageKey(normalizedCode),
      );
      if (
        rememberedSessionId &&
        sessionStorage.getItem(studentStorageKey(rememberedSessionId))
      ) {
        router.push(`/play/${rememberedSessionId}`);
        return;
      }
      sessionStorage.removeItem(studentJoinStorageKey(normalizedCode));

      const attemptStorageKey = manualJoinAttemptStorageKey();
      const attemptId = sessionStorage.getItem(attemptStorageKey) ?? createOpaqueToken();
      sessionStorage.setItem(attemptStorageKey, attemptId);
      const result = await joinWithCode({ code: normalizedCode, attemptId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      rememberSession(result, normalizedCode);
    } catch {
      setError(SAFE_JOIN_ERROR);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      {busy && !code && <p className="notice">QR 입장 정보를 확인하고 있습니다.</p>}
      <label className="label">
        여섯 자리 수업 코드
        <input
          className="input"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          pattern="[0-9]{6}"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
      </label>
      <button className="button primary" disabled={busy || code.length !== 6}>
        {busy ? "입장 확인 중…" : "활동에 입장"}
      </button>
      {error && <p className="notice error" role="alert">{error}</p>}
    </form>
  );
}
