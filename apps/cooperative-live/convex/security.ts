import type {
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { GenericId } from "convex/values";

import { STUDENT_TOKEN_TTL_MS, sha256Hex } from "../shared/join-security";

type SessionRecord = {
  _id: GenericId<"sessions">;
  scenarioId: string;
  scenarioVersion: number;
  ownerSub: string;
  status: "lobby" | "preview" | "active";
  code: string;
  codeExpiresAt?: number;
  entryKeyHash?: string;
  entryKeyExpiresAt?: number;
  createdAt: number;
  startedAt?: number;
  pausedAt?: number;
  deleteAfter: number;
};

export type StudentRecord = {
  _id: GenericId<"players">;
  sessionId: GenericId<"sessions">;
  tokenHash: string;
  tokenExpiresAt?: number;
  alias?: string;
  groupNumber?: number;
  roleId?: string;
  stage: string;
  submittedAt?: number;
  sharedAt?: number;
  confirmedRevision?: number;
  participationStatus?: "active" | "removed";
  lastSeenAt?: number;
  removedAt?: number;
  removedBy?: string;
  recoveryTokenHash?: string;
  recoveryTokenExpiresAt?: number;
  acknowledgedInterventionId?: GenericId<"interventions">;
  isSynthetic: boolean;
};

export function isActiveStudent(player: { participationStatus?: string }) {
  return player.participationStatus !== "removed";
}

type ReadCtx =
  | GenericQueryCtx<GenericDataModel>
  | GenericMutationCtx<GenericDataModel>;

export const hashStudentToken = sha256Hex;

export const TEACHER_OWNER_ID = "passcode-teacher";
export const TEACHER_LOGIN_REQUIRED = "교사 로그인이 필요합니다.";

export function configuredTeacherPasscode() {
  const passcode = process.env.TEACHER_PASSCODE ?? "";
  return passcode.length >= 8 ? passcode : null;
}

export async function requireTeacher(
  ctx: ReadCtx,
  teacherToken: string | undefined,
): Promise<string> {
  const passcode = configuredTeacherPasscode();
  if (!passcode || !teacherToken || teacherToken.length < 32) {
    throw new Error(TEACHER_LOGIN_REQUIRED);
  }
  const tokenHash = await sha256Hex(teacherToken);
  const login = await ctx.db
    .query("teacherLogins")
    .withIndex("by_token_hash", (query) => query.eq("tokenHash", tokenHash))
    .unique() as { passcodeHash: string; expiresAt: number } | null;
  // 비밀번호를 바꾸면 이전 로그인은 모두 무효가 된다.
  if (
    !login
    || login.expiresAt <= Date.now()
    || login.passcodeHash !== await sha256Hex(passcode)
  ) {
    throw new Error(TEACHER_LOGIN_REQUIRED);
  }
  return TEACHER_OWNER_ID;
}

export async function requireOwnedSession(
  ctx: ReadCtx,
  sessionId: GenericId<"sessions">,
  teacherSub: string,
) {
  const session = await ctx.db.get(sessionId);
  if (!session || session.ownerSub !== teacherSub) {
    throw new Error("활동을 찾을 수 없거나 관리 권한이 없습니다.");
  }
  return session as SessionRecord;
}

export async function findStudent(
  ctx: ReadCtx,
  sessionId: GenericId<"sessions">,
  token: string,
) {
  if (token.length < 32) return null;
  const tokenHash = await hashStudentToken(token);
  const player = await ctx.db
    .query("players")
    .filter((query) =>
      query.and(
        query.eq(query.field("sessionId"), sessionId),
        query.eq(query.field("tokenHash"), tokenHash),
      ),
    )
    .unique();
  if (!player) return null;
  const typedPlayer = player as StudentRecord & { joinedAt?: number };
  const tokenExpiresAt = typedPlayer.tokenExpiresAt
    ?? (typedPlayer.joinedAt ?? 0) + STUDENT_TOKEN_TTL_MS;
  return tokenExpiresAt > Date.now() ? typedPlayer : null;
}

export async function requireStudent(
  ctx: ReadCtx,
  sessionId: GenericId<"sessions">,
  token: string,
) {
  const player = await findStudent(ctx, sessionId, token);
  if (!player) throw new Error("학생 접속 정보가 만료되었습니다.");
  if (!isActiveStudent(player)) {
    throw new Error("이 자리는 수업에서 제외되었습니다. 선생님께 자리 다시 연결을 요청하세요.");
  }
  return player;
}
