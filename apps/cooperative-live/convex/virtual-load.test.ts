import { convexTest } from "convex-test";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { describe, expect, it } from "vitest";

import { convexApi } from "../lib/convex-api";
import { ALIASES } from "../shared/scenario";
import schema from "./schema";
import { modules } from "./test.setup";
import { getScenario } from "./scenarios";

const TEACHER_PASSCODE = "virtual-load-teacher-passcode";

type TeacherReference<Type extends "mutation" | "query"> =
  FunctionReference<Type, "public", { teacherToken: string }, unknown>;

// 비밀번호로 로그인한 뒤 교사 함수 호출에 토큰을 자동으로 붙인다.
async function loginTeacher(backend: ReturnType<typeof convexTest>) {
  const result = await backend.mutation(convexApi.teacherAuth.login, { passcode: TEACHER_PASSCODE });
  if (!result.ok) throw new Error(result.error);
  const teacherToken = result.token;
  // 제네릭 참조에서는 convex-test의 조건부 인자 타입이 풀리지 않아 느슨한 시그니처로 호출한다.
  const callMutation = backend.mutation.bind(backend) as unknown as (reference: unknown, args: unknown) => Promise<unknown>;
  const callQuery = backend.query.bind(backend) as unknown as (reference: unknown, args: unknown) => Promise<unknown>;
  return {
    teacherToken,
    mutation: <Ref extends TeacherReference<"mutation">>(
      reference: Ref,
      args: Omit<FunctionArgs<Ref>, "teacherToken">,
    ) => callMutation(reference, { ...args, teacherToken }) as Promise<FunctionReturnType<Ref>>,
    query: <Ref extends TeacherReference<"query">>(
      reference: Ref,
      args: Omit<FunctionArgs<Ref>, "teacherToken">,
    ) => callQuery(reference, { ...args, teacherToken }) as Promise<FunctionReturnType<Ref>>,
  };
}

async function insertLegacySession(backend: ReturnType<typeof convexTest>, code: string) {
  const now = Date.now();
  return await backend.run(async (ctx) => ctx.db.insert("sessions", {
    scenarioId: "early-goryeo-unity",
    scenarioVersion: 1,
    ownerSub: "auth0|legacy-teacher",
    code,
    status: "lobby",
    createdAt: now,
    deleteAfter: now + 60 * 60 * 1000,
  }));
}
const STUDENT_COUNT = 21;

describe("실시간 협동 MUD 가상 학급", () => {
  it("21명 혼합 단계에서 5인 모둠을 3인으로 복구하고 다른 네 모둠을 보존한다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    const testBackend = convexTest(schema, modules);
    const teacher = await loginTeacher(testBackend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "early-goryeo-unity",
      scenarioVersion: 1,
    });
    const students = await Promise.all(Array.from({ length: 21 }, () =>
      testBackend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! })
    ));
    await Promise.all(students.map((student, index) =>
      testBackend.mutation(convexApi.students.selectAlias, {
        sessionId: student.sessionId,
        token: student.token,
        alias: ALIASES[index],
      })
    ));
    await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
    let dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const targetRoom = dashboard.rooms.find((room) => room.total === 5)!;
    const targetPlayers = dashboard.players.filter((player) => player.groupNumber === targetRoom.groupNumber);
    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: targetRoom.groupNumber,
    });
    const tokenByAlias = new Map<string, string>(
      ALIASES.slice(0, 21).map((alias, index) => [alias, students[index].token]),
    );
    for (const player of targetPlayers.slice(0, 3)) {
      await testBackend.mutation(convexApi.students.completeFirst, {
        sessionId: created.sessionId,
        token: tokenByAlias.get(player.alias)!,
      });
    }
    for (const player of targetPlayers.slice(3)) {
      await teacher.mutation(convexApi.sessions.setParticipantStatus, {
        sessionId: created.sessionId,
        playerId: player.id,
        status: "removed",
      });
    }
    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: targetRoom.groupNumber,
    });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.rooms.find((room) => room.groupNumber === targetRoom.groupNumber)).toMatchObject({
      total: 3,
      stage: "share",
    });
    expect(dashboard.rooms.filter((room) => room.groupNumber !== targetRoom.groupNumber).every((room) => room.stage === "role")).toBe(true);
    expect(dashboard.players.filter((player) => player.participationStatus === "active")).toHaveLength(19);
  });

  it("준비된 모둠만 진행하고 다른 모둠과 전체 진행은 건드리지 않는다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    const testBackend = convexTest(schema, modules);
    const teacher = await loginTeacher(testBackend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "early-goryeo-unity",
      scenarioVersion: 1,
    });
    const students = await Promise.all(Array.from({ length: 8 }, () =>
      testBackend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! })
    ));
    await Promise.all(students.map((student, index) =>
      testBackend.mutation(convexApi.students.selectAlias, {
        sessionId: student.sessionId,
        token: student.token,
        alias: ALIASES[index],
      })
    ));
    await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: 1,
    });
    const dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.rooms.find((room) => room.groupNumber === 1)?.stage).toBe("first");
    expect(dashboard.rooms.find((room) => room.groupNumber === 2)?.stage).toBe("role");
    await expect(teacher.mutation(convexApi.sessions.advanceStage, {
      sessionId: created.sessionId,
    })).rejects.toThrow("모둠별 단계가 다릅니다");
  });

  it("참가자 재연결·제외와 모둠별 관문을 다른 모둠 없이 안전하게 복구한다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    const testBackend = convexTest(schema, modules);
    const teacher = await loginTeacher(testBackend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "early-goryeo-unity",
      scenarioVersion: 1,
    });
    const students = await Promise.all(Array.from({ length: 5 }, () =>
      testBackend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! })
    ));
    await Promise.all(students.map((student, index) =>
      testBackend.mutation(convexApi.students.selectAlias, {
        sessionId: student.sessionId,
        token: student.token,
        alias: ALIASES[index],
      })
    ));
    await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
    let dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const firstPlayer = dashboard.players.find((player) => player.alias === ALIASES[0])!;
    const recovery = await teacher.mutation(convexApi.sessions.issueRecoveryCode, {
      sessionId: created.sessionId,
      playerId: firstPlayer.id,
    });
    const storedRecovery = await testBackend.run(async (ctx) => ctx.db.get(firstPlayer.id));
    expect(storedRecovery?.recoveryTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(storedRecovery)).not.toContain(recovery.recoveryCode);
    const otherSession = { code: "999999" };
    await insertLegacySession(testBackend, otherSession.code);
    await expect(testBackend.mutation(convexApi.students.recoverSeat, {
      code: otherSession.code,
      recoveryCode: recovery.recoveryCode,
    })).rejects.toThrow("확인할 수 없습니다");
    const expiringPlayer = dashboard.players.find((player) => player.alias === ALIASES[1])!;
    const expiredRecovery = await teacher.mutation(convexApi.sessions.issueRecoveryCode, {
      sessionId: created.sessionId,
      playerId: expiringPlayer.id,
    });
    await testBackend.run(async (ctx) => {
      await ctx.db.patch(expiringPlayer.id, { recoveryTokenExpiresAt: 0 });
    });
    await expect(testBackend.mutation(convexApi.students.recoverSeat, {
      code: created.code,
      recoveryCode: expiredRecovery.recoveryCode,
    })).rejects.toThrow("확인할 수 없습니다");
    const recovered = await testBackend.mutation(convexApi.students.recoverSeat, {
      code: created.code,
      recoveryCode: recovery.recoveryCode,
    });
    await expect(testBackend.query(convexApi.students.view, {
      sessionId: created.sessionId,
      token: students[0].token,
    })).resolves.toBeNull();
    await expect(testBackend.mutation(convexApi.students.recoverSeat, {
      code: created.code,
      recoveryCode: recovery.recoveryCode,
    })).rejects.toThrow("확인할 수 없습니다");

    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: 1,
    });
    const activeTokens = [recovered.token, students[1].token, students[2].token, students[3].token];
    await Promise.all(activeTokens.map((token) =>
      testBackend.mutation(convexApi.students.completeFirst, { sessionId: created.sessionId, token })
    ));
    await expect(teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: 1,
    })).rejects.toThrow("최초 판단 1명 남음");
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const blockedPlayer = dashboard.players.find((player) => player.alias === ALIASES[4])!;
    await teacher.mutation(convexApi.sessions.setParticipantStatus, {
      sessionId: created.sessionId,
      playerId: blockedPlayer.id,
      status: "removed",
    });
    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: 1,
    });
    for (const token of activeTokens) {
      await testBackend.mutation(convexApi.students.markShared, { sessionId: created.sessionId, token });
      await expect(testBackend.mutation(convexApi.students.markShared, {
        sessionId: created.sessionId,
        token,
      })).resolves.toEqual({ complete: true });
    }
    await teacher.mutation(convexApi.sessions.advanceGroupStage, {
      sessionId: created.sessionId,
      groupNumber: 1,
    });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.rooms[0].total).toBe(4);
    expect(dashboard.rooms[0].stage).toBe("draft");
    expect(dashboard.players.find((player) => player.id === blockedPlayer.id)?.participationStatus).toBe("removed");
    const draftView = await testBackend.query(convexApi.students.view, {
      sessionId: created.sessionId,
      token: activeTokens[0],
    });
    const evidenceRoleIds = draftView!.evidenceRoles.slice(0, 2).map((role) => role.id);
    await testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: created.sessionId,
      token: activeTokens[0],
      policyIds: draftView!.sharedPrompt.policies.slice(0, 2).map((item) => item.id),
      evidenceRoleIds,
      limitationId: draftView!.sharedPrompt.limitations[0].id,
      connectionId: draftView!.sharedPrompt.connections[0].id,
      expectedRevision: 0,
    });
    const evidencePlayer = dashboard.players.find((player) => player.roleId === evidenceRoleIds[0])!;
    await teacher.mutation(convexApi.sessions.setParticipantStatus, {
      sessionId: created.sessionId,
      playerId: evidencePlayer.id,
      status: "removed",
    });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.rooms[0].total).toBe(3);
    expect(dashboard.drafts).toEqual([]);
    const survivingViews = await Promise.all(activeTokens.map((token) =>
      testBackend.query(convexApi.students.view, { sessionId: created.sessionId, token })
    ));
    const threePersonView = survivingViews.find(Boolean);
    expect(threePersonView?.commonEvidence).toEqual(
      getScenario("early-goryeo-unity", 1)!.commonEvidenceByGroupSize[3],
    );
    await teacher.mutation(convexApi.sessions.setParticipantStatus, {
      sessionId: created.sessionId,
      playerId: evidencePlayer.id,
      status: "active",
    });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.rooms[0].total).toBe(4);
    expect(dashboard.rooms[0].confirmed).toBe(0);
  });

  it("고려 주변 나라 관계 3·4·5인 모둠을 편성하고 역할 비공개·공통 자료를 지킨다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET =
      "virtual-load-test-secret-32-bytes-minimum";

    const scenario = getScenario("goryeo-foreign-relations", 1)!;
    for (const size of [3, 4, 5] as const) {
      const testBackend = convexTest(schema, modules);
      const teacher = await loginTeacher(testBackend);
      const created = await teacher.mutation(convexApi.sessions.create, {
        scenarioId: scenario.id,
        scenarioVersion: scenario.version,
      });
      const students = await Promise.all(
        Array.from({ length: size }, () =>
          testBackend.mutation(convexApi.students.joinWithEntryKey, {
            entryKey: created.entryKey!,
          }),
        ),
      );
      await Promise.all(students.map((student, index) =>
        testBackend.mutation(convexApi.students.selectAlias, {
          sessionId: student.sessionId,
          token: student.token,
          alias: ALIASES[index],
        })
      ));
      await teacher.mutation(convexApi.sessions.previewGroups, {
        sessionId: created.sessionId,
      });
      await teacher.mutation(convexApi.sessions.confirmStart, {
        sessionId: created.sessionId,
      });

      const views = await Promise.all(students.map((student) =>
        testBackend.query(convexApi.students.view, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      expect(new Set(views.map((view) => view?.role?.id))).toEqual(
        new Set(scenario.groupSizes[size]),
      );
      for (const view of views) {
        expect(view?.role).toBeTruthy();
        expect(view?.commonEvidence).toEqual([]);
        const serialized = JSON.stringify(view);
        for (const role of scenario.roles) {
          if (role.id !== view?.role?.id) {
            expect(serialized).not.toContain(role.privateInfo);
          }
        }
      }

      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      await Promise.all(students.map((student) =>
        testBackend.mutation(convexApi.students.completeFirst, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      await Promise.all(students.map((student) =>
        testBackend.mutation(convexApi.students.markShared, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      const shareViews = await Promise.all(students.map((student) =>
        testBackend.query(convexApi.students.view, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      for (const view of shareViews) {
        expect(view?.commonEvidence).toEqual(
          scenario.commonEvidenceByGroupSize[size],
        );
      }
    }
  });

  it("조선 후기 3·4·5인 모둠을 서버에서 편성하고 역할 비공개·공통 자료를 지킨다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET =
      "virtual-load-test-secret-32-bytes-minimum";

    const scenario = getScenario("joseon-late-market", 1)!;
    for (const size of [3, 4, 5] as const) {
      const testBackend = convexTest(schema, modules);
      const teacher = await loginTeacher(testBackend);
      const created = await teacher.mutation(convexApi.sessions.create, {
        scenarioId: scenario.id,
        scenarioVersion: scenario.version,
      });
      const students = await Promise.all(
        Array.from({ length: size }, () =>
          testBackend.mutation(convexApi.students.joinWithEntryKey, {
            entryKey: created.entryKey!,
          }),
        ),
      );
      await Promise.all(students.map((student, index) =>
        testBackend.mutation(convexApi.students.selectAlias, {
          sessionId: student.sessionId,
          token: student.token,
          alias: ALIASES[index],
        })
      ));
      await teacher.mutation(convexApi.sessions.previewGroups, {
        sessionId: created.sessionId,
      });
      await teacher.mutation(convexApi.sessions.confirmStart, {
        sessionId: created.sessionId,
      });

      const views = await Promise.all(students.map((student) =>
        testBackend.query(convexApi.students.view, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      expect(new Set(views.map((view) => view?.role?.id))).toEqual(
        new Set(scenario.groupSizes[size]),
      );
      for (const view of views) {
        expect(view?.role).toBeTruthy();
        expect(view?.commonEvidence).toEqual([]);
        const serialized = JSON.stringify(view);
        for (const role of scenario.roles) {
          if (role.id !== view?.role?.id) {
            expect(serialized).not.toContain(role.privateInfo);
          }
        }
      }

      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      await Promise.all(students.map((student) =>
        testBackend.mutation(convexApi.students.completeFirst, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      await Promise.all(students.map((student) =>
        testBackend.mutation(convexApi.students.markShared, {
          sessionId: student.sessionId,
          token: student.token,
        })
      ));
      await teacher.mutation(convexApi.sessions.advanceStage, {
        sessionId: created.sessionId,
      });
      const draftView = await testBackend.query(convexApi.students.view, {
        sessionId: students[0].sessionId,
        token: students[0].token,
      });
      expect(draftView?.stage).toBe("draft");
      expect(draftView?.commonEvidence).toEqual(
        scenario.commonEvidenceByGroupSize[size],
      );

      await teacher.mutation(convexApi.sessions.end, {
        sessionId: created.sessionId,
      });
    }
  });

  it("고조선에서 교사 1명과 학생 21명의 입장부터 종료 삭제까지 관통한다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";

    const testBackend = convexTest(schema, modules);
    const teacher = await loginTeacher(testBackend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "gojoseon-eight-laws",
      scenarioVersion: 1,
    });

    expect(created.entryKey).toMatch(/^[0-9a-f]{64}$/);
    const students = await Promise.all(
      Array.from({ length: STUDENT_COUNT }, () =>
        testBackend.mutation(convexApi.students.joinWithEntryKey, {
          entryKey: created.entryKey!,
        }),
      ),
    );

    expect(students).toHaveLength(STUDENT_COUNT);
    expect(new Set(students.map((student) => student.token)).size).toBe(STUDENT_COUNT);

    await Promise.all(
      students.map((student, index) =>
        testBackend.mutation(convexApi.students.selectAlias, {
          sessionId: student.sessionId,
          token: student.token,
          alias: ALIASES[index],
        }),
      ),
    );

    const preview = await teacher.mutation(convexApi.sessions.previewGroups, {
      sessionId: created.sessionId,
    });
    expect(preview).toEqual({ groups: 5, players: STUDENT_COUNT });

    const previewDashboard = await teacher.query(convexApi.sessions.dashboard, {
      sessionId: created.sessionId,
    });
    expect(previewDashboard.session.scenarioId).toBe("gojoseon-eight-laws");
    const groups = new Map<number, typeof previewDashboard.players>();
    for (const player of previewDashboard.players) {
      expect(player.groupNumber).toBeDefined();
      const groupNumber = player.groupNumber!;
      groups.set(groupNumber, [...(groups.get(groupNumber) ?? []), player]);
    }

    expect(new Set(previewDashboard.players.map((player) => player.alias)).size).toBe(
      STUDENT_COUNT,
    );
    expect([...groups.values()].map((players) => players.length).sort()).toEqual([
      4,
      4,
      4,
      4,
      5,
    ]);
    for (const players of groups.values()) {
      expect(new Set(players.map((player) => player.roleId)).size).toBe(players.length);
    }

    const started = await teacher.mutation(convexApi.sessions.confirmStart, {
      sessionId: created.sessionId,
    });
    expect(started).toEqual({ groups: 5, players: STUDENT_COUNT });

    await teacher.mutation(convexApi.interventions.send, {
      sessionId: created.sessionId,
      groupNumber: 1,
      kind: "hint",
    });
    const groupOnePlayer = previewDashboard.players.find(
      (player) => player.groupNumber === 1,
    );
    expect(groupOnePlayer).toBeDefined();
    const groupOneStudentIndex = ALIASES.indexOf(
      groupOnePlayer!.alias as (typeof ALIASES)[number],
    );
    const groupOneStudent = students[groupOneStudentIndex];
    const groupOneView = await testBackend.query(convexApi.students.view, {
      sessionId: groupOneStudent.sessionId,
      token: groupOneStudent.token,
    });
    expect(groupOneView?.intervention?.kind).toBe("hint");
    expect(groupOneView?.intervention?.acknowledged).toBe(false);
    await testBackend.mutation(convexApi.students.acknowledgeIntervention, {
      sessionId: groupOneStudent.sessionId,
      token: groupOneStudent.token,
      interventionId: groupOneView!.intervention!.id,
    });
    const acknowledgedView = await testBackend.query(convexApi.students.view, {
      sessionId: groupOneStudent.sessionId,
      token: groupOneStudent.token,
    });
    expect(acknowledgedView?.intervention?.acknowledged).toBe(true);
    const acknowledgedDashboard = await teacher.query(convexApi.sessions.dashboard, {
      sessionId: created.sessionId,
    });
    expect(
      acknowledgedDashboard.rooms.find((room) => room.groupNumber === 1)?.latestIntervention,
    ).toMatchObject({ kind: "hint", acknowledged: 1 });

    const firstStudent = students[0];
    const firstStage = await testBackend.mutation(convexApi.students.advance, {
      sessionId: firstStudent.sessionId,
      token: firstStudent.token,
    });
    expect(firstStage).toBe("first");

    const studentView = await testBackend.query(convexApi.students.view, {
      sessionId: firstStudent.sessionId,
      token: firstStudent.token,
    });
    expect(studentView?.stage).toBe("first");
    expect(studentView?.role).toBeTruthy();

    await testBackend.run(async (ctx) => {
      await ctx.db.insert("joinAttempts", {
        bucketHash: "a".repeat(64),
        sessionId: created.sessionId,
        failedAttempts: 1,
        windowStartedAt: Date.now(),
        deleteAfter: Date.now() + 60_000,
      });
    });

    const ended = await teacher.mutation(convexApi.sessions.end, {
      sessionId: created.sessionId,
    });
    expect(ended.deleted).toBe(STUDENT_COUNT + 5 + 1 + 1 + 1);

    const remaining = await testBackend.run(async (ctx) => ({
      sessions: (await ctx.db.query("sessions").collect()).length,
      players: (await ctx.db.query("players").collect()).length,
      rooms: (await ctx.db.query("rooms").collect()).length,
      interventions: (await ctx.db.query("interventions").collect()).length,
      joinAttempts: (await ctx.db.query("joinAttempts").collect()).length,
    }));
    expect(remaining).toEqual({
      sessions: 0,
      players: 0,
      rooms: 0,
      interventions: 0,
      joinAttempts: 0,
    });
  });

  it("고려 역할 비공개·pause·공동 revision·전원 확인을 서버에서 검증한다", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET =
      "virtual-load-test-secret-32-bytes-minimum";

    const testBackend = convexTest(schema, modules);
    const teacher = await loginTeacher(testBackend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "early-goryeo-unity",
      scenarioVersion: 1,
    });
    await expect(teacher.mutation(convexApi.sessions.create, {
      scenarioId: "unknown-scenario",
      scenarioVersion: 1,
    })).rejects.toThrow("찾을 수 없습니다");

    const students = await Promise.all(
      Array.from({ length: 4 }, () =>
        testBackend.mutation(convexApi.students.joinWithEntryKey, {
          entryKey: created.entryKey!,
        }),
      ),
    );
    await Promise.all(students.map((student, index) =>
      testBackend.mutation(convexApi.students.selectAlias, {
        sessionId: student.sessionId,
        token: student.token,
        alias: ALIASES[index],
      })
    ));
    await teacher.mutation(convexApi.sessions.previewGroups, {
      sessionId: created.sessionId,
    });
    await teacher.mutation(convexApi.sessions.confirmStart, {
      sessionId: created.sessionId,
    });

    const scenario = getScenario("early-goryeo-unity", 1)!;
    const initialViews = await Promise.all(students.map((student) =>
      testBackend.query(convexApi.students.view, {
        sessionId: student.sessionId,
        token: student.token,
      })
    ));
    for (const view of initialViews) {
      expect(view?.role).toBeTruthy();
      expect(view?.evidenceRoles).toEqual([]);
      const serialized = JSON.stringify(view);
      for (const role of scenario.roles) {
        if (role.id !== view?.role?.id) {
          expect(serialized).not.toContain(role.privateInfo);
        }
      }
    }

    await teacher.mutation(convexApi.sessions.advanceStage, {
      sessionId: created.sessionId,
    });
    await teacher.mutation(convexApi.sessions.togglePause, {
      sessionId: created.sessionId,
      paused: true,
    });
    await expect(testBackend.mutation(convexApi.students.completeFirst, {
      sessionId: students[0].sessionId,
      token: students[0].token,
    })).rejects.toThrow("잠시 멈췄습니다");
    await teacher.mutation(convexApi.sessions.togglePause, {
      sessionId: created.sessionId,
      paused: false,
    });

    await Promise.all(students.map((student) =>
      testBackend.mutation(convexApi.students.completeFirst, {
        sessionId: student.sessionId,
        token: student.token,
      })
    ));
    await teacher.mutation(convexApi.sessions.advanceStage, {
      sessionId: created.sessionId,
    });
    await Promise.all(students.map((student) =>
      testBackend.mutation(convexApi.students.markShared, {
        sessionId: student.sessionId,
        token: student.token,
      })
    ));
    await teacher.mutation(convexApi.sessions.advanceStage, {
      sessionId: created.sessionId,
    });

    const draftView = await testBackend.query(convexApi.students.view, {
      sessionId: students[0].sessionId,
      token: students[0].token,
    });
    expect(draftView?.stage).toBe("draft");
    expect(draftView?.evidenceRoles).toHaveLength(4);
    expect(draftView?.sharing).toEqual({ completed: 4, total: 4 });
    const evidenceRoleIds = draftView!.evidenceRoles.slice(0, 2).map(
      (role) => role.id,
    );
    await expect(testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: students[0].sessionId,
      token: students[0].token,
      policyIds: draftView!.sharedPrompt.policies.slice(0, 3).map(
        (item) => item.id,
      ),
      evidenceRoleIds: draftView!.evidenceRoles.slice(0, 3).map(
        (role) => role.id,
      ),
      limitationId: draftView!.sharedPrompt.limitations[0].id,
      connectionId: draftView!.sharedPrompt.connections[0].id,
      expectedRevision: 0,
    })).rejects.toThrow("정책 두 가지");
    await expect(testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: students[0].sessionId,
      token: students[0].token,
      policyIds: draftView!.sharedPrompt.policies.slice(0, 2).map(
        (item) => item.id,
      ),
      evidenceRoleIds: draftView!.evidenceRoles.slice(0, 3).map(
        (role) => role.id,
      ),
      limitationId: draftView!.sharedPrompt.limitations[0].id,
      connectionId: draftView!.sharedPrompt.connections[0].id,
      expectedRevision: 0,
    })).rejects.toThrow("역할 근거 두 가지");
    const saved = await testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: students[0].sessionId,
      token: students[0].token,
      policyIds: draftView!.sharedPrompt.policies.slice(0, 2).map(
        (item) => item.id,
      ),
      evidenceRoleIds,
      limitationId: draftView!.sharedPrompt.limitations[0].id,
      connectionId: draftView!.sharedPrompt.connections[0].id,
      expectedRevision: 0,
    });
    expect(saved.revision).toBe(1);
    await expect(testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: students[1].sessionId,
      token: students[1].token,
      policyIds: draftView!.sharedPrompt.policies.slice(0, 2).map(
        (item) => item.id,
      ),
      evidenceRoleIds,
      limitationId: draftView!.sharedPrompt.limitations[0].id,
      connectionId: draftView!.sharedPrompt.connections[0].id,
      expectedRevision: 0,
    })).rejects.toThrow("최신 초안");

    const firstConfirmation = await testBackend.mutation(
      convexApi.students.confirmDraft,
      {
        sessionId: students[0].sessionId,
        token: students[0].token,
        revision: 1,
      },
    );
    expect(firstConfirmation.complete).toBe(false);
    const revised = await testBackend.mutation(convexApi.students.saveDraft, {
      sessionId: students[1].sessionId,
      token: students[1].token,
      policyIds: draftView!.sharedPrompt.policies.slice(0, 2).map(
        (item) => item.id,
      ),
      evidenceRoleIds,
      limitationId: draftView!.sharedPrompt.limitations[1].id,
      connectionId: draftView!.sharedPrompt.connections[1].id,
      expectedRevision: 1,
    });
    expect(revised.revision).toBe(2);
    const revisedView = await testBackend.query(convexApi.students.view, {
      sessionId: students[0].sessionId,
      token: students[0].token,
    });
    expect(revisedView?.confirmation).toEqual({ confirmed: 0, total: 4 });
    await expect(testBackend.mutation(convexApi.students.confirmDraft, {
      sessionId: students[0].sessionId,
      token: students[0].token,
      revision: 1,
    })).rejects.toThrow("최신 공동 초안");

    for (let index = 0; index < students.length; index += 1) {
      const result = await testBackend.mutation(convexApi.students.confirmDraft, {
        sessionId: students[index].sessionId,
        token: students[index].token,
        revision: 2,
      });
      expect(result.complete).toBe(index === students.length - 1);
    }
    const finished = await testBackend.query(convexApi.students.view, {
      sessionId: students[0].sessionId,
      token: students[0].token,
    });
    expect(finished?.stage).toBe("finished");
    expect(finished?.confirmation).toEqual({ confirmed: 4, total: 4 });

    await teacher.mutation(convexApi.sessions.end, {
      sessionId: created.sessionId,
    });
    const remaining = await testBackend.run(async (ctx) => ({
      sessions: (await ctx.db.query("sessions").collect()).length,
      players: (await ctx.db.query("players").collect()).length,
      rooms: (await ctx.db.query("rooms").collect()).length,
      drafts: (await ctx.db.query("drafts").collect()).length,
      helpRequests: (await ctx.db.query("helpRequests").collect()).length,
    }));
    expect(remaining).toEqual({
      sessions: 0,
      players: 0,
      rooms: 0,
      drafts: 0,
      helpRequests: 0,
    });
  });
});

describe("Goryeo culture draft requirements", () => {
  it("rejects drafts that omit family-life evidence or its source limit", async () => {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    const backend = convexTest(schema, modules);
    const teacher = await loginTeacher(backend);
    const scenario = getScenario("goryeo-culture-life", 1)!;
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: scenario.id,
      scenarioVersion: scenario.version,
    });
    const students = await Promise.all(Array.from({ length: 3 }, () =>
      backend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! })
    ));
    await Promise.all(students.map((student, index) =>
      backend.mutation(convexApi.students.selectAlias, {
        sessionId: student.sessionId, token: student.token, alias: ALIASES[index],
      })
    ));
    await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
    await teacher.mutation(convexApi.sessions.advanceStage, { sessionId: created.sessionId });
    await Promise.all(students.map((student) => backend.mutation(convexApi.students.completeFirst, {
      sessionId: student.sessionId, token: student.token,
    })));
    await teacher.mutation(convexApi.sessions.advanceStage, { sessionId: created.sessionId });
    await Promise.all(students.map((student) => backend.mutation(convexApi.students.markShared, {
      sessionId: student.sessionId, token: student.token,
    })));
    await teacher.mutation(convexApi.sessions.advanceStage, { sessionId: created.sessionId });

    const base = {
      sessionId: students[0].sessionId,
      token: students[0].token,
      limitationId: "missing-lives",
      expectedRevision: 0,
    };
    await expect(backend.mutation(convexApi.students.saveDraft, {
      ...base,
      policyIds: ["craft-technology", "belief-purpose"],
      evidenceRoleIds: ["celadon-artisan", "tripitaka-woodblock-reader"],
      connectionId: "record-and-scope",
    })).rejects.toThrow("가족 기록의 생활 근거와 자료 범위");
    await expect(backend.mutation(convexApi.students.saveDraft, {
      ...base,
      policyIds: ["family-life", "belief-purpose"],
      evidenceRoleIds: ["celadon-artisan", "tripitaka-woodblock-reader"],
      connectionId: "record-and-scope",
    })).rejects.toThrow("가족 기록의 생활 근거와 자료 범위");
    await expect(backend.mutation(convexApi.students.saveDraft, {
      ...base,
      policyIds: ["family-life", "belief-purpose"],
      evidenceRoleIds: ["family-record-reader", "tripitaka-woodblock-reader"],
      connectionId: "tech-and-access",
    })).rejects.toThrow("가족 기록의 생활 근거와 자료 범위");
    await backend.mutation(convexApi.students.saveDraft, {
      ...base,
      policyIds: ["family-life", "belief-purpose"],
      evidenceRoleIds: ["family-record-reader", "tripitaka-woodblock-reader"],
      connectionId: "record-and-scope",
    });
  });
});

describe("교사 대기실 참가자 정리", () => {
  async function openLobby(count: number, selected = count) {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    const backend = convexTest(schema, modules);
    const teacher = await loginTeacher(backend);
    const created = await teacher.mutation(convexApi.sessions.create, {
      scenarioId: "early-goryeo-unity",
      scenarioVersion: 1,
    });
    const students = await Promise.all(Array.from({ length: count }, () =>
      backend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! })
    ));
    await Promise.all(students.slice(0, selected).map((student, index) =>
      backend.mutation(convexApi.students.selectAlias, {
        sessionId: created.sessionId,
        token: student.token,
        alias: ALIASES[index],
      })
    ));
    return { backend, teacher, created, students };
  }

  it("대기실 내보내기로 인원·호를 되돌리고 이전 토큰을 거부하며 재입장을 허용한다", async () => {
    const { backend, teacher, created, students } = await openLobby(4);
    const before = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(before.players).toHaveLength(4);
    expect(before.players[0]).toMatchObject({ aliasSelected: true, joinedAt: expect.any(Number) });
    const kicked = await teacher.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId,
      playerId: before.players[0].id,
    });
    expect(kicked).toMatchObject({ removed: true, status: "lobby" });
    expect(await teacher.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId,
      playerId: before.players[0].id,
    })).toMatchObject({ removed: false, status: "lobby" });
    const after = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(after.players).toHaveLength(3);
    expect(await backend.query(convexApi.students.view, {
      sessionId: created.sessionId, token: students[0].token,
    })).toBeNull();
    expect(await backend.query(convexApi.students.accessState, {
      sessionId: created.sessionId, token: students[0].token,
    })).toBe("kicked");
    await expect(backend.mutation(convexApi.students.selectAlias, {
      sessionId: created.sessionId, token: students[0].token, alias: ALIASES[0],
    })).rejects.toThrow("만료");
    const rejoined = await backend.mutation(convexApi.students.joinWithEntryKey, { entryKey: created.entryKey! });
    await backend.mutation(convexApi.students.selectAlias, {
      sessionId: created.sessionId, token: rejoined.token, alias: ALIASES[0],
    });
    expect((await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId })).players).toHaveLength(4);
  });

  it("호 미선택 자리 정리 후 편성하고, 그대로 진행 때는 확인한 자리만 제외한다", async () => {
    const { teacher, created } = await openLobby(5, 4);
    const before = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const empty = before.players.find((player) => !player.aliasSelected)!;
    await expect(teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId }))
      .rejects.toThrow("목록이 바뀌었습니다");
    await teacher.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId, playerId: empty.id,
    });
    const preview = await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    expect(preview.players).toBe(4);
    const another = await openLobby(5, 4);
    const unselected = (await another.teacher.query(convexApi.sessions.dashboard, { sessionId: another.created.sessionId }))
      .players.find((player) => !player.aliasSelected)!;
    const direct = await another.teacher.mutation(convexApi.sessions.previewGroups, {
      sessionId: another.created.sessionId, removeUnselectedIds: [unselected.id],
    });
    expect(direct).toMatchObject({ players: 4 });
    expect((await another.teacher.query(convexApi.sessions.dashboard, { sessionId: another.created.sessionId })).players).toHaveLength(4);
  });

  it("preview 내보내기는 배정안을 다시 만들고 3명 미만이면 대기로 돌아간다", async () => {
    const { teacher, created } = await openLobby(4);
    await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    let dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const result = await teacher.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId, playerId: dashboard.players[0].id,
    });
    expect(result).toMatchObject({ removed: true, status: "preview" });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.players).toHaveLength(3);
    expect(dashboard.players.every((player) => player.groupNumber && player.roleId)).toBe(true);
    const fallback = await teacher.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId, playerId: dashboard.players[0].id,
    });
    expect(fallback).toMatchObject({ removed: true, status: "lobby", entryKey: expect.any(String) });
    dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.players.every((player) => !player.groupNumber && !player.roleId)).toBe(true);
    expect(dashboard.session.status).toBe("lobby");
  });

  it("로그인하지 않았거나 토큰이 틀리면, 또 이전 Auth0 세션은 내보낼 수 없다", async () => {
    const { backend, teacher, created } = await openLobby(3);
    const playerId = (await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId })).players[0].id;
    await expect(backend.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId, playerId, teacherToken: "",
    })).rejects.toThrow("교사 로그인");
    await expect(backend.mutation(convexApi.sessions.kickBeforeStart, {
      sessionId: created.sessionId, playerId, teacherToken: "0".repeat(64),
    })).rejects.toThrow("교사 로그인");
    const legacySessionId = await insertLegacySession(backend, "999998");
    await expect(teacher.query(convexApi.sessions.dashboard, {
      sessionId: legacySessionId,
    })).rejects.toThrow("관리 권한");
    expect((await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId })).players).toHaveLength(3);
  });

  it("21명 중 호 미선택 빈자리 2개를 교사가 정리하면 19명을 정상 편성한다", async () => {
    const { teacher, created } = await openLobby(21, 19);
    const before = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    const empty = before.players.filter((player) => !player.aliasSelected);
    expect(empty).toHaveLength(2);
    for (const player of empty) {
      await teacher.mutation(convexApi.sessions.kickBeforeStart, {
        sessionId: created.sessionId, playerId: player.id,
      });
    }
    const preview = await teacher.mutation(convexApi.sessions.previewGroups, { sessionId: created.sessionId });
    expect(preview.players).toBe(19);
    const started = await teacher.mutation(convexApi.sessions.confirmStart, { sessionId: created.sessionId });
    expect(started.players).toBe(19);
    const dashboard = await teacher.query(convexApi.sessions.dashboard, { sessionId: created.sessionId });
    expect(dashboard.players).toHaveLength(19);
    expect(dashboard.rooms.reduce((sum, room) => sum + room.total, 0)).toBe(19);
  });
});

describe("교사 비밀번호 로그인", () => {
  function setup() {
    process.env.TEACHER_PASSCODE = TEACHER_PASSCODE;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";
    return convexTest(schema, modules);
  }

  it("틀린 비밀번호는 거부하고 토큰 원문을 저장하지 않는다", async () => {
    const backend = setup();
    expect(await backend.mutation(convexApi.teacherAuth.login, { passcode: "wrong-passcode" }))
      .toMatchObject({ ok: false, error: "비밀번호가 맞지 않습니다." });
    const teacher = await loginTeacher(backend);
    expect(await backend.query(convexApi.teacherAuth.check, { teacherToken: teacher.teacherToken })).toBe(true);
    const stored = await backend.run(async (ctx) => ctx.db.query("teacherLogins").collect());
    expect(stored).toHaveLength(1);
    expect(JSON.stringify(stored)).not.toContain(teacher.teacherToken);
    expect(JSON.stringify(stored)).not.toContain(TEACHER_PASSCODE);
  });

  it("10번 틀리면 맞는 비밀번호도 잠시 막는다", async () => {
    const backend = setup();
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await backend.mutation(convexApi.teacherAuth.login, { passcode: "wrong-passcode" });
    }
    expect(await backend.mutation(convexApi.teacherAuth.login, { passcode: TEACHER_PASSCODE }))
      .toMatchObject({ ok: false, error: expect.stringContaining("잠시 잠겼습니다") });
  });

  it("로그아웃하거나 비밀번호를 바꾸면 이전 토큰을 거부한다", async () => {
    const backend = setup();
    const first = await loginTeacher(backend);
    await backend.mutation(convexApi.teacherAuth.logout, { teacherToken: first.teacherToken });
    expect(await backend.query(convexApi.teacherAuth.check, { teacherToken: first.teacherToken })).toBe(false);
    await expect(first.query(convexApi.sessions.current, {})).rejects.toThrow("교사 로그인");

    const second = await loginTeacher(backend);
    process.env.TEACHER_PASSCODE = "changed-teacher-passcode";
    await expect(second.mutation(convexApi.sessions.create, {})).rejects.toThrow("교사 로그인");
  });

  it("비밀번호가 설정되지 않았거나 8자 미만이면 로그인할 수 없다", async () => {
    const backend = setup();
    process.env.TEACHER_PASSCODE = "short";
    expect(await backend.mutation(convexApi.teacherAuth.login, { passcode: "short" }))
      .toMatchObject({ ok: false, error: expect.stringContaining("설정되지 않았습니다") });
  });
});
