import { makeFunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

import type { InterventionKind, Stage } from "@/shared/scenario";

export type Dashboard = {
  session: {
    _id: Id<"sessions">;
    scenarioId: string;
    scenarioVersion: number;
    scenario: {
      title: string;
      lesson: string;
      recommendedMinutes: number;
    } | null;
    code: string;
    status: "lobby" | "preview" | "active";
    paused: boolean;
    codeExpiresAt?: number;
    entryKeyExpiresAt?: number;
    hasEntryKey: boolean;
    createdAt: number;
    startedAt?: number;
    deleteAfter: number;
  };
  players: Array<{
    id: Id<"players">;
    alias: string;
    aliasSelected: boolean;
    joinedAt: number;
    groupNumber?: number;
    roleId?: string;
    roleName?: string;
    roleIcon?: string;
    stage: Stage;
    submittedAt?: number;
    sharedAt?: number;
    confirmedRevision?: number;
    participationStatus: "active" | "removed";
    lastSeenAt?: number;
    connectionStatus: "unknown" | "online" | "delayed" | "disconnected";
    isSynthetic: boolean;
  }>;
  rooms: Array<{
    _id: Id<"rooms">;
    groupNumber: number;
    stage: Stage;
    updatedAt: number;
    completed: number;
    total: number;
    confirmed: number;
    revision?: number;
    gate: { stage: Stage; ready: boolean; reason: string | null };
    latestIntervention: {
      id: Id<"interventions">;
      kind: InterventionKind;
      createdAt: number;
      acknowledged: number;
      total: number;
    } | null;
  }>;
  interventions: Array<{
    _id: Id<"interventions">;
    groupNumber: number;
    kind: InterventionKind;
    message: string;
    createdAt: number;
  }>;
  drafts: Array<{ groupNumber: number; revision: number }>;
  helpRequests: Array<{ groupNumber: number; requestedAt: number; resolvedAt?: number }>;
};

export type StudentView = {
  sessionStatus: "lobby" | "preview" | "active";
  paused: boolean;
  scenario: { title: string; lesson: string; recommendedMinutes: number };
  sharedPrompt: {
    question: string;
    policies: readonly { id: string; label: string }[];
    limitations: readonly { id: string; label: string }[];
    connections: readonly { id: string; label: string }[];
    whyTogetherStem: string;
  };
  commonEvidence: Array<{ id: string; label: string }>;
  evidenceRoles: Array<{
    id: string;
    name: string;
    evidence: Array<{ id: string; label: string }>;
  }>;
  alias?: string;
  groupNumber?: number;
  stage: Stage;
  firstSubmitted: boolean;
  sharedAt: boolean;
  sharing: { completed: number; total: number } | null;
  draft: {
    policyIds: string[];
    evidenceRoleIds: string[];
    limitationId: string;
    connectionId: string;
    revision: number;
  } | null;
  confirmation: { confirmed: number; total: number } | null;
  confirmedRevision?: number;
  helpRequested: boolean;
  role: {
    id: string;
    icon: string;
    name: string;
    privateInfo: string;
    interest: string;
    firstChoices: Array<{ id: string; label: string }>;
    evidence: Array<{ id: string; label: string }>;
  } | null;
  intervention: {
    id: Id<"interventions">;
    kind: InterventionKind;
    message: string;
    acknowledged: boolean;
  } | null;
} | null;

type TeacherArgs = { teacherToken: string };

export const convexApi = {
  teacherAuth: {
    login: makeFunctionReference<
      "mutation",
      { passcode: string },
      { ok: true; token: string; expiresAt: number } | { ok: false; error: string }
    >("teacherAuth:login"),
    logout: makeFunctionReference<"mutation", TeacherArgs, null>("teacherAuth:logout"),
    check: makeFunctionReference<"query", TeacherArgs, boolean>("teacherAuth:check"),
  },
  sessions: {
    create: makeFunctionReference<
      "mutation",
      TeacherArgs & { scenarioId?: string; scenarioVersion?: number },
      {
        sessionId: Id<"sessions">;
        code: string;
        deleteAfter: number;
        codeExpiresAt?: number;
        entryKey?: string;
        entryKeyExpiresAt?: number;
      }
    >("sessions:create"),
    current: makeFunctionReference<
      "query",
      TeacherArgs,
      Dashboard["session"] | null
    >("sessions:current"),
    seedSyntheticStudents: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; count?: number },
      number
    >("sessions:seedSyntheticStudents"),
    rotateEntryKey: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { entryKey: string; entryKeyExpiresAt: number; codeExpiresAt: number }
    >("sessions:rotateEntryKey"),
    previewGroups: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; removeUnselectedIds?: Id<"players">[] },
      { groups: number; players: number }
    >("sessions:previewGroups"),
    kickBeforeStart: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; playerId: Id<"players"> },
      { removed: boolean; status: "lobby" | "preview"; entryKey?: string }
    >("sessions:kickBeforeStart"),
    reshuffleGroups: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { groups: number; players: number }
    >("sessions:reshuffleGroups"),
    confirmStart: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { groups: number; players: number }
    >("sessions:confirmStart"),
    cancelPreview: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { entryKey: string; entryKeyExpiresAt: number; codeExpiresAt: number }
    >("sessions:cancelPreview"),
    togglePause: makeFunctionReference<"mutation", TeacherArgs & { sessionId: Id<"sessions">; paused: boolean }, { paused: boolean }>("sessions:togglePause"),
    advanceStage: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { stage: Stage }
    >("sessions:advanceStage"),
    advanceGroupStage: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; groupNumber: number },
      { stage: Stage }
    >("sessions:advanceGroupStage"),
    setParticipantStatus: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; playerId: Id<"players">; status: "active" | "removed" },
      { status: "active" | "removed" }
    >("sessions:setParticipantStatus"),
    issueRecoveryCode: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions">; playerId: Id<"players"> },
      { recoveryCode: string; expiresAt: number }
    >("sessions:issueRecoveryCode"),
    resolveHelp: makeFunctionReference<"mutation", TeacherArgs & { sessionId: Id<"sessions">; groupNumber: number }, { resolved: boolean }>("sessions:resolveHelp"),
    dashboard: makeFunctionReference<
      "query",
      TeacherArgs & { sessionId: Id<"sessions"> },
      Dashboard
    >("sessions:dashboard"),
    end: makeFunctionReference<
      "mutation",
      TeacherArgs & { sessionId: Id<"sessions"> },
      { deleted: number }
    >("sessions:end"),
  },
  students: {
    joinWithEntryKey: makeFunctionReference<
      "mutation",
      { entryKey: string },
      { sessionId: Id<"sessions">; token: string; aliasCandidates: string[] }
    >("students:joinWithEntryKey"),
    joinWithCode: makeFunctionReference<
      "mutation",
      { code: string; attemptId: string },
      | { ok: false; error: string }
      | {
          ok: true;
          sessionId: Id<"sessions">;
          token: string;
          aliasCandidates: string[];
        }
    >("students:joinWithCode"),
    selectAlias: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions">; token: string; alias: string },
      string
    >("students:selectAlias"),
    view: makeFunctionReference<
      "query",
      { sessionId: Id<"sessions">; token: string },
      StudentView
    >("students:view"),
    accessState: makeFunctionReference<
      "query",
      { sessionId: Id<"sessions">; token: string },
      "active" | "kicked" | "ended" | "invalid"
    >("students:accessState"),
    advance: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions">; token: string },
      Stage
    >("students:advance"),
    completeFirst: makeFunctionReference<"mutation", { sessionId: Id<"sessions">; token: string }, { complete: boolean }>("students:completeFirst"),
    markShared: makeFunctionReference<"mutation", { sessionId: Id<"sessions">; token: string }, { complete: boolean }>("students:markShared"),
    heartbeat: makeFunctionReference<"mutation", { sessionId: Id<"sessions">; token: string }, { lastSeenAt: number }>("students:heartbeat"),
    recoverSeat: makeFunctionReference<
      "mutation",
      { code: string; recoveryCode: string },
      { sessionId: Id<"sessions">; token: string; aliasCandidates: string[] }
    >("students:recoverSeat"),
    acknowledgeIntervention: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions">; token: string; interventionId: Id<"interventions"> },
      { acknowledged: boolean }
    >("students:acknowledgeIntervention"),
    saveDraft: makeFunctionReference<"mutation", {
      sessionId: Id<"sessions">;
      token: string;
      policyIds: string[];
      evidenceRoleIds: string[];
      limitationId: string;
      connectionId: string;
      expectedRevision: number;
    }, { revision: number }>("students:saveDraft"),
    confirmDraft: makeFunctionReference<"mutation", { sessionId: Id<"sessions">; token: string; revision: number }, { complete: boolean }>("students:confirmDraft"),
    requestHelp: makeFunctionReference<"mutation", { sessionId: Id<"sessions">; token: string }, { requested: boolean }>("students:requestHelp"),
  },
  interventions: {
    send: makeFunctionReference<
      "mutation",
      TeacherArgs & {
        sessionId: Id<"sessions">;
        groupNumber: number;
        kind: InterventionKind;
      },
      Id<"interventions">
    >("interventions:send"),
  },
};
