"use client";

import { useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { convexApi } from "@/lib/convex-api";
import { studentStorageKey } from "@/lib/runtime";

export function LiveJoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const join = useMutation(convexApi.students.join);
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await join({ code });
      sessionStorage.setItem(
        studentStorageKey(result.sessionId),
        JSON.stringify({ token: result.token, aliasCandidates: result.aliasCandidates }),
      );
      router.push(`/play/${result.sessionId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "수업에 입장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
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
