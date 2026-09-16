import {
  makeFunctionReference,
  mutationGeneric,
  queryGeneric,
  type GenericDataModel,
  type GenericMutationCtx,
} from "convex/server";
import { v } from "convex/values";
import type { GenericId } from "convex/values";

import {
  ALIASES,
  DEFAULT_SCENARIO_ID,
  STUDENT_STAGE_ORDER,
  assignGroups,
  pickUniqueAliases,
  type Stage,
} from "../shared/scenario";
import {
  ENTRY_CREDENTIAL_TTL_MS,
  createOpaqueToken,
  expiresAt,
  sha256Hex,
} from "../shared/join-security";
import { deleteSessionData } from "./data";
import { getScenario, roleById } from "./scenarios";
import { hashStudentToken, requireOwnedSession, requireTeacher } from "./security";

const EXPIRES_AFTER_MS = 2 * 60 * 60 * 1000;

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createEntryCredential(now: number, deleteAfter: number) {
  const entryKey = createOpaqueToken();
  return {
    entryKey,
    entryKeyHash: await sha256Hex(entryKey),
    entryKeyExpiresAt: expiresAt(now, deleteAfter, ENTRY_CREDENTIAL_TTL_MS),
  };
}

async function scheduleEntryCredentialExpiry(
  scheduler: {
    runAt: (
      timestamp: number,
      reference: ReturnType<typeof makeFunctionReference<"mutation">>,
      args: {
        sessionId: GenericId<"sessions">;
        expectedEntryKeyExpiresAt: number;
      },
    ) => Promise<unknown>;
  },
  sessionId: GenericId<"sessions">,
  entryKeyExpiresAt: number,
) {
  await scheduler.runAt(
    entryKeyExpiresAt,
    makeFunctionReference<"mutation">("cleanup:expireEntryCredentials"),
    { sessionId, expectedEntryKeyExpiresAt: entryKeyExpiresAt },
  );
}

function publicSession(session: {
  _id: GenericId<"sessions">;
  scenarioId: string;
  scenarioVersion: number;
  code: string;
  status: "lobby" | "preview" | "active";
  codeExpiresAt?: number;
  entryKeyHash?: string;
  entryKeyExpiresAt?: number;
  createdAt: number;
  startedAt?: number;
  pausedAt?: number;
  deleteAfter: number;
}) {
  const scenario = getScenario(session.scenarioId, session.scenarioVersion);
  return {
    _id: session._id,
    scenarioId: session.scenarioId,
    scenarioVersion: session.scenarioVersion,
    scenario: scenario?.publicMeta ?? null,
    code: session.code,
    status: session.status,
    paused: Boolean(session.pausedAt),
    codeExpiresAt: session.codeExpiresAt,
    entryKeyExpiresAt: session.entryKeyExpiresAt,
    hasEntryKey: Boolean(session.entryKeyHash),
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    deleteAfter: session.deleteAfter,
  };
}

export const create = mutationGeneric({
  args: {
    scenarioId: v.optional(v.string()),
    scenarioVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerSub = await requireTeacher(ctx);
    const now = Date.now();
    const scenarioId = args.scenarioId ?? DEFAULT_SCENARIO_ID;
    const scenarioVersion = args.scenarioVersion ?? 1;
    if (!getScenario(scenarioId, scenarioVersion)) {
      throw new Error("선택한 활동 또는 버전을 찾을 수 없습니다.");
    }

    const currentSession = await ctx.db
      .query("sessions")
      .withIndex("by_owner", (query) => query.eq("ownerSub", ownerSub))
      .order("desc")
      .filter((query) => query.gt(query.field("deleteAfter"), now))
      .first();
    if (currentSession) {
      return {
        sessionId: currentSession._id,
        code: currentSession.code,
        deleteAfter: currentSession.deleteAfter,
        codeExpiresAt: currentSession.codeExpiresAt,
        entryKeyExpiresAt: currentSession.entryKeyExpiresAt,
      };
    }

    let code: string | null = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = makeCode();
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_code", (query) => query.eq("code", candidate))
        .unique();
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      throw new Error("수업 코드를 만들지 못했습니다. 다시 시도해 주세요.");
    }

    const deleteAfter = now + EXPIRES_AFTER_MS;
    const codeExpiresAt = expiresAt(
      now,
      deleteAfter,
      ENTRY_CREDENTIAL_TTL_MS,
    );
    const entryCredential = await createEntryCredential(now, deleteAfter);
    const sessionId = await ctx.db.insert("sessions", {
      scenarioId,
      scenarioVersion,
      ownerSub,
      code,
      status: "lobby",
      codeExpiresAt,
      entryKeyHash: entryCredential.entryKeyHash,
      entryKeyExpiresAt: entryCredential.entryKeyExpiresAt,
      createdAt: now,
      deleteAfter,
    });

    await ctx.scheduler.runAt(
      deleteAfter,
      makeFunctionReference<"mutation">("cleanup:deleteExpired"),
      { sessionId },
    );
    await scheduleEntryCredentialExpiry(
      ctx.scheduler,
      sessionId,
      entryCredential.entryKeyExpiresAt,
    );

    return {
      sessionId,
      code,
      deleteAfter,
      codeExpiresAt,
      entryKey: entryCredential.entryKey,
      entryKeyExpiresAt: entryCredential.entryKeyExpiresAt,
    };
  },
});

export const current = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const ownerSub = await requireTeacher(ctx);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_owner", (query) => query.eq("ownerSub", ownerSub))
      .order("desc")
      .filter((query) => query.gt(query.field("deleteAfter"), Date.now()))
      .first();
    return session ? publicSession(session) : null;
  },
});

export const rotateEntryKey = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "lobby") {
      throw new Error("입장 대기 중인 활동에서만 QR을 새로 만들 수 있습니다.");
    }
    const now = Date.now();
    const credential = await createEntryCredential(now, session.deleteAfter);
    const codeExpiresAt = expiresAt(
      now,
      session.deleteAfter,
      ENTRY_CREDENTIAL_TTL_MS,
    );
    await ctx.db.patch(args.sessionId, {
      codeExpiresAt,
      entryKeyHash: credential.entryKeyHash,
      entryKeyExpiresAt: credential.entryKeyExpiresAt,
    });
    await scheduleEntryCredentialExpiry(
      ctx.scheduler,
      args.sessionId,
      credential.entryKeyExpiresAt,
    );
    return {
      entryKey: credential.entryKey,
      entryKeyExpiresAt: credential.entryKeyExpiresAt,
      codeExpiresAt,
    };
  },
});

export const seedSyntheticStudents = mutationGeneric({
  args: { sessionId: v.id("sessions"), count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "lobby") {
      throw new Error("대기 중인 활동만 채울 수 있습니다.");
    }
    const existing = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    if (existing.length > 0) throw new Error("이미 참여자가 있는 활동입니다.");

    const count = Math.max(1, Math.min(args.count ?? 8, ALIASES.length));
    const aliases = pickUniqueAliases(count);
    const now = Date.now();
    for (let index = 0; index < count; index += 1) {
      const tokenHash = await hashStudentToken(
        `synthetic-${args.sessionId}-${index}-${Math.random()}`,
      );
      await ctx.db.insert("players", {
        sessionId: args.sessionId,
        tokenHash,
        alias: aliases[index],
        stage: "lobby",
        joinedAt: now + index,
        updatedAt: now + index,
        isSynthetic: true,
      });
    }
    return count;
  },
});

async function assignSessionGroups(
  ctx: GenericMutationCtx<GenericDataModel>,
  sessionId: GenericId<"sessions">,
  scenarioId: string,
  scenarioVersion: number,
) {
  const scenario = getScenario(scenarioId, scenarioVersion);
  if (!scenario) throw new Error("활동 버전을 찾을 수 없습니다.");
  const players = await ctx.db
    .query("players")
    .withIndex("by_session", (query) => query.eq("sessionId", sessionId))
    .collect();
  if (players.length < 3) throw new Error("학생이 3명 이상 입장해야 합니다.");

  const usedAliases = new Set(
    players.map((player) => player.alias).filter(Boolean),
  );
  const remainingAliases = pickUniqueAliases(ALIASES.length).filter(
    (alias) => !usedAliases.has(alias),
  );
  const assignments = assignGroups(
    players.map((player) =>
      (player._id as GenericId<"players">).toString()
    ),
    4,
    Math.random,
    scenario,
  );
  const byPlayer = new Map(
    assignments.map((assignment) => [assignment.participantKey, assignment]),
  );
  let aliasIndex = 0;
  const now = Date.now();
  for (const player of players) {
    const playerId = player._id as GenericId<"players">;
    const assignment = byPlayer.get(playerId.toString());
    if (!assignment) throw new Error("모둠 배정에 실패했습니다.");
    await ctx.db.patch(playerId, {
      alias: player.alias ?? remainingAliases[aliasIndex++],
      groupNumber: assignment.groupNumber,
      roleId: assignment.roleId,
      updatedAt: now,
    });
  }
  return assignments;
}

export const previewGroups = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "lobby") {
      throw new Error("입장 대기 중인 활동만 미리 볼 수 있습니다.");
    }
    const assignments = await assignSessionGroups(
      ctx,
      args.sessionId,
      session.scenarioId,
      session.scenarioVersion,
    );
    const now = Date.now();
    await ctx.db.patch(args.sessionId, {
      status: "preview",
      codeExpiresAt: now,
      entryKeyHash: undefined,
      entryKeyExpiresAt: undefined,
    });
    return {
      groups: new Set(assignments.map((item) => item.groupNumber)).size,
      players: assignments.length,
    };
  },
});

export const reshuffleGroups = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "preview") {
      throw new Error("모둠 미리보기 중에만 다시 섞을 수 있습니다.");
    }
    const assignments = await assignSessionGroups(
      ctx,
      args.sessionId,
      session.scenarioId,
      session.scenarioVersion,
    );
    return {
      groups: new Set(assignments.map((item) => item.groupNumber)).size,
      players: assignments.length,
    };
  },
});

export const confirmStart = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "preview") {
      throw new Error("모둠 미리보기를 먼저 확인해 주세요.");
    }
    if (!getScenario(session.scenarioId, session.scenarioVersion)) {
      throw new Error("활동 버전을 찾을 수 없습니다.");
    }
    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    if (
      players.length < 3
      || players.some((player) => !player.groupNumber || !player.roleId)
    ) {
      throw new Error("모둠 배정 정보가 완전하지 않습니다. 다시 미리 봐 주세요.");
    }
    const groupNumbers = [...new Set(
      players.map((player) => player.groupNumber!),
    )];
    const now = Date.now();
    for (const player of players) {
      await ctx.db.patch(player._id, { stage: "role", updatedAt: now });
    }
    for (const groupNumber of groupNumbers) {
      await ctx.db.insert("rooms", {
        sessionId: args.sessionId,
        groupNumber,
        stage: "role",
        updatedAt: now,
      });
    }
    await ctx.db.patch(args.sessionId, {
      status: "active",
      startedAt: now,
      codeExpiresAt: now,
      entryKeyHash: undefined,
      entryKeyExpiresAt: undefined,
    });
    return { groups: groupNumbers.length, players: players.length };
  },
});

export const cancelPreview = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "preview") {
      throw new Error("모둠 미리보기 중에만 대기로 돌아갈 수 있습니다.");
    }
    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    const now = Date.now();
    for (const player of players) {
      await ctx.db.patch(player._id, {
        groupNumber: undefined,
        roleId: undefined,
        updatedAt: now,
      });
    }
    const credential = await createEntryCredential(now, session.deleteAfter);
    const codeExpiresAt = expiresAt(
      now,
      session.deleteAfter,
      ENTRY_CREDENTIAL_TTL_MS,
    );
    await ctx.db.patch(args.sessionId, {
      status: "lobby",
      codeExpiresAt,
      entryKeyHash: credential.entryKeyHash,
      entryKeyExpiresAt: credential.entryKeyExpiresAt,
    });
    await scheduleEntryCredentialExpiry(
      ctx.scheduler,
      args.sessionId,
      credential.entryKeyExpiresAt,
    );
    return {
      entryKey: credential.entryKey,
      entryKeyExpiresAt: credential.entryKeyExpiresAt,
      codeExpiresAt,
    };
  },
});

export const togglePause = mutationGeneric({
  args: { sessionId: v.id("sessions"), paused: v.boolean() },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "active") {
      throw new Error("진행 중인 활동에서만 멈출 수 있습니다.");
    }
    await ctx.db.patch(args.sessionId, {
      pausedAt: args.paused ? Date.now() : undefined,
    });
    return { paused: args.paused };
  },
});

export const advanceStage = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "active" || session.pausedAt) {
      throw new Error("진행 중이며 멈추지 않은 활동에서만 단계를 진행할 수 있습니다.");
    }
    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    const earliest = players.reduce<Stage>((minimum, player) => {
      const stage = player.stage as Stage;
      return STUDENT_STAGE_ORDER.indexOf(stage)
          < STUDENT_STAGE_ORDER.indexOf(minimum)
        ? stage
        : minimum;
    }, "finished");
    if (!["role", "first", "share"].includes(earliest)) {
      throw new Error("공동 초안 이후는 학생 전원 확인으로 진행합니다.");
    }
    if (earliest === "first" && players.some((player) => !player.submittedAt)) {
      throw new Error("모든 학생의 최초 판단 완료를 기다려 주세요.");
    }
    if (earliest === "share" && players.some((player) => !player.sharedAt)) {
      throw new Error("모든 학생의 자료 설명 완료를 기다려 주세요.");
    }
    const nextStage = STUDENT_STAGE_ORDER[
      STUDENT_STAGE_ORDER.indexOf(earliest) + 1
    ];
    const now = Date.now();
    for (const player of players) {
      if (player.stage === earliest) {
        await ctx.db.patch(player._id, { stage: nextStage, updatedAt: now });
      }
    }
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    for (const room of rooms) {
      if (room.stage === earliest) {
        await ctx.db.patch(room._id, { stage: nextStage, updatedAt: now });
      }
    }
    return { stage: nextStage };
  },
});

export const dashboard = queryGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    const scenario = getScenario(session.scenarioId, session.scenarioVersion);
    if (!scenario) throw new Error("활동 버전을 찾을 수 없습니다.");
    const [players, rooms, interventions, drafts, helpRequests] =
      await Promise.all([
        ctx.db
          .query("players")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .collect(),
        ctx.db
          .query("rooms")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .collect(),
        ctx.db
          .query("interventions")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .collect(),
        ctx.db
          .query("drafts")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .collect(),
        ctx.db
          .query("helpRequests")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .collect(),
      ]);

    return {
      session: publicSession(session),
      players: players.map((player) => {
        const role = roleById(scenario, player.roleId);
        return {
          id: player._id,
          alias: player.alias ?? "호 미선택",
          groupNumber: player.groupNumber,
          roleId: player.roleId,
          roleName: role?.name,
          roleIcon: role?.icon,
          stage: player.stage,
          submittedAt: player.submittedAt,
          sharedAt: player.sharedAt,
          confirmedRevision: player.confirmedRevision,
          isSynthetic: player.isSynthetic,
        };
      }),
      rooms: rooms.map((room) => {
        const members = players.filter(
          (player) => player.groupNumber === room.groupNumber,
        );
        const draft = drafts.find(
          (item) => item.groupNumber === room.groupNumber,
        );
        return {
          ...room,
          completed: members.filter((member) => member.stage === "finished").length,
          total: members.length,
          confirmed: draft
            ? members.filter(
                (member) => member.confirmedRevision === draft.revision,
              ).length
            : 0,
          revision: draft?.revision,
        };
      }),
      interventions,
      drafts: drafts.map((draft) => ({
        groupNumber: draft.groupNumber,
        revision: draft.revision,
      })),
      helpRequests,
    };
  },
});

export const resolveHelp = mutationGeneric({
  args: { sessionId: v.id("sessions"), groupNumber: v.number() },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    await requireOwnedSession(ctx, args.sessionId, teacherSub);
    const request = await ctx.db
      .query("helpRequests")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) => query.and(
        query.eq(query.field("groupNumber"), args.groupNumber),
        query.eq(query.field("resolvedAt"), undefined),
      ))
      .first();
    if (!request) return { resolved: false };
    await ctx.db.patch(request._id, { resolvedAt: Date.now() });
    return { resolved: true };
  },
});

export const end = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    await requireOwnedSession(ctx, args.sessionId, teacherSub);
    return { deleted: await deleteSessionData(ctx, args.sessionId) };
  },
});
