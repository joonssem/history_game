export const SCENARIO_ID = "gojoseon-eight-laws";
export const SCENARIO_TITLE = "고조선 8조법: 우리 마을의 첫 번째 법";

export const ALIASES = [
  "가람",
  "가온",
  "나래",
  "누리",
  "다솜",
  "라온",
  "마루",
  "미르",
  "바다",
  "보라",
  "새론",
  "샛별",
  "아람",
  "여울",
  "온새미",
  "윤슬",
  "이든",
  "자람",
  "초롱",
  "푸름",
  "하람",
  "한결",
  "해솔",
  "희망",
] as const;

export const ROLES = [
  {
    id: "farmer",
    icon: "🌾",
    name: "농사짓는 사람",
    privateInfo:
      "지난달에도 곡식이 사라졌습니다. 겨울 식량이 부족해질 수 있습니다.",
    interest: "재산과 마을의 겨울 식량을 지키고 싶습니다.",
  },
  {
    id: "hunter",
    icon: "🏹",
    name: "사냥하는 사람",
    privateInfo:
      "예전에 잘못된 의심 때문에 억울하게 비난받은 사람이 있었습니다.",
    interest: "확실한 근거 없이 사람을 벌하지 않았으면 합니다.",
  },
  {
    id: "elder",
    icon: "🪵",
    name: "마을 어른",
    privateInfo:
      "최근 도둑질뿐 아니라 마을 사람들 사이의 싸움도 늘었습니다.",
    interest: "개인의 사건을 넘어 마을 전체의 질서를 세우고 싶습니다.",
  },
  {
    id: "family-helper",
    icon: "🫶",
    name: "어려운 가족을 아는 사람",
    privateInfo:
      "붙잡힌 사람의 가족은 며칠째 제대로 먹지 못하고 있습니다.",
    interest: "잘못을 살피되 어려운 사정도 함께 확인하고 싶습니다.",
  },
  {
    id: "recorder",
    icon: "🪶",
    name: "마을 기록자",
    privateInfo:
      "사람마다 마을의 규칙을 다르게 기억해 같은 일이 생겨도 다툼이 반복되었습니다.",
    interest: "누구나 이해하고 다음에도 적용할 수 있는 분명한 문장을 남기고 싶습니다.",
  },
] as const;

export const STAGES = [
  "lobby",
  "role",
  "first",
  "share",
  "law",
  "history",
  "finished",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  lobby: "입장 대기",
  role: "역할 자료 확인",
  first: "개인 판단",
  share: "자료 공유",
  law: "모둠 법 만들기",
  history: "역사 자료 비교",
  finished: "활동 마침",
};

export const STUDENT_STAGE_ORDER: Stage[] = [
  "role",
  "first",
  "share",
  "law",
  "history",
  "finished",
];

export const INTERVENTIONS = {
  hint: "아직 말하지 않은 친구가 있나요? 각자 가진 정보에서 한 가지씩 말해 보세요.",
  deepen:
    "우리 모둠의 법은 누구에게 유리하고 누구에게 불리할까요? 반대 입장에서 다시 살펴보세요.",
} as const;

export type InterventionKind = keyof typeof INTERVENTIONS;

export type Assignment = {
  participantKey: string;
  groupNumber: number;
  roleId: (typeof ROLES)[number]["id"];
};

export function planGroupSizes(
  participantCount: number,
  preferredGroupSize = 4,
): number[] {
  if (participantCount === 0) return [];
  if (participantCount < 3) {
    throw new Error("모둠 활동에는 학생이 3명 이상 필요합니다.");
  }
  if (preferredGroupSize < 3 || preferredGroupSize > 5) {
    throw new Error("모둠 크기는 3명에서 5명 사이여야 합니다.");
  }

  const minimumGroupCount = Math.ceil(participantCount / 5);
  const maximumGroupCount = Math.floor(participantCount / 3);
  const preferredGroupCount = Math.round(participantCount / preferredGroupSize);
  const groupCount = Math.min(
    maximumGroupCount,
    Math.max(minimumGroupCount, preferredGroupCount),
  );
  const baseSize = Math.floor(participantCount / groupCount);
  const largerGroups = participantCount % groupCount;

  return Array.from(
    { length: groupCount },
    (_, index) => baseSize + (index < largerGroups ? 1 : 0),
  );
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function assignGroups(
  participantKeys: readonly string[],
  groupSize = 4,
  random = Math.random,
): Assignment[] {
  if (participantKeys.length === 0) return [];
  const shuffledParticipants = shuffle(participantKeys, random);
  const sizes = planGroupSizes(participantKeys.length, groupSize);
  const assignments: Assignment[] = [];
  let participantIndex = 0;

  sizes.forEach((size, groupIndex) => {
    for (let roleIndex = 0; roleIndex < size; roleIndex += 1) {
      assignments.push({
        participantKey: shuffledParticipants[participantIndex++],
        groupNumber: groupIndex + 1,
        roleId: ROLES[roleIndex].id,
      });
    }
  });

  return assignments;
}

export function pickUniqueAliases(
  count: number,
  random = Math.random,
): string[] {
  if (count > ALIASES.length) {
    throw new Error("준비된 호보다 참여자가 많습니다.");
  }
  return shuffle(ALIASES, random).slice(0, count);
}

export function nextStudentStage(stage: Stage): Stage {
  const index = STUDENT_STAGE_ORDER.indexOf(stage);
  if (index < 0) return "role";
  return STUDENT_STAGE_ORDER[Math.min(index + 1, STUDENT_STAGE_ORDER.length - 1)];
}

export function roleById(roleId?: string | null) {
  return ROLES.find((role) => role.id === roleId) ?? null;
}
