import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

import { INTERVENTIONS } from "../shared/scenario";
import { requireOwnedSession, requireTeacher } from "./security";

export const send = mutationGeneric({
  args: {
    sessionId: v.id("sessions"),
    groupNumber: v.number(),
    kind: v.union(v.literal("hint"), v.literal("deepen")),
  },
  handler: async (ctx, args) => {
    const teacherSub = await requireTeacher(ctx);
    const session = await requireOwnedSession(ctx, args.sessionId, teacherSub);
    if (session.status !== "active") throw new Error("진행 중인 활동에서만 보낼 수 있습니다.");
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_session", (query) => query.eq("sessionId", args.sessionId))
      .filter((query) => query.eq(query.field("groupNumber"), args.groupNumber))
      .unique();
    if (!room) throw new Error("모둠을 찾을 수 없습니다.");
    return await ctx.db.insert("interventions", {
      sessionId: args.sessionId,
      groupNumber: args.groupNumber,
      kind: args.kind,
      message: INTERVENTIONS[args.kind],
      teacherSub,
      createdAt: Date.now(),
    });
  },
});
