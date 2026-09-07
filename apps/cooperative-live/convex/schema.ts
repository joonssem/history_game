import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    scenarioId: v.string(),
    ownerSub: v.string(),
    code: v.string(),
    status: v.union(v.literal("lobby"), v.literal("active")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    deleteAfter: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_owner", ["ownerSub"]),
  players: defineTable({
    sessionId: v.id("sessions"),
    tokenHash: v.string(),
    alias: v.optional(v.string()),
    groupNumber: v.optional(v.number()),
    roleId: v.optional(v.string()),
    stage: v.string(),
    submittedAt: v.optional(v.number()),
    joinedAt: v.number(),
    updatedAt: v.number(),
    isSynthetic: v.boolean(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_token", ["sessionId", "tokenHash"]),
  rooms: defineTable({
    sessionId: v.id("sessions"),
    groupNumber: v.number(),
    stage: v.string(),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),
  interventions: defineTable({
    sessionId: v.id("sessions"),
    groupNumber: v.number(),
    kind: v.union(v.literal("hint"), v.literal("deepen")),
    message: v.string(),
    teacherSub: v.string(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_group", ["sessionId", "groupNumber"]),
});
