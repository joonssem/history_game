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
import { getScenario, roleById } from "./scenarios";
import { findStudent, hashStudentToken, requireStudent } from "./security";

const JOIN_ERROR =
  "입장 정보를 확인할 수 없습니다. QR을 다시 찍거나 수업 코드를 확인해 주세요.";

type MutationCtx = GenericMutationCtx<GenericDataModel>;
type SessionRecord = {
  _id: GenericId<"sessions">;
  scenarioId: string;
  scenarioVersion: number;
  status: "lobby" | "preview" | "active";
  createdAt: number;
  deleteAfter: number;
  pausedAt?: number;
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

async function admitStudent(ctx: MutationCtx, session: SessionRecord) {
  const currentPlayers = await ctx.db
    .query("players")
    .withIndex("by_session", (query) => query.eq("sessionId", session._id))
    .collect();
  if (currentPlayers.length >= ALIASES.length) throw new Error(JOIN_ERROR);

  const token = createOpaqueToken();
  const now = Date.now();
  await ctx.db.insert("players", {
    sessionId: session._id,
    tokenHash: await hashStudentToken(token),
    tokenExpiresAt: expiresAt(now, session.deleteAfter, STUDENT_TOKEN_TTL_MS),
    stage: "lobby",
    joinedAt: now,
    updatedAt: now,
    isSynthetic: false,
  });

  const used = new Set(
    currentPlayers.map((player) => player.alias).filter(Boolean),
  );
  const aliasCandidates = shuffle(
    ALIASES.filter((alias) => !used.has(alias)),
  ).slice(0, 4);
  return { sessionId: session._id, token, aliasCandidates };
}

async function requireActiveSession(
  ctx: MutationCtx,
  sessionId: GenericId<"sessions">,
) {
  const rawSession = await ctx.db.get(sessionId);
  const session = rawSession as SessionRecord | null;
  if (
    !session
    || session.deleteAfter <= Date.now()
    || session.status !== "active"
  ) {
    throw new Error("진행 중인 활동이 아닙니다.");
  }
  if (session.pausedAt) {
    throw new Error("선생님이 잠시 멈췄습니다. 안내를 기다려 주세요.");
  }
  const scenario = getScenario(session.scenarioId, session.scenarioVersion);
  if (!scenario) throw new Error("활동 버전을 찾을 수 없습니다.");
  return { session, scenario };
}

async function groupPlayers(
  ctx: MutationCtx,
  sessionId: GenericId<"sessions">,
  groupNumber: number,
) {
  return await ctx.db
    .query("players")
    .withIndex("by_session", (query) => query.eq("sessionId", sessionId))
    .filter((query) => query.eq(query.field("groupNumber"), groupNumber))
    .collect();
}

async function updateRoomStage(
  ctx: MutationCtx,
  sessionId: GenericId<"sessions">,
  groupNumber: number,
  stage: Stage,
) {
  const room = await ctx.db
    .query("rooms")
    .withIndex("by_session", (query) => query.eq("sessionId", sessionId))
    .filter((query) => query.eq(query.field("groupNumber"), groupNumber))
    .unique();
  if (room) {
    await ctx.db.patch(room._id as GenericId<"rooms">, {
      stage,
      updatedAt: Date.now(),
    });
  }
}

export const joinWithEntryKey = mutationGeneric({
  args: { entryKey: v.string() },
  handler: async (ctx, args) => {
    if (!/^[0-9a-f]{64}$/.test(args.entryKey)) throw new Error(JOIN_ERROR);
    const entryKeyHash = await sha256Hex(args.entryKey);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_entry_key_hash", (query) =>
        query.eq("entryKeyHash", entryKeyHash),
      )
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
    return await admitStudent(ctx, session as SessionRecord);
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
      hmacSha256Hex(
        secret,
        "browser",
        hasValidAttemptShape ? args.attemptId : "invalid",
      ),
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
      ?? (session
        ? Math.min(
            session.createdAt + ENTRY_CREDENTIAL_TTL_MS,
            session.deleteAfter,
          )
        : undefined);
    if (
      !session
      || session.deleteAfter <= now
      || session.status !== "lobby"
      || !isCredentialActive(codeExpiresAt, now)
    ) {
      await recordFailure(
        ctx,
        browserBucketHash,
        BROWSER_ATTEMPT_POLICY,
        now,
        session?._id,
      );
      await recordFailure(
        ctx,
        codeBucketHash,
        CODE_ATTEMPT_POLICY,
        now,
        session?._id,
      );
      return { ok: false as const, error: JOIN_ERROR };
    }

    if (browserAttempt) await ctx.db.delete(browserAttempt._id);
    return {
      ok: true as const,
      ...(await admitStudent(ctx, session as SessionRecord)),
    };
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
    const scenario = getScenario(session.scenarioId, session.scenarioVersion);
    if (!scenario) return null;

    const groupNumber = player.groupNumber;
    const groupMembers = groupNumber
      ? await ctx.db
          .query("players")
          .withIndex("by_session", (query) =>
            query.eq("sessionId", args.sessionId),
          )
          .filter((query) =>
            query.eq(query.field("groupNumber"), groupNumber),
          )
          .collect()
      : [];
    const [intervention, draft, helpRequest] = groupNumber
      ? await Promise.all([
          ctx.db
            .query("interventions")
            .withIndex("by_session", (query) =>
              query.eq("sessionId", args.sessionId),
            )
            .filter((query) =>
              query.eq(query.field("groupNumber"), groupNumber),
            )
            .order("desc")
            .first(),
          ctx.db
            .query("drafts")
            .withIndex("by_session", (query) =>
              query.eq("sessionId", args.sessionId),
            )
            .filter((query) =>
              query.eq(query.field("groupNumber"), groupNumber),
            )
            .unique(),
          ctx.db
            .query("helpRequests")
            .withIndex("by_session", (query) =>
              query.eq("sessionId", args.sessionId),
            )
            .filter((query) => query.and(
              query.eq(query.field("groupNumber"), groupNumber),
              query.eq(query.field("resolvedAt"), undefined),
            ))
            .first(),
        ])
      : [null, null, null];

    const ownRole = roleById(scenario, player.roleId);
    const canSeeSharedEvidence = ["draft", "confirm", "finished"].includes(
      player.stage,
    ) && groupMembers.every((member) => Boolean(member.sharedAt));
    const groupSize = groupMembers.length as 3 | 4 | 5;
    const evidenceRoles = canSeeSharedEvidence
      ? groupMembers.flatMap((member) => {
          const role = roleById(scenario, member.roleId);
          return role
            ? [{
                id: role.id,
                name: role.name,
                evidence: role.evidence.map((item) => ({ ...item })),
              }]
            : [];
        })
      : [];

    return {
      sessionStatus: session.status,
      paused: Boolean(session.pausedAt),
      scenario: scenario.publicMeta,
      sharedPrompt: scenario.sharedPrompt,
      commonEvidence: canSeeSharedEvidence && [3, 4, 5].includes(groupSize)
        ? scenario.commonEvidenceByGroupSize[groupSize].map((item) => ({ ...item }))
        : [],
      evidenceRoles,
      alias: player.alias,
      groupNumber,
      stage: player.stage as Stage,
      role: ownRole
        ? {
            id: ownRole.id,
            icon: ownRole.icon,
            name: ownRole.name,
            privateInfo: ownRole.privateInfo,
            interest: ownRole.interest,
            firstChoices: ownRole.firstChoices.map((item) => ({ ...item })),
            evidence: ownRole.evidence.map((item) => ({ ...item })),
          }
        : null,
      firstSubmitted: Boolean(player.submittedAt),
      sharedAt: Boolean(player.sharedAt),
      sharing: groupNumber
        ? {
            completed: groupMembers.filter((member) => Boolean(member.sharedAt)).length,
            total: groupMembers.length,
          }
        : null,
      draft: draft
        ? {
            policyIds: draft.policyIds,
            evidenceRoleIds: draft.evidenceRoleIds,
            limitationId: draft.limitationId,
            connectionId: draft.connectionId,
            revision: draft.revision,
          }
        : null,
      confirmation: draft
        ? {
            confirmed: groupMembers.filter(
              (member) => member.confirmedRevision === draft.revision,
            ).length,
            total: groupMembers.length,
          }
        : null,
      confirmedRevision: player.confirmedRevision,
      helpRequested: Boolean(helpRequest),
      intervention: intervention
        ? { kind: intervention.kind, message: intervention.message }
        : null,
    };
  },
});

export const advance = mutationGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    const stage = player.stage as Stage;
    if (!STUDENT_STAGE_ORDER.includes(stage)) {
      throw new Error("학생 단계가 올바르지 않습니다.");
    }
    if (stage === "first" && !player.submittedAt) {
      throw new Error("내 최초 판단을 이 기기에서 먼저 확인해 주세요.");
    }
    if (stage === "share") {
      if (!player.sharedAt) {
        throw new Error("자료를 말한 뒤 ‘설명했어요’를 눌러 주세요.");
      }
      if (!player.groupNumber) throw new Error("모둠 배정 정보가 없습니다.");
      const members = await groupPlayers(
        ctx,
        args.sessionId,
        player.groupNumber,
      );
      if (members.some((member) => !member.sharedAt)) {
        throw new Error("모둠 친구 모두가 자료를 설명할 때까지 기다려 주세요.");
      }
    }
    if (["draft", "confirm", "finished"].includes(stage)) {
      throw new Error("공동 초안과 전원 확인은 아래 전용 버튼으로 진행합니다.");
    }

    const stageIndex = STUDENT_STAGE_ORDER.indexOf(stage);
    const nextStage = STUDENT_STAGE_ORDER[
      Math.min(stageIndex + 1, STUDENT_STAGE_ORDER.length - 1)
    ];
    const now = Date.now();
    await ctx.db.patch(player._id, { stage: nextStage, updatedAt: now });

    if (player.groupNumber) {
      const members = await groupPlayers(
        ctx,
        args.sessionId,
        player.groupNumber,
      );
      const memberStages = members.map((member) =>
        member._id === player._id ? nextStage : member.stage as Stage
      );
      const minimumStage = memberStages.reduce<Stage>((minimum, current) =>
        STUDENT_STAGE_ORDER.indexOf(current)
            < STUDENT_STAGE_ORDER.indexOf(minimum)
          ? current
          : minimum
      , "finished");
      await updateRoomStage(
        ctx,
        args.sessionId,
        player.groupNumber,
        minimumStage,
      );
    }
    return nextStage;
  },
});

export const completeFirst = mutationGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    if (player.stage !== "first") {
      throw new Error("최초 판단 단계에서만 확인할 수 있습니다.");
    }
    const now = Date.now();
    await ctx.db.patch(player._id, { submittedAt: now, updatedAt: now });
    return { complete: true };
  },
});

export const markShared = mutationGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    if (player.stage !== "share") {
      throw new Error("자료 말하기 단계에서만 확인할 수 있습니다.");
    }
    const now = Date.now();
    await ctx.db.patch(player._id, { sharedAt: now, updatedAt: now });
    return { complete: true };
  },
});

export const saveDraft = mutationGeneric({
  args: {
    sessionId: v.id("sessions"),
    token: v.string(),
    policyIds: v.array(v.string()),
    evidenceRoleIds: v.array(v.string()),
    limitationId: v.string(),
    connectionId: v.string(),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const { scenario } = await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    if (
      !player.groupNumber
      || !["draft", "confirm"].includes(player.stage)
    ) {
      throw new Error("공동 초안 단계에서만 저장할 수 있습니다.");
    }

    const members = await groupPlayers(ctx, args.sessionId, player.groupNumber);
    if (members.some((member) => !member.sharedAt)) {
      throw new Error("모둠 친구 모두가 자료를 설명한 뒤 초안을 만들 수 있습니다.");
    }
    if (
      args.policyIds.length !== 2
      || new Set(args.policyIds).size !== 2
      || !args.policyIds.every((id) =>
        scenario.sharedPrompt.policies.some((policy) => policy.id === id)
      )
    ) {
      throw new Error("서로 다른 정책 두 가지를 선택해 주세요.");
    }
    if (
      args.evidenceRoleIds.length !== 2
      || new Set(args.evidenceRoleIds).size !== 2
      || !args.evidenceRoleIds.every((roleId) =>
        members.some((member) => member.roleId === roleId)
      )
    ) {
      throw new Error("이 모둠의 서로 다른 역할 근거 두 가지를 선택해 주세요.");
    }
    if (!scenario.sharedPrompt.limitations.some(
      (item) => item.id === args.limitationId,
    )) {
      throw new Error("자료의 한계를 하나 선택해 주세요.");
    }
    if (!scenario.sharedPrompt.connections.some(
      (item) => item.id === args.connectionId,
    )) {
      throw new Error("두 정책이 함께 필요한 까닭을 하나 선택해 주세요.");
    }

    const existing = await ctx.db
      .query("drafts")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) =>
        query.eq(query.field("groupNumber"), player.groupNumber!),
      )
      .unique();
    if (args.expectedRevision !== (existing?.revision ?? 0)) {
      throw new Error("다른 탭에서 초안이 바뀌었습니다. 최신 초안을 확인해 주세요.");
    }

    const revision = (existing?.revision ?? 0) + 1;
    const now = Date.now();
    const draftValues = {
      policyIds: args.policyIds,
      evidenceRoleIds: args.evidenceRoleIds,
      limitationId: args.limitationId,
      connectionId: args.connectionId,
      revision,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, draftValues);
    } else {
      await ctx.db.insert("drafts", {
        sessionId: args.sessionId,
        groupNumber: player.groupNumber,
        ...draftValues,
      });
    }
    for (const member of members) {
      await ctx.db.patch(member._id as GenericId<"players">, {
        confirmedRevision: undefined,
        stage: "confirm",
        updatedAt: now,
      });
    }
    await updateRoomStage(
      ctx,
      args.sessionId,
      player.groupNumber,
      "confirm",
    );
    return { revision };
  },
});

export const confirmDraft = mutationGeneric({
  args: {
    sessionId: v.id("sessions"),
    token: v.string(),
    revision: v.number(),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    if (!player.groupNumber || player.stage !== "confirm") {
      throw new Error("전원 확인 단계에서만 할 수 있습니다.");
    }
    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) =>
        query.eq(query.field("groupNumber"), player.groupNumber!),
      )
      .unique();
    if (!draft || draft.revision !== args.revision) {
      throw new Error("최신 공동 초안을 다시 확인해 주세요.");
    }

    const now = Date.now();
    await ctx.db.patch(player._id, {
      confirmedRevision: draft.revision,
      updatedAt: now,
    });
    const members = await groupPlayers(ctx, args.sessionId, player.groupNumber);
    const complete = members.every((member) =>
      member._id === player._id
        || member.confirmedRevision === draft.revision
    );
    if (complete) {
      for (const member of members) {
        await ctx.db.patch(member._id as GenericId<"players">, {
          stage: "finished",
          updatedAt: now,
        });
      }
      await updateRoomStage(
        ctx,
        args.sessionId,
        player.groupNumber,
        "finished",
      );
    }
    return { complete };
  },
});

export const requestHelp = mutationGeneric({
  args: { sessionId: v.id("sessions"), token: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionId);
    const player = await requireStudent(ctx, args.sessionId, args.token);
    if (!player.groupNumber) {
      throw new Error("모둠이 배정된 뒤 도움을 요청할 수 있습니다.");
    }
    const existing = await ctx.db
      .query("helpRequests")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) => query.and(
        query.eq(query.field("groupNumber"), player.groupNumber!),
        query.eq(query.field("resolvedAt"), undefined),
      ))
      .first();
    if (!existing) {
      await ctx.db.insert("helpRequests", {
        sessionId: args.sessionId,
        groupNumber: player.groupNumber,
        requestedAt: Date.now(),
      });
    }
    return { requested: true };
  },
});
