export const ALIASES = [
  "가람", "가온", "나래", "누리", "다솜", "라온", "마루", "미르",
  "바다", "보라", "새론", "샛별", "아람", "여울", "온새미", "윤슬",
  "이든", "자람", "초롱", "푸름", "하람", "한결", "해솔", "희망",
] as const;

export const STAGES = [
  "lobby", "role", "first", "share", "draft", "confirm", "finished",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  lobby: "입장 대기",
  role: "역할 자료 확인",
  first: "개인 최초 판단",
  share: "자료 말하기",
  draft: "공동 초안",
  confirm: "전원 확인",
  finished: "활동 마침",
};

export const STUDENT_STAGE_ORDER: Stage[] = [
  "role", "first", "share", "draft", "confirm", "finished",
];

export type InterventionKind = "hint" | "deepen";

export type PublicRole = { id: string; icon: string; name: string };

export type PublicScenario = {
  id: string;
  version: number;
  publicMeta: {
    title: string;
    lesson: string;
    recommendedMinutes: number;
  };
  roles: readonly PublicRole[];
  groupSizes: Record<3 | 4 | 5, readonly string[]>;
};

const gojoseonPublic: PublicScenario = {
  id: "gojoseon-eight-laws",
  version: 1,
  publicMeta: {
    title: "고조선 8조법: 우리 마을의 첫 번째 법",
    lesson: "1단원 6차시",
    recommendedMinutes: 8,
  },
  roles: [
    { id: "farmer", icon: "🌾", name: "농사짓는 사람" },
    { id: "hunter", icon: "🏹", name: "사냥하는 사람" },
    { id: "elder", icon: "🪵", name: "마을 어른" },
    { id: "family-helper", icon: "🫶", name: "어려운 가족을 아는 사람" },
    { id: "recorder", icon: "🪶", name: "마을 기록자" },
  ],
  groupSizes: {
    3: ["farmer", "hunter", "elder"],
    4: ["farmer", "hunter", "elder", "family-helper"],
    5: ["farmer", "hunter", "elder", "family-helper", "recorder"],
  },
};

const earlyGoryeoPublic: PublicScenario = {
  id: "early-goryeo-unity",
  version: 1,
  publicMeta: {
    title: "새 고려의 첫 회의 — 서로 다른 사람들을 어떻게 한 나라로 묶을까?",
    lesson: "1단원 13차시 고려의 건국 과정",
    recommendedMinutes: 10,
  },
  roles: [
    { id: "silla-envoy", icon: "🕊️", name: "신라 사신" },
    { id: "local-messenger", icon: "📜", name: "지방 호족의 전령" },
    { id: "balhae-refugee", icon: "🏔️", name: "발해 유민" },
    { id: "village-resident", icon: "🌾", name: "마을 사람" },
    { id: "record-reviewer", icon: "🔎", name: "기록 검토자" },
  ],
  groupSizes: {
    3: ["silla-envoy", "local-messenger", "village-resident"],
    4: ["silla-envoy", "local-messenger", "balhae-refugee", "village-resident"],
    5: [
      "silla-envoy", "local-messenger", "balhae-refugee",
      "village-resident", "record-reviewer",
    ],
  },
};

const joseonLatePublic: PublicScenario = {
  id: "joseon-late-market",
  version: 1,
  publicMeta: {
    title: "달라지는 조선 후기 — 장시·화폐·농사법의 변화는 누구에게 어땠을까?",
    lesson: "2단원 8~10차시 조선 후기 사회 변화",
    recommendedMinutes: 10,
  },
  roles: [
    { id: "farmer", icon: "🌾", name: "농민" },
    { id: "bobusang", icon: "🎒", name: "보부상" },
    { id: "craftsman", icon: "🔨", name: "장시 주민·수공업자" },
    { id: "recordkeeper", icon: "📜", name: "기록관" },
    { id: "laborer", icon: "🧺", name: "품팔이" },
  ],
  groupSizes: {
    3: ["farmer", "bobusang", "recordkeeper"],
    4: ["farmer", "bobusang", "craftsman", "recordkeeper"],
    5: ["farmer", "bobusang", "craftsman", "recordkeeper", "laborer"],
  },
};

export const PUBLIC_SCENARIOS = [
  gojoseonPublic,
  earlyGoryeoPublic,
  joseonLatePublic,
] as const;
export const DEFAULT_SCENARIO_ID = earlyGoryeoPublic.id;
export const SCENARIO_ID = gojoseonPublic.id;
export const SCENARIO_TITLE = gojoseonPublic.publicMeta.title;

export function getPublicScenario(id: string, version: number) {
  return PUBLIC_SCENARIOS.find(
    (scenario) => scenario.id === id && scenario.version === version,
  ) ?? null;
}

export function publicRoleById(
  roleId?: string | null,
  scenarioId = SCENARIO_ID,
  version = 1,
) {
  return getPublicScenario(scenarioId, version)?.roles.find(
    (role) => role.id === roleId,
  ) ?? null;
}

export type Assignment = {
  participantKey: string;
  groupNumber: number;
  roleId: string;
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
  scenario: PublicScenario = gojoseonPublic,
): Assignment[] {
  if (participantKeys.length === 0) return [];

  const shuffledParticipants = shuffle(participantKeys, random);
  const sizes = planGroupSizes(participantKeys.length, groupSize);
  const assignments: Assignment[] = [];
  let participantIndex = 0;

  sizes.forEach((size, groupIndex) => {
    scenario.groupSizes[size as 3 | 4 | 5].forEach((roleId) => {
      assignments.push({
        participantKey: shuffledParticipants[participantIndex++],
        groupNumber: groupIndex + 1,
        roleId,
      });
    });
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
  return STUDENT_STAGE_ORDER[
    Math.min(index + 1, STUDENT_STAGE_ORDER.length - 1)
  ];
}
