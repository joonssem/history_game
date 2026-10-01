"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import type { GenericId } from "convex/values";

import { convexApi, type Dashboard } from "@/lib/convex-api";
import { STAGE_LABELS, STUDENT_STAGE_ORDER, type Stage } from "@/shared/scenario";
import { TEACHER_PROGRESS_REASONS, type TeacherProgressReason } from "@/shared/teacher-recovery";

type Preview = { kind: "advance" | "recovery"; stage: Stage; revision?: number; total: number };

export function TeacherGroupControls({ sessionId, room, paused, helpRequested }: {
  sessionId: GenericId<"sessions">;
  room: Dashboard["rooms"][number];
  paused: boolean;
  helpRequested: boolean;
}) {
  const act = useMutation(convexApi.sessions.teacherGroupAction);
  const resolveHelp = useMutation(convexApi.sessions.resolveHelp);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [reason, setReason] = useState<TeacherProgressReason | "">("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const advanceRef = useRef<HTMLButtonElement>(null);
  const recoveryRef = useRef<HTMLButtonElement>(null);
  const stage = room.gate.stage;
  const nextStage = STUDENT_STAGE_ORDER[STUDENT_STAGE_ORDER.indexOf(stage) + 1];
  const cannotAdvance = paused || busy || room.total === 0 || !nextStage
    || (room.total < 3 && !room.recoveryEnabled)
    || (["draft", "confirm"].includes(stage) && !room.revision);

  function open(kind: Preview["kind"]) {
    setPreview({ kind, stage, revision: room.revision, total: room.total });
    setReason(""); setAgreed(false); setError(""); setMessage("");
  }

  function close() {
    const ref = preview?.kind === "recovery" ? recoveryRef : advanceRef;
    setPreview(null);
    ref.current?.focus();
  }

  return (
    <div className="form">
      <strong>현재 단계: {STAGE_LABELS[stage]}</strong>
      <p className="notice">
        최초 판단 {room.firstCompleted}/{room.total} · 자료 설명 {room.sharedCompleted}/{room.total}
        {` · 초안 ${room.revision ? `v${room.revision}` : "없음"} · 확인 ${room.confirmed}/${room.total}`}
        {` · 개인 완료 ${room.completed}/${room.total}`}
      </p>
      {!room.gate.ready && <p className="notice">{room.gate.reason}</p>}
      {room.recoveryEnabled && <p className="notice">부족 인원 복구 모드 · 빠진 원래 역할은 근거 요약으로 보충합니다.</p>}
      {room.teacherFinishedAt && <p className="notice">교사 진행으로 마침 단계에 도달했습니다. 개인 미완료 기록은 유지됩니다.</p>}
      {helpRequested && <p className="notice" role="status">도움 요청이 있습니다. 아래 힌트 또는 교사 진행으로 대응한 뒤 해결 완료를 표시하세요.</p>}
      <div className="actions">
        <button ref={advanceRef} className="button secondary" disabled={cannotAdvance} onClick={() => open("advance")}>
          교사 한 단계 진행
        </button>
        {!room.recoveryEnabled && stage !== "finished" && (
          <button ref={recoveryRef} className="button ghost" disabled={paused || busy || room.total === 0} onClick={() => open("recovery")}>
            부족 인원 복구 모드
          </button>
        )}
        {helpRequested && <button className="button ghost" disabled={busy || paused} onClick={async () => {
          setBusy(true); setError("");
          try { await resolveHelp({ sessionId, groupNumber: room.groupNumber }); setMessage("도움 요청을 해결 완료로 표시했습니다."); }
          catch { setError("도움 요청 처리를 저장하지 못했습니다."); }
          finally { setBusy(false); }
        }}>도움 요청 해결 완료</button>}
      </div>
      {preview && <form className="form" onSubmit={async (event) => {
        event.preventDefault();
        if (!reason || !agreed || busy) return;
        setBusy(true); setError("");
        try {
          const result = await act({ sessionId, groupNumber: room.groupNumber, kind: preview.kind,
            expectedStage: preview.stage, expectedRevision: preview.revision, reason, studentsAgreed: agreed });
          setMessage(preview.kind === "recovery" ? "부족 인원 복구 모드를 켰습니다. 접속하지 못한 자리는 참가자 제외로 정리하세요."
            : `${room.groupNumber}모둠을 ${STAGE_LABELS[result.stage]} 단계로 진행했습니다.`);
          close();
        } catch (caught) { setError(caught instanceof Error ? caught.message : "교사 진행을 저장하지 못했습니다."); }
        finally { setBusy(false); }
      }}>
        <strong>{room.groupNumber}모둠 · {preview.total}명 · {STAGE_LABELS[preview.stage]}</strong>
        <p>{preview.kind === "recovery"
          ? "1~2명만 남아도 활동을 이어가고, 빠진 원래 역할의 근거 요약을 공동 자료로 제공합니다. 학생 0명은 진행할 수 없습니다."
          : `${STAGE_LABELS[STUDENT_STAGE_ORDER[STUDENT_STAGE_ORDER.indexOf(preview.stage) + 1]]} 단계로 한 번만 이동합니다. 개인 판단·설명·초안 동의는 대신 완료하지 않습니다.`}</p>
        <label className="label">진행 사유
          <select className="input" value={reason} autoFocus required disabled={busy}
            onChange={(event) => setReason(event.target.value as TeacherProgressReason | "")}>
            <option value="">사유를 선택하세요</option>
            {Object.entries(TEACHER_PROGRESS_REASONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="label"><span><input type="checkbox" checked={agreed} disabled={busy}
          onChange={(event) => setAgreed(event.target.checked)} /> 현재 학생들과 내용을 확인하고 진행 동의를 받았습니다.</span></label>
        <div className="actions">
          <button className="button primary" disabled={busy || paused || !reason || !agreed}>{busy ? "처리 중…" : "확인하고 실행"}</button>
          <button className="button ghost" type="button" disabled={busy} onClick={close}>취소</button>
        </div>
      </form>}
      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="notice error" role="alert">{error} 확인 창을 닫고 현재 모둠 상태를 다시 확인하세요.</p>}
      {room.teacherActions.length > 0 && <details>
        <summary>최근 교사 진행 이력</summary>
        <ul>{room.teacherActions.map((action, index) => <li key={`${action.createdAt}:${index}`}>
          {new Date(action.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
          {` · ${action.kind === "recovery" ? "복구 모드" : `${STAGE_LABELS[action.fromStage]} → ${STAGE_LABELS[action.toStage]}`} · ${TEACHER_PROGRESS_REASONS[action.reason]}`}
        </li>)}</ul>
      </details>}
    </div>
  );
}
