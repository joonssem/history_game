import type {
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { GenericId } from "convex/values";

type SessionRecord = {
  _id: GenericId<"sessions">;
  ownerSub: string;
  status: "lobby" | "active";
  code: string;
  deleteAfter: number;
};

export type StudentRecord = {
  _id: GenericId<"players">;
  sessionId: GenericId<"sessions">;
  tokenHash: string;
  alias?: string;
  groupNumber?: number;
  roleId?: string;
  stage: string;
  submittedAt?: number;
  isSynthetic: boolean;
};

type ReadCtx =
  | GenericQueryCtx<GenericDataModel>
  | GenericMutationCtx<GenericDataModel>;

export async function hashStudentToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function requireTeacher(ctx: ReadCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("교사 로그인이 필요합니다.");

  const allowed = (process.env.TEACHER_AUTH0_SUBS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!allowed.includes(identity.subject)) {
    throw new Error("이 계정에는 교사 대시보드 권한이 없습니다.");
  }
  return identity.subject;
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

export async function requireStudent(
  ctx: ReadCtx,
  sessionId: GenericId<"sessions">,
  token: string,
) {
  if (token.length < 32) throw new Error("학생 접속 정보가 올바르지 않습니다.");
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
  if (!player) throw new Error("학생 접속 정보가 만료되었습니다.");
  return player as StudentRecord;
}
