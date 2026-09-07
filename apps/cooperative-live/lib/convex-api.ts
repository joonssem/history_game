import { makeFunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

import type { InterventionKind, Stage } from "@/shared/scenario";

export type Dashboard = {
  session: {
    _id: Id<"sessions">;
    code: string;
    status: "lobby" | "active";
    createdAt: number;
    startedAt?: number;
    deleteAfter: number;
  };
  players: Array<{
    id: Id<"players">;
    alias: string;
    groupNumber?: number;
    roleId?: string;
    stage: Stage;
    submittedAt?: number;
    isSynthetic: boolean;
  }>;
  rooms: Array<{
    _id: Id<"rooms">;
    groupNumber: number;
    stage: Stage;
    updatedAt: number;
  }>;
  interventions: Array<{
    _id: Id<"interventions">;
    groupNumber: number;
    kind: InterventionKind;
    message: string;
    createdAt: number;
  }>;
};

export type StudentView = {
  sessionStatus: "lobby" | "active";
  alias?: string;
  groupNumber?: number;
  stage: Stage;
  role: {
    id: string;
    icon: string;
    name: string;
    privateInfo: string;
    interest: string;
  } | null;
  intervention: { kind: InterventionKind; message: string } | null;
} | null;

export const convexApi = {
  sessions: {
    create: makeFunctionReference<
      "mutation",
      Record<string, never>,
      { sessionId: Id<"sessions">; code: string; deleteAfter: number }
    >("sessions:create"),
    seedSyntheticStudents: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions">; count?: number },
      number
    >("sessions:seedSyntheticStudents"),
    start: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions"> },
      { groups: number; players: number }
    >("sessions:start"),
    dashboard: makeFunctionReference<
      "query",
      { sessionId: Id<"sessions"> },
      Dashboard
    >("sessions:dashboard"),
    end: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions"> },
      { deleted: number }
    >("sessions:end"),
  },
  students: {
    join: makeFunctionReference<
      "mutation",
      { code: string },
      { sessionId: Id<"sessions">; token: string; aliasCandidates: string[] }
    >("students:join"),
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
    advance: makeFunctionReference<
      "mutation",
      { sessionId: Id<"sessions">; token: string },
      Stage
    >("students:advance"),
  },
  interventions: {
    send: makeFunctionReference<
      "mutation",
      {
        sessionId: Id<"sessions">;
        groupNumber: number;
        kind: InterventionKind;
      },
      Id<"interventions">
    >("interventions:send"),
  },
};
