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
  STUDENT_STAGE_ORDER,
  nextStudentStage,
  roleById,
  shuffle,
  type Stage,
} from "../shared/scenario";
import {
  BROWSER_ATTEMPT_POLICY,
  CODE_ATTEMPT_POLICY,
  ENTRY_CREDENTIAL_TTL_MS,
  STUDENT_TOKEN_TTL_MS,
  createOpaqueToken,
  expiresAt,
  hmacSha256Hex,
  isAttemptBlocked,
  isCredentialActive,
  nextFailureState,
  sha256Hex,
  type AttemptPolicy,
  type AttemptState,
} from "../shared/join-security";
import {
  findStudent,
  hashStudentToken,
  requireStudent,
} from "./security";

const JOIN_ERROR = "입장 정보를 확인할 수 없습니다. QR을 다시 찍거나 수업 코드를 확인해 주세요.";

type MutationCtx = GenericMutationCtx<GenericDataModel>;
type JoinSession = {
  _id: GenericId<"sessions">;
  status: "lobby" | "preview" | "active";
  createdAt: number;
  deleteAfter: number;
  codeExpiresAt?: number;
  entryKeyExpiresAt?: number;
};

type JoinAttempt = AttemptState & {
  _id: GenericId<"joinAttempts">;
  bucketHash: string;
  sessionId?: GenericId<"sessions">;
};

function joinAttemptSecret() {
  const secret = process.env.JOIN_ATTEMPT_HMAC_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error("입장 보안 환경변수가 준비되지 않았습니다.");
  }
  return secret;
}

async function findAttempt(ctx: MutationCtx, bucketHash: string) {
  return await ctx.db
    .query("joinAttempts")
    .withIndex("by_bucket_hash", (query) => query.eq("bucketHash", bucketHash))
    .unique() as JoinAttempt | null;
}

async function recordFailure(
  ctx: MutationCtx,
  bucketHash: string,
  policy: AttemptPolicy,
  now: number,
  sessionId?: GenericId<"sessions">,
) {
  const current = await findAttempt(ctx, bucketHash);
  const next = nextFailureState(current, now, policy);
  const values = {
    sessionId: sessionId ?? current?.sessionId,
    failedAttempts: next.failedAttempts,
    windowStartedAt: next.windowStartedAt,
    blockedUntil: next.blockedUntil,
    deleteAfter: next.deleteAfter,
  };
  const attemptId = current?._id ?? await ctx.db.insert("joinAttempts", {
    bucketHash,
    ...(values.sessionId ? { sessionId: values.sessionId } : {}),
    failedAttempts: values.failedAttempts,
    windowStartedAt: values.windowStartedAt,
    ...(values.blockedUntil ? { blockedUntil: values.blockedUntil } : {}),
    deleteAfter: values.deleteAfter,
  });
  if (current) await ctx.db.patch(current._id, values);
  await ctx.scheduler.runAt(
    next.deleteAfter,
    makeFunctionReference<"mutation">("cleanup:deleteJoinAttempt"),
    { attemptId, expectedDeleteAfter: next.deleteAfter },
  );
}

async function admitStudent(ctx: MutationCtx, session: JoinSession) {
  const currentPlayers = await ctx.db
    .query("players")
    .withIndex("by_session", (query) => query.eq("sessionId", session._id))
    .collect();
  if (currentPlayers.length >= ALIASES.length) throw new Error(JOIN_ERROR);

  const token = createOpaqueToken();
  const tokenHash = await hashStudentToken(token);
  const now = Date.now();
  await ctx.db.insert("players", {
    sessionId: session._id,
    tokenHash,
    tokenExpiresAt: expiresAt(now, session.deleteAfter, STUDENT_TOKEN_TTL_MS),
    stage: "lobby",
    joinedAt: now,
    updatedAt: now,
    isSynthetic: false,
  });

  const used = new Set(currentPlayers.map((player) => player.alias).filter(Boolean));
  const aliasCandidates = shuffle(ALIASES.filter((alias) => !used.has(alias))).slice(0, 4);
  return { sessionId: session._id, token, aliasCandidates };
}

export const joinWithEntryKey = mutationGeneric({
  args: { entryKey: v.string() },
  handler: async (ctx, args) => {
    if (!/^[0-9a-f]{64}$/.test(args.entryKey)) throw new Error(JOIN_ERROR);
    const entryKeyHash = await sha256Hex(args.entryKey);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_entry_key_hash", (query) => query.eq("entryKeyHash", entryKeyHash))
      .unique();
    const now = Date.now();
    if (
      !session
      || session.deleteAfter <= now
      || session.status !== "lobby"
      || !isCredentialActive(session.entryKeyExpiresAt, now)
    ) {
      throw new Error(JOIN_ERROR);
    }
    return await admitStudent(ctx, session as JoinSession);
  },
});

export const joinWithCode = mutationGeneric({
  args: { code: v.string(), attemptId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const code = args.code.trim();
    const hasValidCodeShape = /^[0-9]{6}$/.test(code);
    const hasValidAttemptShape = /^[0-9a-f]{64}$/.test(args.attemptId);
    const secret = joinAttemptSecret();
    const [browserBucketHash, codeBucketHash] = await Promise.all([
      hmacSha256Hex(secret, "browser", hasValidAttemptShape ? args.attemptId : "invalid"),
      hmacSha256Hex(secret, "code", hasValidCodeShape ? code : "invalid"),
    ]);
    const [browserAttempt, codeAttempt] = await Promise.all([
      findAttempt(ctx, browserBucketHash),
      findAttempt(ctx, codeBucketHash),
    ]);
    if (
      isAttemptBlocked(browserAttempt, now)
      || isAttemptBlocked(codeAttempt, now)
    ) {
      return { ok: false as const, error: JOIN_ERROR };
    }

    const session = hasValidCodeShape && hasValidAttemptShape
      ? await ctx.db
          .query("sessions")
          .withIndex("by_code", (query) => query.eq("code", code))
          .unique()
      : null;
    const codeExpiresAt = session?.codeExpiresAt
      ?? (session ? Math.min(session.createdAt + ENTRY_CREDENTIAL_TTL_MS, session.deleteAfter) : undefined);
    if (
      !session
      || session.deleteAfter <= now
      || session.status !== "lobby"
      || !isCredentialActive(codeExpiresAt, now)
    ) {
      await recordFailure(ctx, browserBucketHash, BROWSER_ATTEMPT_POLICY, now, session?._id);
      await recordFailure(ctx, codeBucketHash, CODE_ATTEMPT_POLICY, now, session?._id);
      return { ok: false as const, error: JOIN_ERROR };
    }

    if (browserAttempt) await ctx.db.delete(browserAttempt._id);
    return { ok: true as const, ...(await admitStudent(ctx, session as JoinSession)) };
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
    if (!session || session.deleteAfter <= Date.now()) {
      throw new Error("활동을 찾을 수 없습니다.");
    }
    if (session.status === "preview") {
      throw new Error("선생님이 모둠을 확인하고 있습니다. 잠시만 기다려 주세요.");
    }
    if (session.status !== "lobby") throw new Error("호 선택 시간이 끝났습니다.");
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
    if (!session || session.deleteAfter <= Date.now()) return null;
    const player = await findStudent(ctx, args.sessionId, args.token);
    if (!player) return null;
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
