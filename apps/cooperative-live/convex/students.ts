import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  ALIASES,
  STUDENT_STAGE_ORDER,
  nextStudentStage,
  roleById,
  shuffle,
  type Stage,
} from "../shared/scenario";
import { hashStudentToken, requireStudent } from "./security";

export const join = mutationGeneric({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_code", (query) => query.eq("code", args.code.trim()))
      .unique();
    if (!session || session.status !== "lobby" || session.deleteAfter <= Date.now()) {
      throw new Error("입장할 수 있는 활동을 찾지 못했습니다.");
    }

    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const tokenHash = await hashStudentToken(token);
    const now = Date.now();
    await ctx.db.insert("players", {
      sessionId: session._id,
      tokenHash,
      stage: "lobby",
      joinedAt: now,
      updatedAt: now,
      isSynthetic: false,
    });

    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", session._id))
      .collect();
    const used = new Set(players.map((player) => player.alias).filter(Boolean));
    const aliasCandidates = shuffle(ALIASES.filter((alias) => !used.has(alias))).slice(0, 4);

    return { sessionId: session._id, token, aliasCandidates };
  },
});

export const selectAlias = mutationGeneric({
  args: {
    sessionId: v.id("sessions"),
    token: v.string(),
    alias: v.string(),
  },
  handler: async (ctx, args) => {
    if (!ALIASES.includes(args.alias as (typeof ALIASES)[number])) {
      throw new Error("선택할 수 없는 호입니다.");
    }
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "lobby") throw new Error("호 선택 시간이 끝났습니다.");
    const player = await requireStudent(ctx, args.sessionId, args.token);
    const duplicate = await ctx.db
      .query("players")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) => query.eq(query.field("alias"), args.alias))
      .first();
    if (duplicate && duplicate._id !== player._id) {
      throw new Error("다른 친구가 먼저 고른 호입니다. 다른 호를 골라 주세요.");
    }
    await ctx.db.patch(player._id, { alias: args.alias, updatedAt: Date.now() });
    return args.alias;
  },
});

export const view = queryGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    const player = await requireStudent(ctx, args.sessionId, args.token);
    const intervention = player.groupNumber
      ? await ctx.db
          .query("interventions")
          .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
          .filter((query) => query.eq(query.field("groupNumber"), player.groupNumber))
          .order("desc")
          .first()
      : null;

    return {
      sessionStatus: session.status,
      alias: player.alias,
      groupNumber: player.groupNumber,
      stage: player.stage as Stage,
      role: roleById(typeof player.roleId === "string" ? player.roleId : null),
      intervention: intervention
        ? { kind: intervention.kind, message: intervention.message }
        : null,
    };
  },
});

export const advance = mutationGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") throw new Error("진행 중인 활동이 아닙니다.");
    const player = await requireStudent(ctx, args.sessionId, args.token);
    const currentStage = player.stage as Stage;
    if (!STUDENT_STAGE_ORDER.includes(currentStage)) {
      throw new Error("학생 단계가 올바르지 않습니다.");
    }
    const nextStage = nextStudentStage(currentStage);
    const now = Date.now();
    await ctx.db.patch(player._id, {
      stage: nextStage,
      submittedAt: currentStage === "first" ? now : player.submittedAt,
      updatedAt: now,
    });

    if (player.groupNumber) {
      const groupPlayers = await ctx.db
        .query("players")
        .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
        .filter((query) => query.eq(query.field("groupNumber"), player.groupNumber))
        .collect();
      const minimumStage = groupPlayers.reduce<Stage>((minimum, item) => {
        const itemStage = item._id === player._id ? nextStage : (item.stage as Stage);
        return STUDENT_STAGE_ORDER.indexOf(itemStage) < STUDENT_STAGE_ORDER.indexOf(minimum)
          ? itemStage
          : minimum;
      }, "finished");
      const room = await ctx.db
        .query("rooms")
        .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
        .filter((query) => query.eq(query.field("groupNumber"), player.groupNumber))
        .unique();
      if (room) await ctx.db.patch(room._id, { stage: minimumStage, updatedAt: now });
    }
    return nextStage;
  },
});
