import { makeFunctionReference, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  ALIASES,
  SCENARIO_ID,
  assignGroups,
  pickUniqueAliases,
} from "../shared/scenario";
import { deleteSessionData } from "./data";
import { hashStudentToken, requireOwnedSession, requireTeacher } from "./security";

const EXPIRES_AFTER_MS = 2 * 60 * 60 * 1000;

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const create = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const ownerSub = await requireTeacher(ctx);
    let code = makeCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_code", (query) => query.eq("code", code))
        .unique();
      if (!existing) break;
      code = makeCode();
    }

    const now = Date.now();
    const deleteAfter = now + EXPIRES_AFTER_MS;
    const sessionId = await ctx.db.insert("sessions", {
      scenarioId: SCENARIO_ID,
      ownerSub,
      code,
      status: "lobby",
      createdAt: now,
      deleteAfter,
    });

    await ctx.scheduler.runAt(
      deleteAfter,
      makeFunctionReference<"mutation">("cleanup:deleteExpired"),
      { sessionId },
    );

    return { sessionId, code, deleteAfter };
  },
});

export const seedSyntheticStudents = mutationGeneric({
  args: { sessionId: v.id("sessions"), count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "lobby") throw new Error("대기 중인 활동만 채울 수 있습니다.");

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

export const start = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "lobby") throw new Error("이미 시작한 활동입니다.");

    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    if (players.length < 3) throw new Error("학생이 3명 이상 입장해야 합니다.");

    const usedAliases = new Set(players.map((player) => player.alias).filter(Boolean));
    const remainingAliases = pickUniqueAliases(ALIASES.length).filter(
      (alias) => !usedAliases.has(alias),
    );
    let aliasIndex = 0;
    const assignments = assignGroups(
      players.map((player) => player._id.toString()),
      4,
    );
    const byPlayer = new Map(
      assignments.map((assignment) => [assignment.participantKey, assignment]),
    );
    const now = Date.now();

    for (const player of players) {
      const assignment = byPlayer.get(player._id.toString());
      if (!assignment) throw new Error("모둠 배정에 실패했습니다.");
      await ctx.db.patch(player._id, {
        alias: player.alias ?? remainingAliases[aliasIndex++],
        groupNumber: assignment.groupNumber,
        roleId: assignment.roleId,
        stage: "role",
        updatedAt: now,
      });
    }

    const groupNumbers = [...new Set(assignments.map((item) => item.groupNumber))];
    for (const groupNumber of groupNumbers) {
      await ctx.db.insert("rooms", {
        sessionId: args.sessionId,
        groupNumber,
        stage: "role",
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.sessionId, { status: "active", startedAt: now });
    return { groups: groupNumbers.length, players: players.length };
  },
});

export const dashboard = queryGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    const [players, rooms, interventions] = await Promise.all([
      ctx.db
        .query("players")
        .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
        .collect(),
      ctx.db
        .query("rooms")
        .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
        .collect(),
      ctx.db
        .query("interventions")
        .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
        .collect(),
    ]);

    return {
      session,
      players: players.map((player) => ({
        id: player._id,
        alias: player.alias ?? "호 미선택",
        groupNumber: player.groupNumber,
        roleId: player.roleId,
        stage: player.stage,
        submittedAt: player.submittedAt,
        isSynthetic: player.isSynthetic,
      })),
      rooms,
      interventions,
    };
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
