"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { GenericId as Id } from "convex/values";

import { convexApi } from "@/lib/convex-api";
import { studentJoinStorageKey, studentStorageKey } from "@/lib/runtime";
import {
  STAGE_LABELS,
  STUDENT_STAGE_ORDER,
  type Stage,
} from "@/shared/scenario";

const CHOICES = [
  "훔친 곡식만 돌려준다",
  "훔친 것보다 더 많이 갚게 한다",
  "마을에서 내쫓는다",
  "피해와 사정을 살핀 뒤 마을 회의에서 결정한다",
];

const STAGE_GUIDE: Record<Stage, { title: string; body: string }> = {
  lobby: { title: "친구들을 기다리고 있어요", body: "교사가 시작하면 모둠과 역할이 나타납니다." },
  role: { title: "나만의 역할 자료", body: "내 자료에서 모둠에 꼭 말할 내용을 한 가지 찾으세요." },
  first: { title: "혼자 먼저 판단하기", body: "아직 친구 답은 보지 말고 내 자료를 근거로 판단하세요." },
  share: { title: "자료를 말로 공유하기", body: "‘내 자료에는…’으로 시작해 한 사람씩 설명하세요." },
  law: { title: "우리 마을의 법 만들기", body: "서로 다른 처지 두 가지를 반영해 모둠 문장을 만드세요." },
  history: { title: "실제 역사 자료와 비교하기", body: "고조선의 법은 사회 질서와 재산을 중요하게 여겼음을 보여 줍니다." },
  finished: { title: "활동을 마쳤어요", body: "교사가 활동을 종료하면 이 기기의 세션 기록도 삭제됩니다." },
};

type StoredSession = { token: string; aliasCandidates: string[]; code?: string };

function useSessionValue(key: string) {
  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener("cooperative-session-change", notify);
    return () => window.removeEventListener("cooperative-session-change", notify);
  }, []);
  const value = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem(key) ?? "",
    () => "",
  );
  const setValue = useCallback((nextValue: string) => {
    sessionStorage.setItem(key, nextValue);
    window.dispatchEvent(new Event("cooperative-session-change"));
  }, [key]);
  return [value, setValue] as const;
}

export function LiveStudentActivity({ sessionId }: { sessionId: string }) {
  const typedSessionId = sessionId as Id<"sessions">;
  const storageKey = studentStorageKey(sessionId);
  const rawStored = useSyncExternalStore(
    () => () => undefined,
    () => sessionStorage.getItem(storageKey),
    () => null,
  );
  const stored = useMemo(() => {
    if (!rawStored) return null;
    try {
      return JSON.parse(rawStored) as StoredSession;
    } catch {
      return null;
    }
  }, [rawStored]);
  const [choice, setChoice] = useSessionValue(`${storageKey}:choice`);
  const [reason, setReason] = useSessionValue(`${storageKey}:reason`);
  const [error, setError] = useState("");
  const selectAlias = useMutation(convexApi.students.selectAlias);
  const advance = useMutation(convexApi.students.advance);
  const view = useQuery(
    convexApi.students.view,
    stored?.token ? { sessionId: typedSessionId, token: stored.token } : "skip",
  );

  useEffect(() => {
    if (view === null) {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(`${storageKey}:choice`);
      sessionStorage.removeItem(`${storageKey}:reason`);
      if (stored?.code) {
        sessionStorage.removeItem(studentJoinStorageKey(stored.code));
      }
    }
  }, [storageKey, stored?.code, view]);

  const progress = useMemo(() => {
    if (!view) return 0;
    const index = STUDENT_STAGE_ORDER.indexOf(view.stage);
    return Math.max(0, Math.round(((index + 1) / STUDENT_STAGE_ORDER.length) * 100));
  }, [view]);

  if (!stored) return <div className="notice error">접속 정보가 없습니다. QR을 다시 찍어 입장해 주세요.</div>;
  if (view === undefined) return <div className="notice">실시간 활동 상태를 불러오고 있습니다.</div>;
  if (view === null) {
    return (
      <section className="student-panel">
        <h1>활동이 종료되었습니다</h1>
        <p className="deleted">이 기기의 호·선택·세션 접속 정보를 삭제했습니다.</p>
      </section>
    );
  }

  async function chooseAlias(alias: string) {
    if (!stored) return;
    setError("");
    try {
      await selectAlias({ sessionId: typedSessionId, token: stored.token, alias });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "호를 선택하지 못했습니다.");
    }
  }

  async function goNext() {
    if (!stored) return;
    if (view?.stage === "first" && (!choice || !reason.trim())) {
      setError("내 판단과 까닭을 이 기기에 먼저 적어 주세요.");
      return;
    }
    setError("");
    try {
      await advance({ sessionId: typedSessionId, token: stored.token });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "다음 단계로 이동하지 못했습니다.");
    }
  }

  if (!view.alias) {
    return (
      <section className="student-panel">
        <span className="badge">활동마다 새로 선택</span>
        <h1>오늘 사용할 호를 골라요</h1>
        <p>이 호는 이번 활동이 끝나면 삭제되고 다음 활동에는 이어지지 않습니다.</p>
        <div className="choice-grid">
          {stored.aliasCandidates.map((alias) => (
            <button className="choice" key={alias} onClick={() => chooseAlias(alias)}>{alias}</button>
          ))}
        </div>
        {error && <p className="notice error">{error}</p>}
      </section>
    );
  }

  const guide = STAGE_GUIDE[view.stage];
  return (
    <section className="student-panel">
      <div className="topbar">
        <div>
          <span className="badge">{view.groupNumber ? `${view.groupNumber}모둠` : "입장 대기"}</span>
          <h1>{view.alias}</h1>
          <p>{STAGE_LABELS[view.stage]}</p>
        </div>
      </div>
      <div className="progress" aria-label={`진행률 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>

      {view.intervention && (
        <div className="intervention">
          <strong>{view.intervention.kind === "hint" ? "교사 힌트" : "교사 심화 상황"}</strong><br />
          {view.intervention.message}
        </div>
      )}

      <h2>{guide.title}</h2>
      <p>{guide.body}</p>

      {view.stage === "role" && view.role && (
        <div className="role-card">
          <h3>{view.role.icon} {view.role.name}</h3>
          <p><strong>나만 알고 있는 정보</strong><br />{view.role.privateInfo}</p>
          <p><strong>나의 이해관계</strong><br />{view.role.interest}</p>
        </div>
      )}

      {view.stage === "first" && (
        <div className="form">
          <div className="choice-grid">
            {CHOICES.map((item) => (
              <button
                className={`choice${choice === item ? " selected" : ""}`}
                key={item}
                onClick={() => {
                  setChoice(item);
                }}
              >{item}</button>
            ))}
          </div>
          <label className="label">그렇게 생각한 까닭
            <textarea
              className="textarea"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
              }}
            />
          </label>
          <p className="notice">이 선택과 까닭은 이 기기의 현재 탭에만 있고 서버에는 제출 여부만 표시됩니다.</p>
        </div>
      )}

      {error && <p className="notice error" role="alert">{error}</p>}
      {view.sessionStatus === "active" && view.stage !== "finished" && (
        <button className="button primary" onClick={goNext}>이 단계 마치기</button>
      )}
    </section>
  );
}
