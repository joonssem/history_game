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
