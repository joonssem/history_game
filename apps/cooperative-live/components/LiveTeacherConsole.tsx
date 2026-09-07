"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { GenericId as Id } from "convex/values";

import { convexApi } from "@/lib/convex-api";
import { roleById, STAGE_LABELS, type InterventionKind } from "@/shared/scenario";

export function LiveTeacherConsole() {
  const { loginWithRedirect, logout } = useAuth0();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const createSession = useMutation(convexApi.sessions.create);
  const seedStudents = useMutation(convexApi.sessions.seedSyntheticStudents);
  const startSession = useMutation(convexApi.sessions.start);
  const endSession = useMutation(convexApi.sessions.end);
  const sendIntervention = useMutation(convexApi.interventions.send);
  const dashboard = useQuery(
    convexApi.sessions.dashboard,
    sessionId ? { sessionId } : "skip",
  );

  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
  const joinUrl = dashboard?.session.code && origin
    ? `${origin}/join?code=${dashboard.session.code}`
    : "";

  const groups = useMemo(() => {
    const result = new Map<number, NonNullable<typeof dashboard>["players"]>();
    dashboard?.players.forEach((player) => {
      if (!player.groupNumber) return;
      result.set(player.groupNumber, [...(result.get(player.groupNumber) ?? []), player]);
    });
    return [...result.entries()].sort(([left], [right]) => left - right);
  }, [dashboard]);

  async function run(action: () => Promise<void>) {
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "요청을 처리하지 못했습니다.");
    }
  }

  if (isLoading) return <div className="notice">교사 인증 상태를 확인하고 있습니다.</div>;
  if (!isAuthenticated) {
    return (
      <section className="panel">
        <h2>교사 로그인이 필요합니다</h2>
        <p>Auth0에 연결한 Google 계정과 서버 허용목록을 모두 통과해야 합니다.</p>
        <button className="button primary" onClick={() => loginWithRedirect()}>
          Google 계정으로 로그인
        </button>
      </section>
    );
  }

  if (!sessionId) {
    return (
      <section className="panel">
        <h2>새 고조선 활동</h2>
        <p>실제 Convex 개발 배포에 가상 학생 8명 세션을 만듭니다.</p>
        <div className="actions">
          <button
            className="button primary"
            onClick={() => run(async () => {
              const created = await createSession({});
              setSessionId(created.sessionId);
              setMessage("활동을 만들었습니다. 가상 학생을 입장시켜 주세요.");
            })}
          >
            활동 만들기
          </button>
          <button className="button ghost" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            로그아웃
          </button>
        </div>
        {error && <p className="notice error">{error}</p>}
      </section>
    );
  }

  if (dashboard === undefined) return <div className="notice">실시간 상태를 불러오는 중입니다.</div>;

  return (
    <>
      <section className="panel">
        <div className="session-head">
          <div>
            <span className="badge">{dashboard.session.status === "lobby" ? "입장 대기" : "진행 중"}</span>
            <h2>수업 코드</h2>
            <div className="code">{dashboard.session.code}</div>
            <p>{dashboard.players.length}명 접속</p>
          </div>
          {joinUrl && <div className="qr"><QRCodeSVG value={joinUrl} size={152} /></div>}
        </div>
        {message && <p className="notice">{message}</p>}
        {error && <p className="notice error">{error}</p>}
        <div className="actions">
          {dashboard.session.status === "lobby" && (
            <>
              <button
                className="button secondary"
                disabled={dashboard.players.length > 0}
                onClick={() => run(async () => {
                  await seedStudents({ sessionId, count: 8 });
                  setMessage("가상 학생 8명이 입장했습니다.");
                })}
              >가상 학생 8명 입장</button>
              <button
                className="button primary"
                disabled={dashboard.players.length < 3}
                onClick={() => run(async () => {
                  await startSession({ sessionId });
                  setMessage("무작위 편성과 역할 배정을 마쳤습니다.");
                })}
              >무작위 편성 후 시작</button>
            </>
          )}
          <button
            className="button danger"
            onClick={() => run(async () => {
              const result = await endSession({ sessionId });
              setSessionId(null);
              setMessage(`세션 데이터 ${result.deleted}건을 삭제했습니다.`);
            })}
          >활동 종료·삭제</button>
        </div>
      </section>

      {groups.length > 0 && (
        <section className="rooms">
          {groups.map(([groupNumber, players]) => (
            <article className="room-card" key={groupNumber}>
              <header><h2>{groupNumber}모둠</h2><span className="badge">{players.length}명</span></header>
              <ul className="player-list">
                {players.map((player) => {
                  const role = roleById(player.roleId);
                  return (
                    <li className="player-row" key={player.id}>
                      <strong>{player.alias}</strong>
                      <small>{role?.icon} {role?.name} · {STAGE_LABELS[player.stage]}</small>
                    </li>
                  );
                })}
              </ul>
              <div className="actions">
                {(["hint", "deepen"] as InterventionKind[]).map((kind) => (
                  <button
                    key={kind}
                    className={kind === "hint" ? "button secondary" : "button ghost"}
                    onClick={() => run(async () => {
                      await sendIntervention({ sessionId, groupNumber, kind });
                      setMessage(`${groupNumber}모둠에 ${kind === "hint" ? "힌트" : "심화 상황"}을 보냈습니다.`);
                    })}
                  >{kind === "hint" ? "힌트" : "심화 상황"}</button>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
