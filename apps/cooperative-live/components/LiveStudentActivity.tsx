"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { GenericId as Id } from "convex/values";

import { convexApi } from "@/lib/convex-api";
import {
  clearCooperativeSessionStorage,
  studentStorageKey,
} from "@/lib/runtime";
import {
  STAGE_LABELS,
  STUDENT_STAGE_ORDER,
  type Stage,
} from "@/shared/scenario";

const STAGE_GUIDE: Record<Stage, { title: string; body: string }> = {
  lobby: { title: "친구들을 기다리고 있어요", body: "교사가 시작하면 모둠과 역할이 나타납니다." },
  role: { title: "나만의 역할 자료", body: "내 자료에서 모둠에 꼭 말할 내용을 한 가지 찾으세요." },
  first: { title: "혼자 먼저 판단하기", body: "아직 친구 답은 보지 말고 내 자료를 근거로 판단하세요." },
  share: { title: "자료를 말로 공유하기", body: "‘내 자료에는…’으로 시작해 한 사람씩 설명하세요." },
  draft: { title: "공동 초안 만들기", body: "서로 다른 역할의 근거 두 가지와 정책 두 가지를 고르세요." },
  confirm: { title: "같은 초안 확인하기", body: "초안이 바뀌면 모두가 새 revision을 다시 확인해야 합니다." },
  finished: { title: "활동을 마쳤어요", body: "교사가 활동을 종료하면 이 기기의 세션 기록도 삭제됩니다." },
};

type StoredSession = { token: string; aliasCandidates: string[] };

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
  const [policyIds, setPolicyIds] = useState<string[]>([]);
  const [evidenceRoleIds, setEvidenceRoleIds] = useState<string[]>([]);
  const [limitationId, setLimitationId] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [editingDraft, setEditingDraft] = useState(false);
  const selectAlias = useMutation(convexApi.students.selectAlias);
  const advance = useMutation(convexApi.students.advance);
  const completeFirst = useMutation(convexApi.students.completeFirst);
  const markShared = useMutation(convexApi.students.markShared);
  const saveDraft = useMutation(convexApi.students.saveDraft);
  const confirmDraft = useMutation(convexApi.students.confirmDraft);
  const requestHelp = useMutation(convexApi.students.requestHelp);
  const view = useQuery(
    convexApi.students.view,
    stored?.token ? { sessionId: typedSessionId, token: stored.token } : "skip",
  );

  useEffect(() => {
    if (view === null) {
      clearCooperativeSessionStorage();
    }
  }, [view]);

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
      if (view?.stage === "first" && !view.firstSubmitted) await completeFirst({ sessionId: typedSessionId, token: stored.token });
      if (view?.stage === "share" && !view.sharedAt) await markShared({ sessionId: typedSessionId, token: stored.token });
      await advance({ sessionId: typedSessionId, token: stored.token });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "다음 단계로 이동하지 못했습니다.");
    }
  }

  async function saveSharedDraft() {
    if (!stored || !view) return;
    setError("");
    try {
      await saveDraft({
        sessionId: typedSessionId,
        token: stored.token,
        policyIds,
        evidenceRoleIds,
        limitationId,
        connectionId,
        expectedRevision: view.draft?.revision,
      });
      setEditingDraft(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "공동 초안을 저장하지 못했습니다."); }
  }

  async function confirmSharedDraft() {
    if (!stored || !view?.draft) return;
    setError("");
    try { await confirmDraft({ sessionId: typedSessionId, token: stored.token, revision: view.draft.revision }); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "초안을 확인하지 못했습니다."); }
  }

  if (view.sessionStatus === "preview") {
    return (
      <section className="student-panel">
        <span className="badge">모둠 확인 중</span>
        <h1>{view.alias ?? "잠시만 기다려 주세요"}</h1>
        <p>선생님이 모둠을 확인하고 있습니다. 확정되면 모둠과 역할이 함께 나타납니다.</p>
      </section>
    );
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
      {view.paused && <p className="notice error">선생님이 잠시 멈췄습니다. 안내를 기다려 주세요.</p>}

      {view.stage === "role" && view.role && (
        <div className="role-card">
          <h3>{view.role.icon} {view.role.name}</h3>
          <p><strong>나만 알고 있는 정보</strong><br />{view.role.privateInfo}</p>
          <p><strong>나의 이해관계</strong><br />{view.role.interest}</p>
          <p><strong>내가 가져갈 근거</strong><br />{view.role.evidence[0]?.label}</p>
        </div>
      )}

      {view.stage === "first" && (
        <div className="form">
          <div className="choice-grid">
            {view.role?.firstChoices.map((item) => (
              <button
                className={`choice${choice === item.id ? " selected" : ""}`}
                key={item.id}
                onClick={() => {
                  setChoice(item.id);
                }}
              >{item.label}</button>
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

      {(view.stage === "draft" || editingDraft) && (
        <div className="form">
          <strong>{view.sharedPrompt.question}</strong>
          <p>우선할 정책 2개를 고르세요.</p>
          <div className="choice-grid">{view.sharedPrompt.policies.map((item) => <button key={item.id} className={`choice${policyIds.includes(item.id) ? " selected" : ""}`} onClick={() => setPolicyIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : current.length < 2 ? [...current, item.id] : current)}>{item.label}</button>)}</div>
          <p>모둠의 서로 다른 역할 근거 2개를 고르세요.</p>
          <div className="choice-grid">{view.evidenceRoles.map((role) => <button key={role.id} className={`choice${evidenceRoleIds.includes(role.id) ? " selected" : ""}`} onClick={() => setEvidenceRoleIds((current) => current.includes(role.id) ? current.filter((id) => id !== role.id) : current.length < 2 ? [...current, role.id] : current)}>{role.name}: {role.evidence[0]?.label}</button>)}</div>
          <p className="notice">다른 친구가 말한 역할 근거는 모둠에서 고른 뒤 이 화면에 함께 선택하세요.</p>
          {view.commonEvidence.length > 0 && (
            <div className="notice">
              <strong>빠진 관점을 보충하는 공통 자료</strong>
              {view.commonEvidence.map((item) => <p key={item.id}>{item.label}</p>)}
            </div>
          )}
          <p>{view.sharedPrompt.whyTogetherStem}…</p>
          <div className="choice-grid">{view.sharedPrompt.connections.map((item) => <button key={item.id} className={`choice${connectionId === item.id ? " selected" : ""}`} onClick={() => setConnectionId(item.id)}>{item.label}</button>)}</div>
          <p>이 자료만으로 알 수 없는 점을 고르세요.</p>
          <div className="choice-grid">{view.sharedPrompt.limitations.map((item) => <button key={item.id} className={`choice${limitationId === item.id ? " selected" : ""}`} onClick={() => setLimitationId(item.id)}>{item.label}</button>)}</div>
          <button className="button primary" onClick={saveSharedDraft} disabled={view.paused}>공동 초안 저장</button>
        </div>
      )}
      {view.stage === "confirm" && view.draft && (
        <div className="form">
          <p className="notice">
            공동 초안 revision {view.draft.revision} · 확인 {view.confirmation?.confirmed ?? 0}/{view.confirmation?.total ?? 0}. 새 초안이 저장되면 이전 확인은 취소됩니다.
          </p>
          {!editingDraft && (
            <button
              className="button ghost"
              onClick={() => {
                setPolicyIds(view.draft?.policyIds ?? []);
                setEvidenceRoleIds(view.draft?.evidenceRoleIds ?? []);
                setLimitationId(view.draft?.limitationId ?? "");
                setConnectionId(view.draft?.connectionId ?? "");
                setEditingDraft(true);
              }}
              disabled={view.paused}
            >초안 수정하기</button>
          )}
          <button className="button primary" onClick={confirmSharedDraft} disabled={view.paused || editingDraft || view.confirmedRevision === view.draft.revision}>이 revision 확인</button>
        </div>
      )}
      {view.stage === "finished" && view.draft && (
        <div className="notice">
          <strong>발표용 공동 문장</strong>
          <p>
            {view.sharedPrompt.policies.filter((item) => view.draft?.policyIds.includes(item.id)).map((item) => item.label).join(" + ")}가 필요합니다. {view.sharedPrompt.whyTogetherStem} {view.sharedPrompt.connections.find((item) => item.id === view.draft?.connectionId)?.label}. 다만 {view.sharedPrompt.limitations.find((item) => item.id === view.draft?.limitationId)?.label}.
          </p>
        </div>
      )}

      {error && <p className="notice error" role="alert">{error}</p>}
      {view.sessionStatus === "active" && view.stage !== "finished" && !["draft", "confirm"].includes(view.stage) && (
        <button className="button primary" onClick={goNext} disabled={view.paused}>{view.stage === "share" ? "설명했어요" : "이 단계 마치기"}</button>
      )}
      {view.sessionStatus === "active" && view.groupNumber && !view.helpRequested && <button className="button ghost" onClick={() => requestHelp({ sessionId: typedSessionId, token: stored.token }).catch(() => setError("도움 요청을 보내지 못했습니다."))} disabled={view.paused}>선생님께 도움 요청</button>}
    </section>
  );
}
