"use client";

import { useMutation } from "convex/react";
import type { FunctionReference, OptionalRestArgs } from "convex/server";
import { useCallback, useSyncExternalStore } from "react";

// 교사 로그인 토큰은 탭을 닫아도 12시간 유지되도록 localStorage에 둔다.
const TEACHER_TOKEN_KEY = "cooperative-live-teacher:token";
const TEACHER_TOKEN_EVENT = "cooperative-teacher-token-change";

function readToken() {
  try {
    return localStorage.getItem(TEACHER_TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeTeacherToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TEACHER_TOKEN_KEY, token);
    else localStorage.removeItem(TEACHER_TOKEN_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 새로고침 때 다시 로그인한다.
  }
  window.dispatchEvent(new Event(TEACHER_TOKEN_EVENT));
}

function subscribe(notify: () => void) {
  window.addEventListener(TEACHER_TOKEN_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(TEACHER_TOKEN_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

export function useTeacherToken() {
  return useSyncExternalStore(subscribe, readToken, () => "");
}

export function useTeacherMutation<Args extends { teacherToken: string }, Result>(
  reference: FunctionReference<"mutation", "public", Args, Result>,
) {
  const mutate = useMutation(reference);
  const teacherToken = useTeacherToken();
  return useCallback(
    (args: Omit<Args, "teacherToken">) =>
      mutate(...([{ ...args, teacherToken }] as OptionalRestArgs<typeof reference>)),
    [mutate, teacherToken],
  );
}
