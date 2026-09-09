import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

import { deleteSessionData } from "./data";

export const deleteExpired = mutationGeneric({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deleteAfter > Date.now()) return { deleted: 0 };
    return { deleted: await deleteSessionData(ctx, args.sessionId) };
  },
});

export const expireEntryCredentials = mutationGeneric({
  args: {
    sessionId: v.id("sessions"),
    expectedEntryKeyExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (
      !session
      || session.entryKeyExpiresAt !== args.expectedEntryKeyExpiresAt
      || session.entryKeyExpiresAt > Date.now()
    ) {
      return { cleared: 0 };
    }
    await ctx.db.patch(args.sessionId, {
      entryKeyHash: undefined,
      entryKeyExpiresAt: undefined,
    });
    return { cleared: 1 };
  },
});

export const deleteJoinAttempt = mutationGeneric({
  args: {
    attemptId: v.id("joinAttempts"),
    expectedDeleteAfter: v.number(),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (
      !attempt
      || attempt.deleteAfter !== args.expectedDeleteAfter
      || attempt.deleteAfter > Date.now()
    ) {
      return { deleted: 0 };
    }
    await ctx.db.delete(args.attemptId);
    return { deleted: 1 };
  },
});
