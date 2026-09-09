import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { convexApi } from "../lib/convex-api";
import { ALIASES } from "../shared/scenario";
import schema from "./schema";
import { modules } from "./test.setup";

const TEACHER_SUB = "auth0|virtual-load-teacher";
const STUDENT_COUNT = 21;

describe("실시간 협동 MUD 가상 학급", () => {
  it("교사 1명과 학생 21명의 입장부터 종료 삭제까지 관통한다", async () => {
    process.env.TEACHER_AUTH0_SUBS = TEACHER_SUB;
    process.env.JOIN_ATTEMPT_HMAC_SECRET = "virtual-load-test-secret-32-bytes-minimum";

    const testBackend = convexTest(schema, modules);
    const teacher = testBackend.withIdentity({ subject: TEACHER_SUB });
    const created = await teacher.mutation(convexApi.sessions.create, {});

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
});
