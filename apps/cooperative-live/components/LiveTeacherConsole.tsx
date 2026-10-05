"use client";

import { useMutation, useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";

import { convexApi } from "@/lib/convex-api";
import {
  clearCooperativeSessionStorage,
  teacherEntryKeyStorageKey,
} from "@/lib/runtime";
import {
  storeTeacherToken,
  useTeacherMutation,
  useTeacherToken,
} from "@/lib/teacher-auth";
import {
  PUBLIC_SCENARIOS,
  STAGE_LABELS,
  type InterventionKind,
} from "@/shared/scenario";

export function LiveTeacherConsole() {
  const teacherToken = useTeacherToken();
  const tokenValid = useQuery(
    convexApi.teacherAuth.check,
    teacherToken ? { teacherToken } : "skip",
  );
  const isAuthenticated = Boolean(teacherToken) && tokenValid === true;
  const loginTeacher = useMutation(convexApi.teacherAuth.login);
  const logoutTeacher = useMutation(convexApi.teacherAuth.logout);
  const [passcode, setPasscode] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scenarioId, setScenarioId] = useState("early-goryeo-unity");
  const [clock, setClock] = useState(0);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [previewWarningOpen, setPreviewWarningOpen] = useState(false);
  const [sendingIntervention, setSendingIntervention] = useState("");
  const qrTriggerRef = useRef<HTMLButtonElement>(null);
  const previewChoiceRef = useRef<HTMLButtonElement>(null);
  const createSession = useTeacherMutation(convexApi.sessions.create);
  const rotateEntryKey = useTeacherMutation(convexApi.sessions.rotateEntryKey);
  const seedStudents = useTeacherMutation(convexApi.sessions.seedSyntheticStudents);
  const previewGroups = useTeacherMutation(convexApi.sessions.previewGroups);
  const reshuffleGroups = useTeacherMutation(convexApi.sessions.reshuffleGroups);
  const confirmStart = useTeacherMutation(convexApi.sessions.confirmStart);
  const cancelPreview = useTeacherMutation(convexApi.sessions.cancelPreview);
  const endSession = useTeacherMutation(convexApi.sessions.end);
  const sendIntervention = useTeacherMutation(convexApi.interventions.send);
  const togglePause = useTeacherMutation(convexApi.sessions.togglePause);
  const advanceStage = useTeacherMutation(convexApi.sessions.advanceStage);
  const advanceGroupStage = useTeacherMutation(convexApi.sessions.advanceGroupStage);
  const setParticipantStatus = useTeacherMutation(convexApi.sessions.setParticipantStatus);
  const kickBeforeStart = useTeacherMutation(convexApi.sessions.kickBeforeStart);
  const issueRecoveryCode = useTeacherMutation(convexApi.sessions.issueRecoveryCode);
  const resolveHelp = useTeacherMutation(convexApi.sessions.resolveHelp);
  const currentSession = useQuery(
    convexApi.sessions.current,
    isAuthenticated ? { teacherToken } : "skip",
  );
  const sessionId = currentSession?._id ?? null;
  const dashboard = useQuery(
    convexApi.sessions.dashboard,
    isAuthenticated && sessionId ? { sessionId, teacherToken } : "skip",
  );

  const entryKeyStorageKey = sessionId ? teacherEntryKeyStorageKey(sessionId) : "";
  const subscribeEntryKey = useCallback((notify: () => void) => {
    window.addEventListener("cooperative-entry-key-change", notify);
    return () => window.removeEventListener("cooperative-entry-key-change", notify);
  }, []);
  const entryKey = useSyncExternalStore(
    subscribeEntryKey,
    () => entryKeyStorageKey ? sessionStorage.getItem(entryKeyStorageKey) ?? "" : "",
    () => "",
  );

  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
  const joinUrl = dashboard?.session.status === "lobby" && entryKey && origin
    ? `${origin}/join#entry=${entryKey}`
    : "";

  function rememberEntryKey(targetSessionId: string, nextEntryKey: string) {
    sessionStorage.setItem(teacherEntryKeyStorageKey(targetSessionId), nextEntryKey);
    window.dispatchEvent(new Event("cooperative-entry-key-change"));
  }

  function forgetEntryKey(targetSessionId: string) {
    sessionStorage.removeItem(teacherEntryKeyStorageKey(targetSessionId));
    window.dispatchEvent(new Event("cooperative-entry-key-change"));
  }

  const groups = useMemo(() => {
    const result = new Map<number, NonNullable<typeof dashboard>["players"]>();
    dashboard?.players.forEach((player) => {
      if (!player.groupNumber) return;
      result.set(player.groupNumber, [...(result.get(player.groupNumber) ?? []), player]);
    });
    return [...result.entries()].sort(([left], [right]) => left - right);
  }, [dashboard]);
  const allGroupsReady = Boolean(dashboard)
    && dashboard!.rooms.length > 0
    && dashboard!.rooms.every((room) => room.gate.ready)
    && new Set(dashboard!.rooms.map((room) => room.gate.stage)).size === 1;
  const lobbyPlayers = dashboard?.players.filter((player) => player.participationStatus === "active") ?? [];
  const unselectedPlayers = lobbyPlayers.filter((player) => !player.aliasSelected);
  const disconnectedPlayers = lobbyPlayers.filter((player) =>
    connectionLabel(player.lastSeenAt, player.connectionStatus) === "연결 끊김 가능"
  );

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!qrExpanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQrExpanded(false);
        qrTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [qrExpanded]);

  useEffect(() => {
    if (!previewWarningOpen) return;
    previewChoiceRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewWarningOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewWarningOpen]);

  function connectionLabel(
    lastSeenAt: number | undefined,
    initialStatus: "unknown" | "online" | "delayed" | "disconnected",
  ) {
    if (!clock) {
      return initialStatus === "online" ? "접속 중"
        : initialStatus === "delayed" ? "응답 지연"
          : initialStatus === "disconnected" ? "연결 끊김 가능"
            : "연결 확인 전";
    }
    if (!lastSeenAt) return "연결 확인 전";
    const age = clock - lastSeenAt;
    if (age <= 60_000) return "접속 중";
    if (age <= 180_000) return "응답 지연";
    return "연결 끊김 가능";
  }

  async function run(action: () => Promise<void>) {
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "요청을 처리하지 못했습니다.");
    }
  }

  async function makePreview(removeUnselectedIds: typeof unselectedPlayers[number]["id"][]) {
    if (!sessionId) return;
    setPreviewWarningOpen(false);
    await run(async () => {
      await previewGroups({ sessionId, removeUnselectedIds });
      forgetEntryKey(sessionId);
      setMessage(removeUnselectedIds.length
        ? `호 선택 중이던 ${removeUnselectedIds.length}자리를 정리하고 모둠 배정안을 만들었습니다.`
        : "모둠 배정안을 만들었습니다. 확인한 뒤 시작해 주세요.");
    });
  }

  async function kickPlayer(player: NonNullable<typeof dashboard>["players"][number]) {
    if (!sessionId || !window.confirm(`${player.alias} 자리를 내보낼까요? 학생 기기의 접속 정보가 무효가 됩니다.`)) return;
    await run(async () => {
      const result = await kickBeforeStart({ sessionId, playerId: player.id });
      if (result.entryKey) rememberEntryKey(sessionId, result.entryKey);
      setMessage(result.removed
        ? result.status === "lobby"
          ? `${player.alias} 자리를 정리했습니다. 입장 대기 중입니다.`
          : `${player.alias} 자리를 정리하고 남은 학생으로 모둠을 다시 섞었습니다.`
        : "이미 정리된 자리입니다.");
    });
  }

  // 만료되었거나 비밀번호가 바뀐 토큰은 지우고 다시 로그인하게 한다.
  useEffect(() => {
    if (teacherToken && tokenValid === false) storeTeacherToken(null);
  }, [teacherToken, tokenValid]);

  async function submitPasscode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      const result = await loginTeacher({ passcode });
      if (result.ok) {
        storeTeacherToken(result.token);
        setPasscode("");
      } else {
        setError(result.error);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인하지 못했습니다.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    const token = teacherToken;
    storeTeacherToken(null);
    if (token) await logoutTeacher({ teacherToken: token }).catch(() => undefined);
  }

  if (teacherToken && tokenValid === undefined) {
    return <div className="notice">교사 인증 상태를 확인하고 있습니다.</div>;
  }
  if (!isAuthenticated) {
    return (
      <section className="panel">
        <h2>교사 로그인</h2>
        <form className="actions" onSubmit={submitPasscode}>
          <label>
            교사 비밀번호
            <input
              type="password"
              autoComplete="current-password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              required
            />
          </label>
          <button className="button primary" type="submit" disabled={loggingIn || !passcode}>
            {loggingIn ? "확인 중…" : "로그인"}
          </button>
        </form>
        {error && <p className="notice error">{error}</p>}
      </section>
    );
  }

  if (currentSession === undefined) {
    return <div className="notice">진행 중인 활동을 확인하고 있습니다.</div>;
  }

  if (!sessionId) {
    return (
      <section className="panel">
        <h2>새 실시간 협동 활동</h2>
        <p>시나리오와 버전은 세션을 만들 때 고정됩니다.</p>
        <label className="label">활동 선택
          <select
            className="input"
            value={scenarioId}
            onChange={(event) => setScenarioId(event.target.value)}
          >
            {PUBLIC_SCENARIOS.map((scenario) => (
              <option
                key={`${scenario.id}:${scenario.version}`}
                value={scenario.id}
              >
                {scenario.publicMeta.title} · v{scenario.version}
              </option>
            ))}
          </select>
        </label>
        <div className="actions">
          <button
            className="button primary"
            onClick={() => run(async () => {
              const scenario = PUBLIC_SCENARIOS.find(
                (item) => item.id === scenarioId,
              )!;
              const created = await createSession({ scenarioId: scenario.id, scenarioVersion: scenario.version });
              if (created.entryKey) {
                rememberEntryKey(created.sessionId, created.entryKey);
              }
              setMessage(`활동 ${created.code}을 열었습니다. 가상 학생을 입장시켜 주세요.`);
            })}
          >
            활동 만들기
          </button>
          <button className="button ghost" onClick={() => void logout()}>
            로그아웃
          </button>
        </div>
        {message && <p className="notice">{message}</p>}
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
            <span className="badge">
              {dashboard.session.status === "lobby"
                ? "입장 대기"
                : dashboard.session.status === "preview"
                  ? "모둠 확인 중"
                  : "진행 중"}
            </span>
            <h2>수업 코드</h2>
            <div className="code">{dashboard.session.code}</div>
            <p><strong>{dashboard.session.scenario?.title}</strong></p>
            <p>
              {dashboard.players.filter((player) => player.participationStatus === "active").length}명 활성
              {dashboard.players.some((player) => player.participationStatus === "removed") && ` · ${dashboard.players.filter((player) => player.participationStatus === "removed").length}명 제외`}
            </p>
          </div>
          {dashboard.session.status === "lobby" && (
            joinUrl
              ? <div className="qr">
                  <QRCodeSVG value={joinUrl} size={152} level="M" />
                  <button
                    ref={qrTriggerRef}
                    className="button secondary"
                    onClick={() => setQrExpanded(true)}
                  >QR 크게 보기</button>
                </div>
              : <div className="notice">QR 입장키를 새로 만들어 주세요.</div>
          )}
        </div>
        {message && <p className="notice">{message}</p>}
        {error && <p className="notice error">{error}</p>}
        <div className="actions">
          {dashboard.session.status === "lobby" && (
            <>
              <button
                className="button ghost"
                onClick={() => run(async () => {
                  const credential = await rotateEntryKey({ sessionId });
                  rememberEntryKey(sessionId, credential.entryKey);
                  setMessage("15분 동안 사용할 새 QR 입장키를 만들었습니다.");
                })}
              >QR 새로 만들기</button>
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
                disabled={lobbyPlayers.filter((player) => player.aliasSelected).length < 3}
                onClick={() => {
                  if (unselectedPlayers.length || disconnectedPlayers.length) setPreviewWarningOpen(true);
                  else void makePreview([]);
                }}
              >모둠 미리보기</button>
            </>
          )}
          {dashboard.session.status === "preview" && (
            <>
              <button
                className="button secondary"
                onClick={() => run(async () => {
                  await reshuffleGroups({ sessionId });
                  setMessage("모둠을 다시 섞었습니다.");
                })}
              >다시 섞기</button>
              <button
                className="button primary"
                onClick={() => run(async () => {
                  await confirmStart({ sessionId });
                  setMessage("이 배정으로 활동을 시작했습니다.");
                })}
              >이 배정으로 시작</button>
              <button
                className="button ghost"
                onClick={() => run(async () => {
                  const credential = await cancelPreview({ sessionId });
                  rememberEntryKey(sessionId, credential.entryKey);
                  setMessage("입장 대기로 돌아가 새 QR 입장키를 만들었습니다.");
                })}
              >취소하고 대기로 돌아가기</button>
            </>
          )}
          {dashboard.session.status === "active" && (
            <>
              <button
                className="button secondary"
                onClick={() => run(async () => {
                  await togglePause({
                    sessionId,
                    paused: !dashboard.session.paused,
                  });
                  setMessage(
                    dashboard.session.paused
                      ? "활동을 다시 시작했습니다."
                      : "학생 입력을 잠시 멈췄습니다.",
                  );
                })}
              >
                {dashboard.session.paused ? "계속 진행" : "잠시 멈춤"}
              </button>
              <button
                className="button ghost"
                disabled={dashboard.session.paused || !allGroupsReady}
                onClick={() => run(async () => {
                  const result = await advanceStage({ sessionId });
                  setMessage(`전체 활동을 ${STAGE_LABELS[result.stage]} 단계로 진행했습니다.`);
                })}
              >
                전체 다음 단계
              </button>
              {!allGroupsReady && (
                <span className="notice">
                  모둠별 단계 또는 완료 조건이 달라 전체 진행할 수 없습니다.
                </span>
              )}
            </>
          )}
          <button
            className="button danger"
            onClick={() => run(async () => {
              const result = await endSession({ sessionId });
              clearCooperativeSessionStorage();
              window.dispatchEvent(new Event("cooperative-entry-key-change"));
              setMessage(`세션 데이터 ${result.deleted}건을 삭제했습니다.`);
            })}
          >활동 종료·삭제</button>
        </div>
      </section>

      {dashboard.session.status === "lobby" && (
        <section className="panel" aria-label="대기실 참가자">
          <h2>입장 대기실</h2>
          <p className="notice">
            호 선택 완료 {lobbyPlayers.filter((player) => player.aliasSelected).length}
            {` · 선택 중 ${unselectedPlayers.length} · 연결 끊김 ${disconnectedPlayers.length}`}
          </p>
          <p>학생의 호를 불러 실제 기기와 맞는지 확인한 뒤, 필요할 때 해당 카드를 눌러 자리를 정리하세요.</p>
          {lobbyPlayers.length === 0
            ? <p className="notice">아직 입장한 학생이 없습니다.</p>
            : <div className="lobby-players">
                {lobbyPlayers.map((player) => (
                  <button
                    key={player.id}
                    className="lobby-player-card"
                    type="button"
                    onClick={() => void kickPlayer(player)}
                    aria-label={`${player.alias}, ${connectionLabel(player.lastSeenAt, player.connectionStatus)}, 내보내기 확인`}
                  >
                    <strong>{player.alias}</strong>
                    <span>{connectionLabel(player.lastSeenAt, player.connectionStatus)}</span>
                    <small>입장 {new Date(player.joinedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</small>
                  </button>
                ))}
              </div>}
        </section>
      )}

      {previewWarningOpen && dashboard.session.status === "lobby" && (
        <div className="qr-modal-backdrop" role="presentation">
          <div className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="preview-warning-title">
            <h2 id="preview-warning-title">모둠 편성 전 참가자를 확인해 주세요</h2>
            {unselectedPlayers.length > 0 && (
              <p>호 선택 중 {unselectedPlayers.length}자리는 그대로 진행하면 내보내고 편성에서 제외합니다.</p>
            )}
            {disconnectedPlayers.length > 0 && (
              <p>연결 끊김 가능 {disconnectedPlayers.length}자리는 호를 골랐다면 편성에 남습니다. 학생 기기를 확인해 주세요.</p>
            )}
            <ul className="player-list">
              {[...new Map([...unselectedPlayers, ...disconnectedPlayers].map((player) => [player.id, player])).values()].map((player) => (
                <li className="player-row" key={player.id}>
                  <strong>{player.alias}</strong>
                  <small>{connectionLabel(player.lastSeenAt, player.connectionStatus)}</small>
                </li>
              ))}
            </ul>
            <div className="actions">
              <button ref={previewChoiceRef} className="button secondary" onClick={() => setPreviewWarningOpen(false)}>정리하고 오기</button>
              <button className="button primary" onClick={() => void makePreview(unselectedPlayers.map((player) => player.id))}>그대로 진행</button>
            </div>
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <section className="rooms">
          {groups.map(([groupNumber, players]) => (
            <article className="room-card" key={groupNumber}>
              <header><h2>{groupNumber}모둠</h2><span className="badge">{players.length}명</span></header>
              <ul className="player-list">
                {players.map((player) => {
                  return (
                    <li className="player-row" key={player.id}>
                      <strong>{player.alias}</strong>
                      {dashboard.session.status === "preview" ? (
                        <small>학생 화면에는 아직 모둠·역할이 공개되지 않습니다.</small>
                      ) : (
                        <small>
                          {player.roleIcon} {player.roleName} · {STAGE_LABELS[player.stage]}
                          {` · ${player.participationStatus === "removed" ? "제외됨" : connectionLabel(player.lastSeenAt, player.connectionStatus)}`}
                        </small>
                      )}
                      {dashboard.session.status === "preview" && (
                        <button className="button ghost" onClick={() => void kickPlayer(player)}>내보내기</button>
                      )}
                      {dashboard.session.status === "active" && !player.isSynthetic && (
                        <div className="actions">
                          <button
                            className="button ghost"
                            onClick={() => run(async () => {
                              const next = player.participationStatus === "removed" ? "active" : "removed";
                              if (next === "removed" && !window.confirm(`${player.alias} 학생을 관문 인원에서 제외할까요?`)) return;
                              await setParticipantStatus({ sessionId, playerId: player.id, status: next });
                              setMessage(`${player.alias} 학생을 ${next === "removed" ? "제외했습니다" : "복원했습니다"}.`);
                            })}
                          >{player.participationStatus === "removed" ? "제외 취소" : "참가자 제외"}</button>
                          <button
                            className="button secondary"
                            onClick={() => run(async () => {
                              const result = await issueRecoveryCode({ sessionId, playerId: player.id });
                              setMessage(`${player.alias} 재연결 코드: ${result.recoveryCode} (5분)`);
                            })}
                          >자리 다시 연결</button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {dashboard.session.status === "active" && (
                <div className="actions">
                  <span className="badge">
                    완료 {dashboard.rooms.find((room) => room.groupNumber === groupNumber)?.completed ?? 0}/{dashboard.rooms.find((room) => room.groupNumber === groupNumber)?.total ?? players.length}
                  </span>
                  {(() => {
                    const room = dashboard.rooms.find((item) => item.groupNumber === groupNumber);
                    return room ? (
                      <>
                        <button
                          className="button primary"
                          disabled={dashboard.session.paused || !room.gate.ready}
                          onClick={() => run(async () => {
                            const result = await advanceGroupStage({ sessionId, groupNumber });
                            setMessage(`${groupNumber}모둠을 ${STAGE_LABELS[result.stage]} 단계로 진행했습니다.`);
                          })}
                        >이 모둠 다음 단계</button>
                        {!room.gate.ready && <span className="notice">{room.gate.reason}</span>}
                      </>
                    ) : null;
                  })()}
                  {(() => {
                    const latest = dashboard.rooms.find((item) => item.groupNumber === groupNumber)?.latestIntervention;
                    return latest ? (
                      <span className="notice">
                        최근 개입: {latest.kind === "hint" ? "힌트" : "심화 상황"}
                        {` · ${new Date(latest.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
                        {` · 확인 ${latest.acknowledged}/${latest.total}`}
                      </span>
                    ) : null;
                  })()}
                  {dashboard.rooms.find((room) => room.groupNumber === groupNumber)?.revision && (
                    <span className="badge">
                      확인 {dashboard.rooms.find((room) => room.groupNumber === groupNumber)?.confirmed ?? 0}/{dashboard.rooms.find((room) => room.groupNumber === groupNumber)?.total ?? players.length}
                    </span>
                  )}
                  {dashboard.helpRequests.some((request) => request.groupNumber === groupNumber && !request.resolvedAt) && <button className="button primary" onClick={() => run(async () => { await resolveHelp({ sessionId, groupNumber }); setMessage(`${groupNumber}모둠 도움 요청을 확인했습니다.`); })}>도움 요청 확인</button>}
                  {(["hint", "deepen"] as InterventionKind[]).map((kind) => (
                    <button
                      key={kind}
                      className={kind === "hint" ? "button secondary" : "button ghost"}
                      disabled={sendingIntervention === `${groupNumber}:${kind}`}
                      onClick={() => run(async () => {
                        const latest = dashboard.rooms.find((item) => item.groupNumber === groupNumber)?.latestIntervention;
                        if (latest?.kind === kind && !window.confirm("같은 종류의 개입을 다시 보낼까요?")) return;
                        setSendingIntervention(`${groupNumber}:${kind}`);
                        try {
                          await sendIntervention({ sessionId, groupNumber, kind });
                          setMessage(`${groupNumber}모둠에 ${kind === "hint" ? "힌트" : "심화 상황"}을 보냈습니다.`);
                        } finally {
                          setSendingIntervention("");
                        }
                      })}
                    >{sendingIntervention === `${groupNumber}:${kind}` ? "전송 중…" : kind === "hint" ? "힌트" : "심화 상황"}</button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
      {qrExpanded && joinUrl && (
        <div
          className="qr-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setQrExpanded(false);
              qrTriggerRef.current?.focus();
            }
          }}
        >
          <section className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
            <button
              className="button ghost qr-modal-close"
              autoFocus
              onClick={() => {
                setQrExpanded(false);
                qrTriggerRef.current?.focus();
              }}
            >닫기</button>
            <h2 id="qr-modal-title">{dashboard.session.scenario?.title}</h2>
            <div className="qr-large"><QRCodeSVG value={joinUrl} size={360} level="M" /></div>
            <div className="code">{dashboard.session.code}</div>
            <p>QR을 읽지 못하면 입장 화면에서 위 여섯 자리 코드를 입력하세요.</p>
          </section>
        </div>
      )}
    </>
  );
}
