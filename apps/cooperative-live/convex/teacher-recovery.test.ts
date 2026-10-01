import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { convexApi } from "../lib/convex-api";
import { ALIASES } from "../shared/scenario";
import { createOpaqueToken } from "../shared/join-security";
import schema from "./schema";
import { modules } from "./test.setup";
import { getScenario } from "./scenarios";

const OWNER = "auth0|teacher-recovery-test";

async function classroom(count = 3, scenarioId = "early-goryeo-unity") {
  process.env.TEACHER_AUTH0_SUBS = `${OWNER},auth0|other-recovery-teacher`;
  process.env.JOIN_ATTEMPT_HMAC_SECRET = "teacher-recovery-test-secret-32-characters";
  const backend = convexTest(schema, modules);
  const teacher = backend.withIdentity({ subject: OWNER });
  const created = await teacher.mutation(convexApi.sessions.create, { scenarioId, scenarioVersion: 1 });
  const students = await Promise.all(Array.from({ length: count }, () =>
    backend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey!, studentToken: createOpaqueToken() })));
  await Promise.all(students.map((student, index) => backend.mutation(convexApi.students.selectAlias, {
    sessionId: created.sessionId, token: student.token, alias: ALIASES[index],
  })));
  await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
  await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
  const dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
  return { backend, teacher, created, students, dashboard };
}

describe("교사 모둠 진행·부족 인원 복구", () => {
  it("중복 교사 요청은 한 단계만 옮기고 개인 완료값·다른 모둠을 보존한다", async () => {
    const { backend, teacher, created, dashboard } = await classroom(8);
    const args = { sessionId: created.sessionId, groupNumber: 1, kind: "advance" as const,
      expectedStage: "role" as const, reason: "discussion" as const, studentsAgreed: true };
    const results = await Promise.allSettled([
      teacher.mutation(convexApi.sessions.teacherGroupAction, args),
      teacher.mutation(convexApi.sessions.teacherGroupAction, args),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const first = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(first.rooms.find((room) => room.groupNumber === 1)?.gate.stage).toBe("first");
    expect(first.players.filter((player) => player.groupNumber === 2)).toEqual(dashboard.players.filter((player) => player.groupNumber === 2));
    await teacher.mutation(convexApi.sessions.teacherGroupAction, { ...args, expectedStage: "first" });
    const moved = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(moved.players.filter((player) => player.groupNumber === 1).every((player) =>
      player.stage === "share" && !player.submittedAt && !player.sharedAt && player.confirmedRevision === undefined)).toBe(true);
    const actions = await backend.run((ctx) => ctx.db.query("teacherActions").collect());
    expect(actions).toHaveLength(2);
    expect(Object.keys(actions[0]).sort()).toEqual(["_creationTime", "_id", "createdAt", "fromStage", "groupNumber", "kind", "reason", "sessionId", "toStage"].sort());
    await teacher.mutation(convexApi.sessions.end, { sessionId: created.sessionId });
    expect(await backend.run((ctx) => ctx.db.query("teacherActions").collect())).toHaveLength(0);
  });

  it("교사 공유 진행은 근거 요약만 열고 초안·최신 revision 없이 마무리하지 않는다", async () => {
    const { backend, teacher, created, students } = await classroom();
    for (const expectedStage of ["role", "first", "share"] as const) {
      await teacher.mutation(convexApi.sessions.teacherGroupAction, { sessionId: created.sessionId, groupNumber: 1,
        kind: "advance", expectedStage, reason: "classroom", studentsAgreed: true });
    }
    const view = await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: students[0].token });
    expect(view?.evidenceRoles).toHaveLength(3);
    expect(view?.firstSubmitted).toBe(false);
    expect(view?.sharedAt).toBe(false);
    expect(JSON.stringify(view?.evidenceRoles)).not.toMatch(/privateInfo|interest|firstChoices/);
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, { sessionId: created.sessionId, groupNumber: 1,
      kind: "advance", expectedStage: "draft", reason: "classroom", studentsAgreed: true })).rejects.toThrow("최신");
    const draft = await backend.mutation(convexApi.students.saveDraft, { sessionId: created.sessionId, token: students[0].token,
      policyIds: view!.sharedPrompt.policies.slice(0, 2).map((item) => item.id),
      evidenceRoleIds: view!.evidenceRoles.slice(0, 2).map((role) => role.id),
      limitationId: view!.sharedPrompt.limitations[0].id, connectionId: view!.sharedPrompt.connections[0].id, expectedRevision: 0 });
    const finish = { sessionId: created.sessionId, groupNumber: 1, kind: "advance" as const, expectedStage: "confirm" as const,
      reason: "classroom" as const, studentsAgreed: true };
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, { ...finish, expectedRevision: 0 })).rejects.toThrow("최신");
    await teacher.mutation(convexApi.sessions.teacherGroupAction, { ...finish, expectedRevision: draft.revision });
    const result = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(result.rooms[0]).toMatchObject({ stage: "finished", completed: 0, confirmed: 0 });
    expect(result.players.every((player) => !player.submittedAt && !player.sharedAt && player.confirmedRevision === undefined)).toBe(true);
    const finished = await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: students[0].token });
    expect(finished?.teacherFinished).toBe(true);
    expect(finished?.draft?.revision).toBe(draft.revision);
  });

  it("미동의·잘못된 사유·다른 교사·없는 모둠·일시정지·종료 요청을 거부한다", async () => {
    const { backend, teacher, created } = await classroom();
    const args = { sessionId: created.sessionId, groupNumber: 1, kind: "advance" as const,
      expectedStage: "role" as const, reason: "connection" as const, studentsAgreed: true };
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, { ...args, studentsAgreed: false })).rejects.toThrow("동의");
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, { ...args, reason: "unknown" as never })).rejects.toThrow();
    await expect(backend.mutation(convexApi.sessions.teacherGroupAction, args)).rejects.toThrow();
    const otherTeacher = backend.withIdentity({ subject: "auth0|other-recovery-teacher" });
    await expect(otherTeacher.mutation(convexApi.sessions.teacherGroupAction, args)).rejects.toThrow();
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, { ...args, groupNumber: 99 })).rejects.toThrow();
    await teacher.mutation(convexApi.sessions.togglePause, { sessionId: created.sessionId, paused: true });
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, args)).rejects.toThrow("멈추지 않은");
    await teacher.mutation(convexApi.sessions.end, { sessionId: created.sessionId });
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, args)).rejects.toThrow();
  });

  it("학생 단계가 섞여도 뒤처진 학생만 한 단계 옮기고 오래된 요청을 거부한다", async () => {
    const { backend, teacher, created, students } = await classroom();
    await backend.mutation(convexApi.students.advance, { sessionId: created.sessionId, token: students[0].token });
    const args = { sessionId: created.sessionId, groupNumber: 1, kind: "advance" as const,
      expectedStage: "role" as const, reason: "discussion" as const, studentsAgreed: true };
    await teacher.mutation(convexApi.sessions.teacherGroupAction, args);
    const result = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(result.players.every((player) => player.stage === "first")).toBe(true);
    await expect(teacher.mutation(convexApi.sessions.teacherGroupAction, args)).rejects.toThrow("단계가 바뀌었");
  });

  it("복구 승인 전 부족 인원은 학생·모둠·전체 진행을 모두 차단한다", async () => {
    const { backend, teacher, created, students, dashboard } = await classroom();
    // Simulate a legacy group already reduced outside the new teacher recovery policy.
    await backend.run((ctx) => ctx.db.patch(dashboard.players[2].id, { participationStatus: "removed" }));
    const result = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(result.rooms[0].gate.ready).toBe(false);
    await expect(teacher.mutation(convexApi.sessions.advanceStage, { sessionId: created.sessionId })).rejects.toThrow("복구 모드");
    await expect(teacher.mutation(convexApi.sessions.advanceGroupStage, { sessionId: created.sessionId, groupNumber: 1 })).rejects.toThrow("복구 모드");
    await expect(backend.mutation(convexApi.students.advance, { sessionId: created.sessionId, token: students[0].token })).rejects.toThrow("복구 모드");
  });

  it("활성 학생 재연결은 확인을 보존하고 제외 학생 복귀는 모두의 초안을 다시 연다", async () => {
    const { backend, teacher, created, students, dashboard } = await classroom();
    const studentPlayer = (index: number) => dashboard.players.find((player) => player.alias === ALIASES[index])!;
    await teacher.mutation(convexApi.sessions.teacherGroupAction, { sessionId: created.sessionId, groupNumber: 1,
      kind: "recovery", expectedStage: "role", reason: "connection", studentsAgreed: true });
    await teacher.mutation(convexApi.sessions.setParticipantStatus, { sessionId: created.sessionId, playerId: studentPlayer(2).id, status: "removed" });
    for (const expectedStage of ["role", "first", "share"] as const) await teacher.mutation(convexApi.sessions.teacherGroupAction, {
      sessionId: created.sessionId, groupNumber: 1, kind: "advance", expectedStage, reason: "discussion", studentsAgreed: true });
    const view = await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: students[0].token });
    const draftArgs = { sessionId: created.sessionId, token: students[0].token,
      policyIds: view!.sharedPrompt.policies.slice(0, 2).map((item) => item.id), evidenceRoleIds: view!.evidenceRoles.slice(0, 2).map((role) => role.id),
      limitationId: view!.sharedPrompt.limitations[0].id, connectionId: view!.sharedPrompt.connections[0].id, expectedRevision: 0 };
    await backend.mutation(convexApi.students.saveDraft, draftArgs);
    await backend.mutation(convexApi.students.confirmDraft, { sessionId: created.sessionId, token: students[0].token, revision: 1 });
    const activeCode = await teacher.mutation(convexApi.sessions.issueRecoveryCode, { sessionId: created.sessionId, playerId: studentPlayer(0).id });
    const activeRecovery = await backend.mutation(convexApi.students.recoverSeat, { code: created.code, recoveryCode: activeCode.recoveryCode });
    const resumed = await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: activeRecovery.token });
    expect(resumed).toMatchObject({ stage: "confirm", confirmedRevision: 1 });
    expect(resumed?.confirmation).toEqual({ confirmed: 1, total: 2 });
    expect(await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: students[0].token })).toBeNull();
    await backend.mutation(convexApi.students.confirmDraft, { sessionId: created.sessionId, token: students[1].token, revision: 1 });
    const removedCode = await teacher.mutation(convexApi.sessions.issueRecoveryCode, { sessionId: created.sessionId, playerId: studentPlayer(2).id });
    const removedRecovery = await backend.mutation(convexApi.students.recoverSeat, { code: created.code, recoveryCode: removedCode.recoveryCode });
    const restored = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(restored.rooms[0]).toMatchObject({ stage: "draft", total: 3, confirmed: 0, completed: 0 });
    expect(restored.players.every((player) => player.stage === "draft" && player.confirmedRevision === undefined)).toBe(true);
    expect(await backend.query(convexApi.students.view, { sessionId: created.sessionId, token: removedRecovery.token })).toMatchObject({ role: { id: studentPlayer(2).roleId } });
    await expect(backend.mutation(convexApi.students.confirmDraft, { sessionId: created.sessionId, token: activeRecovery.token, revision: 1 })).rejects.toThrow("확인 단계");
    const revision = await backend.mutation(convexApi.students.saveDraft, { ...draftArgs, token: activeRecovery.token, expectedRevision: 1 });
    expect(revision.revision).toBe(2);
    await expect(backend.mutation(convexApi.students.confirmDraft, { sessionId: created.sessionId, token: activeRecovery.token, revision: 1 })).rejects.toThrow("최신");
    await expect(backend.mutation(convexApi.students.recoverSeat, { code: created.code, recoveryCode: removedCode.recoveryCode })).rejects.toThrow();
  });

  for (const scenarioId of ["early-goryeo-unity", "goryeo-culture-life", "gojoseon-eight-laws", "joseon-late-market"]) {
    for (const remaining of [1, 2]) {
      it(`${scenarioId}: ${remaining}명 복구는 원래 역할 요약·공통 자료로 초안을 만들고 실제 확인한다`, async () => {
        const { backend, teacher, created, students, dashboard } = await classroom(3, scenarioId);
        const tokenByAlias = new Map(students.map((student, index) => [ALIASES[index] as string, student.token]));
        const remove = dashboard.players.slice(remaining);
        await expect(teacher.mutation(convexApi.sessions.setParticipantStatus, {
          sessionId: created.sessionId, playerId: remove[0].id, status: "removed" })).rejects.toThrow("복구 모드");
        await teacher.mutation(convexApi.sessions.teacherGroupAction, { sessionId: created.sessionId, groupNumber: 1,
          kind: "recovery", expectedStage: "role", reason: "connection", studentsAgreed: true });
        for (const player of remove) await teacher.mutation(convexApi.sessions.setParticipantStatus, {
          sessionId: created.sessionId, playerId: player.id, status: "removed" });
        const active = dashboard.players.slice(0, remaining);
        await teacher.mutation(convexApi.sessions.advanceGroupStage, { sessionId: created.sessionId, groupNumber: 1 });
        for (const player of active) await backend.mutation(convexApi.students.completeFirst, { sessionId: created.sessionId, token: tokenByAlias.get(player.alias)! });
        await teacher.mutation(convexApi.sessions.advanceGroupStage, { sessionId: created.sessionId, groupNumber: 1 });
        for (const player of active) await backend.mutation(convexApi.students.markShared, { sessionId: created.sessionId, token: tokenByAlias.get(player.alias)! });
        await teacher.mutation(convexApi.sessions.advanceGroupStage, { sessionId: created.sessionId, groupNumber: 1 });
        const token = tokenByAlias.get(active[0].alias)!;
        const view = await backend.query(convexApi.students.view, { sessionId: created.sessionId, token });
        expect(view?.evidenceRoles.map((role) => role.id).sort()).toEqual(dashboard.players.map((player) => player.roleId).sort());
        expect(view?.evidenceRoles.filter((role) => role.recoverySummary)).toHaveLength(3 - remaining);
        expect(view?.commonEvidence).toEqual(getScenario(scenarioId, 1)!.commonEvidenceByGroupSize[3]);
        expect(JSON.stringify(view?.evidenceRoles)).not.toMatch(/privateInfo|interest|firstChoices/);
        const args = { sessionId: created.sessionId, token,
          policyIds: view!.sharedPrompt.policies.slice(0, 2).map((item) => item.id),
          evidenceRoleIds: [active[0].roleId!, remove[0].roleId!],
          limitationId: view!.sharedPrompt.limitations[0].id, connectionId: view!.sharedPrompt.connections[0].id, expectedRevision: 0 };
        await expect(backend.mutation(convexApi.students.saveDraft, { ...args, evidenceRoleIds: [active[0].roleId!, "unassigned-role"] })).rejects.toThrow("역할 근거");
        const saved = await backend.mutation(convexApi.students.saveDraft, args);
        for (const player of active) await backend.mutation(convexApi.students.confirmDraft, { sessionId: created.sessionId,
          token: tokenByAlias.get(player.alias)!, revision: saved.revision });
        const finished = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
        expect(finished.rooms[0]).toMatchObject({ stage: "finished", total: remaining, completed: remaining, confirmed: remaining });
        for (const player of active.slice(1)) await teacher.mutation(convexApi.sessions.setParticipantStatus, { sessionId: created.sessionId, playerId: player.id, status: "removed" });
        await expect(teacher.mutation(convexApi.sessions.setParticipantStatus, { sessionId: created.sessionId, playerId: active[0].id, status: "removed" })).rejects.toThrow("진행할 학생");
      });
    }
  }
});
