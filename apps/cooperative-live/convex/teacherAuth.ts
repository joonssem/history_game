import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  TEACHER_LOGIN_ATTEMPT_POLICY,
  TEACHER_LOGIN_TTL_MS,
  createOpaqueToken,
  isAttemptBlocked,
  sha256Hex,
} from "../shared/join-security";
import { configuredTeacherPasscode, requireTeacher } from "./security";
import { findAttempt, recordFailure } from "./students";

// 교사는 한 명이므로 실패 횟수도 하나의 버킷으로 센다.
const TEACHER_LOGIN_BUCKET = "teacher-login";
const LOGIN_ERROR = "비밀번호가 맞지 않습니다.";
const BLOCKED_ERROR = "비밀번호를 여러 번 틀려 잠시 잠겼습니다. 15분 뒤 다시 시도해 주세요.";

export const login = mutationGeneric({
  args: { passcode: v.string() },
  handler: async (ctx, args) => {
    const passcode = configuredTeacherPasscode();
    if (!passcode) {
      return { ok: false as const, error: "서버에 교사 비밀번호가 설정되지 않았습니다." };
    }
    const now = Date.now();
    if (isAttemptBlocked(await findAttempt(ctx, TEACHER_LOGIN_BUCKET), now)) {
      return { ok: false as const, error: BLOCKED_ERROR };
    }
    const passcodeHash = await sha256Hex(passcode);
    // 실패 기록이 롤백되지 않도록 오류를 던지지 않고 결과로 돌려준다.
    if (await sha256Hex(args.passcode) !== passcodeHash) {
      await recordFailure(ctx, TEACHER_LOGIN_BUCKET, TEACHER_LOGIN_ATTEMPT_POLICY, now);
      const after = await findAttempt(ctx, TEACHER_LOGIN_BUCKET);
      return { ok: false as const, error: isAttemptBlocked(after, now) ? BLOCKED_ERROR : LOGIN_ERROR };
    }

    const expired = await ctx.db
      .query("teacherLogins")
      .withIndex("by_expires_at", (query) => query.lte("expiresAt", now))
      .collect();
    for (const login of expired) await ctx.db.delete(login._id);

    const token = createOpaqueToken();
    const expiresAt = now + TEACHER_LOGIN_TTL_MS;
    await ctx.db.insert("teacherLogins", {
      tokenHash: await sha256Hex(token),
      passcodeHash,
      createdAt: now,
      expiresAt,
    });
    return { ok: true as const, token, expiresAt };
  },
});

export const logout = mutationGeneric({
  args: { teacherToken: v.string() },
  handler: async (ctx, args) => {
    const tokenHash = await sha256Hex(args.teacherToken);
    const login = await ctx.db
      .query("teacherLogins")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", tokenHash))
      .unique();
    if (login) await ctx.db.delete(login._id);
    return null;
  },
});

export const check = queryGeneric({
  args: { teacherToken: v.string() },
  handler: async (ctx, args) => {
    try {
      await requireTeacher(ctx, args.teacherToken);
      return true;
    } catch {
      return false;
    }
  },
});
