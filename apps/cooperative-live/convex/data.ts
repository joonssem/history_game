import type { GenericMutationCtx, GenericDataModel } from "convex/server";
import type { GenericId } from "convex/values";

export async function deleteSessionData(
  ctx: GenericMutationCtx<GenericDataModel>,
  sessionId: GenericId<"sessions">,
) {
  const tables = ["interventions", "rooms", "players"] as const;
  let deleted = 0;

  for (const table of tables) {
    const documents = await ctx.db
      .query(table)
      .withIndex("by_session", (query) => query.eq("sessionId", sessionId))
      .collect();
    for (const document of documents) {
      await ctx.db.delete(document._id as GenericId<string>);
      deleted += 1;
    }
  }

  const session = await ctx.db.get(sessionId);
  if (session) {
    await ctx.db.delete(sessionId);
    deleted += 1;
  }

  return deleted;
}
