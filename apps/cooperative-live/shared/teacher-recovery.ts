export const TEACHER_PROGRESS_REASONS = {
  connection: "접속 문제로 진행이 막힘",
  discussion: "학생들과 논의하고 다음 단계 진행에 동의함",
  classroom: "교사가 모둠 활동을 직접 확인함",
} as const;

export type TeacherProgressReason = keyof typeof TEACHER_PROGRESS_REASONS;
