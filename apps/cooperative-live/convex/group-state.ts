import type { GenericDataModel, GenericQueryCtx } from "convex/server";
import type { GenericId } from "convex/values";

import { STUDENT_STAGE_ORDER, type Stage } from "../shared/scenario";
import { isActiveStudent } from "./security";
import { roleById, type CooperativeScenario } from "./scenarios";

type GroupMember = {
  _id: GenericId<"players">;
  stage: string;
  roleId?: string;
  participationStatus?: "active" | "removed";
  submittedAt?: number;
  sharedAt?: number;
  confirmedRevision?: number;
};
type GroupRoom = {
  _id: GenericId<"rooms">;
  stage: string;
  recoveryEnabled?: boolean;
  teacherEvidenceOpenedAt?: number;
  teacherFinishedAt?: number;
};

export async function groupContext(
  ctx: GenericQueryCtx<GenericDataModel>,
  sessionId: GenericId<"sessions">,
  groupNumber: number,
) {
  const [allMembers, room] = await Promise.all([
    ctx.db.query("players").withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("groupNumber"), groupNumber)).collect(),
    ctx.db.query("rooms").withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("groupNumber"), groupNumber)).unique(),
  ]);
  const typedMembers = allMembers as unknown as GroupMember[];
  return { allMembers: typedMembers, members: typedMembers.filter(isActiveStudent), room: room as GroupRoom | null };
}

export function groupProgressError(count: number, recoveryEnabled: boolean) {
  if (count === 0) return "진행할 학생이 없습니다.";
  if (count < 3 && !recoveryEnabled) return "부족 인원 복구 모드를 먼저 켜 주세요.";
  return null;
}

export function minimumStage(members: Array<{ stage: string }>): Stage {
  return members.reduce<Stage>((minimum, member) => {
    const current = member.stage as Stage;
    return STUDENT_STAGE_ORDER.indexOf(current) < STUDENT_STAGE_ORDER.indexOf(minimum)
      ? current : minimum;
  }, "finished");
}

export function groupEvidence(
  scenario: CooperativeScenario,
  group: Awaited<ReturnType<typeof groupContext>>,
) {
  const activeRoleIds = new Set(group.members.map((member) => member.roleId));
  const source = group.room?.recoveryEnabled ? group.allMembers : group.members;
  return [...new Set(source.map((member) => member.roleId))].flatMap((roleId) => {
    const role = roleById(scenario, roleId);
    return role ? [{
      id: role.id,
      name: role.name,
      recoverySummary: !activeRoleIds.has(role.id),
      evidence: role.evidence.map((item) => ({ ...item })),
    }] : [];
  });
}
