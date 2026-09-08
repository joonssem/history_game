"use client";

import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { clearCooperativeSessionStorage } from "@/lib/runtime";
import {
  INTERVENTIONS,
  SCENARIO_TITLE,
  STAGE_LABELS,
  STUDENT_STAGE_ORDER,
  assignGroups,
  nextStudentStage,
  pickUniqueAliases,
  roleById,
  type InterventionKind,
  type Stage,
} from "@/shared/scenario";

type DemoStudent = {
  key: string;
  alias: string;
  groupNumber?: number;
  roleId?: string;
  stage: Stage;
};

type DemoStatus = "empty" | "lobby" | "preview" | "active" | "ended";

export function DemoTeacherConsole() {
  const [status, setStatus] = useState<DemoStatus>("empty");
  const [students, setStudents] = useState<DemoStudent[]>([]);
  const [interventions, setInterventions] = useState<
    Partial<Record<number, InterventionKind>>
  >({});
  const [deletedCount, setDeletedCount] = useState(0);

  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "https://example.invalid",
  );
  const joinUrl = `${origin}/join?code=260907`;

  const rooms = useMemo(() => {
    const grouped = new Map<number, DemoStudent[]>();
    students.forEach((student) => {
      if (!student.groupNumber) return;
      grouped.set(student.groupNumber, [
        ...(grouped.get(student.groupNumber) ?? []),
        student,
      ]);
    });
    return [...grouped.entries()].sort(([left], [right]) => left - right);
  }, [students]);

  function createSession() {
    setStatus("lobby");
    setStudents([]);
    setInterventions({});
    setDeletedCount(0);
  }

  function seedStudents() {
    const aliases = pickUniqueAliases(8);
    setStudents(
      aliases.map((alias, index) => ({
        key: `fake-${index + 1}`,
        alias,
        stage: "lobby",
      })),
    );
  }

  function previewGroups() {
    const assignments = assignGroups(
      students.map((student) => student.key),
      4,
    );
    const byStudent = new Map(
      assignments.map((assignment) => [assignment.participantKey, assignment]),
    );
    setStudents((current) =>
      current.map((student) => {
        const assignment = byStudent.get(student.key);
        return {
          ...student,
          groupNumber: assignment?.groupNumber,
          roleId: assignment?.roleId,
        };
      }),
    );
    setStatus("preview");
  }

  function reshuffleGroups() {
    previewGroups();
  }

  function confirmStart() {
    setStudents((current) =>
      current.map((student) => ({ ...student, stage: "role" })),
    );
    setStatus("active");
  }

  function cancelPreview() {
    setStudents((current) =>
      current.map((student) => ({
        key: student.key,
        alias: student.alias,
        stage: student.stage,
      })),
    );
    setStatus("lobby");
  }

  function advanceStudent(key: string) {
    setStudents((current) =>
      current.map((student) =>
        student.key === key
          ? { ...student, stage: nextStudentStage(student.stage) }
          : student,
      ),
    );
  }

  function sendIntervention(groupNumber: number, kind: InterventionKind) {
    setInterventions((current) => ({ ...current, [groupNumber]: kind }));
  }

  function endSession() {
    setDeletedCount(students.length + rooms.length + Object.keys(interventions).length + 1);
    setStudents([]);
    setInterventions({});
    setStatus("ended");
    clearCooperativeSessionStorage();
  }

  return (
    <>
      <div className="mode-banner" role="status">
        <strong>가상 데이터 모드</strong> — Convex와 Auth0 계정을 연결하기 전에 학생 8명의
        전체 흐름을 점검합니다. 실제 학생 정보는 사용하지 않습니다.
      </div>

      {status === "empty" && (
        <section className="panel">
          <p className="eyebrow" style={{ color: "#92400e" }}>첫 수직 슬라이스</p>
          <h2>{SCENARIO_TITLE}</h2>
          <p>교사 1명, 가상 학생 8명, 4인 모둠 2개로 시작합니다.</p>
          <button className="button primary" onClick={createSession}>새 활동 만들기</button>
        </section>
      )}

      {status === "lobby" && (
        <section className="panel">
          <div className="session-head">
            <div>
              <span className="badge">입장 대기</span>
              <h2>수업 코드</h2>
              <div className="code" aria-label="수업 코드 260907">260907</div>
              <p>{students.length} / 8명 입장</p>
            </div>
            <div className="qr" aria-label="가상 수업 입장 QR">
              <QRCodeSVG value={joinUrl} size={152} level="M" />
            </div>
          </div>
          <div className="actions">
            <button className="button secondary" onClick={seedStudents} disabled={students.length > 0}>
              가상 학생 8명 입장
            </button>
            <button className="button primary" onClick={previewGroups} disabled={students.length !== 8}>
              모둠 미리보기
            </button>
          </div>
          {students.length > 0 && (
            <ul className="player-list" aria-label="대기 학생">
              {students.map((student) => <li key={student.key}>{student.alias}</li>)}
            </ul>
          )}
        </section>
      )}

      {status === "preview" && (
        <>
          <section className="panel">
            <div className="topbar">
              <div>
                <span className="badge">모둠 확인 중</span>
                <h2>배정 결과를 확인해 주세요</h2>
                <p>학생 화면에는 확정 전까지 모둠과 역할이 보이지 않습니다.</p>
              </div>
            </div>
            <div className="actions">
              <button className="button secondary" onClick={reshuffleGroups}>다시 섞기</button>
              <button className="button primary" onClick={confirmStart}>이 배정으로 시작</button>
              <button className="button ghost" onClick={cancelPreview}>취소하고 대기로 돌아가기</button>
            </div>
          </section>
          <section className="rooms" aria-label="모둠 배정 미리보기">
            {rooms.map(([groupNumber, groupStudents]) => (
              <article className="room-card" key={groupNumber}>
                <header>
                  <h2>{groupNumber}모둠</h2>
                  <span className="badge">{groupStudents.length}명</span>
                </header>
                <ul className="player-list">
                  {groupStudents.map((student) => (
                    <li className="player-row" key={student.key}>
                      <strong>{student.alias}</strong>
                      <small>학생에게는 아직 비공개</small>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </>
      )}

      {status === "active" && (
        <>
          <section className="panel">
            <div className="topbar">
              <div>
                <span className="badge">진행 중</span>
                <h2>{SCENARIO_TITLE}</h2>
                <p>개인 답은 보이지 않고 호·모둠·역할·진행 단계만 표시됩니다.</p>
              </div>
              <button className="button danger" onClick={endSession}>활동 종료·삭제</button>
            </div>
            <div className="stats">
              <div className="stat">참여 학생<strong>{students.length}명</strong></div>
              <div className="stat">모둠<strong>{rooms.length}개</strong></div>
              <div className="stat">완료<strong>{students.filter((item) => item.stage === "finished").length}명</strong></div>
            </div>
          </section>
          <section className="rooms" aria-label="모둠별 진행 상태">
            {rooms.map(([groupNumber, groupStudents]) => {
              const intervention = interventions[groupNumber];
              return (
                <article className="room-card" key={groupNumber}>
                  <header>
                    <h2>{groupNumber}모둠</h2>
                    <span className="badge">
                      {Math.min(...groupStudents.map((student) => STUDENT_STAGE_ORDER.indexOf(student.stage))) + 1}단계
                    </span>
                  </header>
                  {intervention && (
                    <div className="intervention">
                      <strong>{intervention === "hint" ? "힌트" : "심화 상황"}</strong><br />
                      {INTERVENTIONS[intervention]}
                    </div>
                  )}
                  <ul className="player-list">
                    {groupStudents.map((student) => {
                      const role = roleById(student.roleId);
                      return (
                        <li className="player-row" key={student.key}>
                          <strong>{student.alias}</strong>
                          <small>{role?.icon} {role?.name} · {STAGE_LABELS[student.stage]}</small>
                          <button
                            className="button ghost"
                            onClick={() => advanceStudent(student.key)}
                            disabled={student.stage === "finished"}
                          >
                            다음 단계
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="actions">
                    <button className="button secondary" onClick={() => sendIntervention(groupNumber, "hint")}>힌트</button>
                    <button className="button ghost" onClick={() => sendIntervention(groupNumber, "deepen")}>심화 상황</button>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      {status === "ended" && (
        <section className="panel">
          <h2>활동을 종료했습니다</h2>
          <p className="deleted">가상 세션 관련 데이터 {deletedCount}건을 삭제했습니다.</p>
          <p>다음 협동 MUD에서는 새 호와 새 모둠으로 다시 시작합니다.</p>
          <button className="button primary" onClick={createSession}>새 활동 만들기</button>
        </section>
      )}
    </>
  );
}
