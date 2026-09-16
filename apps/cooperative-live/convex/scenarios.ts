import {
  PUBLIC_SCENARIOS,
  type PublicScenario,
  type Stage,
} from "../shared/scenario.ts";

export type Choice = { id: string; label: string };
export type Evidence = { id: string; label: string };

export type RoleDefinition = {
  id: string;
  icon: string;
  name: string;
  privateInfo: string;
  interest: string;
  firstChoices: readonly Choice[];
  evidence: readonly Evidence[];
};

export type CooperativeScenario = Omit<PublicScenario, "roles"> & {
  roles: readonly RoleDefinition[];
  sharedPrompt: {
    question: string;
    policies: readonly Choice[];
    limitations: readonly Choice[];
    connections: readonly Choice[];
    whyTogetherStem: string;
  };
  commonEvidenceByGroupSize: Record<3 | 4 | 5, readonly Evidence[]>;
  teacherStages: readonly Stage[];
  interventions: { hint: string; deepen: string };
  sources: readonly { claim: string; url: string; accessedAt: string }[];
};

function publicScenario(id: string): PublicScenario {
  const scenario = PUBLIC_SCENARIOS.find((item) => item.id === id);
  if (!scenario) throw new Error(`공개 시나리오 ${id}를 찾을 수 없습니다.`);
  return scenario;
}

const gojoseonPublic = publicScenario("gojoseon-eight-laws");
const gojoseonFirstChoices = [
  { id: "restore", label: "훔친 곡식만 돌려준다" },
  { id: "repay", label: "훔친 것보다 더 많이 갚게 한다" },
  { id: "expel", label: "마을에서 내쫓는다" },
  { id: "deliberate", label: "피해와 사정을 살핀 뒤 마을 회의에서 결정한다" },
] as const;

const gojoseon: CooperativeScenario = {
  ...gojoseonPublic,
  roles: [
    {
      id: "farmer",
      icon: "🌾",
      name: "농사짓는 사람",
      privateInfo: "지난달에도 곡식이 사라졌습니다. 겨울 식량이 부족해질 수 있습니다.",
      interest: "재산과 마을의 겨울 식량을 지키고 싶습니다.",
      firstChoices: gojoseonFirstChoices,
      evidence: [{ id: "grain", label: "곡식과 생활을 지킬 규칙이 필요하다" }],
    },
    {
      id: "hunter",
      icon: "🏹",
      name: "사냥하는 사람",
      privateInfo: "예전에 잘못된 의심 때문에 억울하게 비난받은 사람이 있었습니다.",
      interest: "확실한 근거 없이 사람을 벌하지 않았으면 합니다.",
      firstChoices: gojoseonFirstChoices,
      evidence: [{ id: "fair", label: "벌하기 전에 사정을 살필 필요가 있다" }],
    },
    {
      id: "elder",
      icon: "🪵",
      name: "마을 어른",
      privateInfo: "도둑질뿐 아니라 마을 사람들 사이의 싸움도 늘었습니다.",
      interest: "개인의 사건을 넘어 마을 전체의 질서를 세우고 싶습니다.",
      firstChoices: gojoseonFirstChoices,
      evidence: [{ id: "order", label: "모두가 아는 규칙이 다툼을 줄일 수 있다" }],
    },
    {
      id: "family-helper",
      icon: "🫶",
      name: "어려운 가족을 아는 사람",
      privateInfo: "붙잡힌 사람의 가족은 며칠째 제대로 먹지 못하고 있습니다.",
      interest: "잘못을 살피되 어려운 사정도 함께 확인하고 싶습니다.",
      firstChoices: gojoseonFirstChoices,
      evidence: [{ id: "family", label: "처벌이 가족의 생활에도 미치는 영향을 살펴야 한다" }],
    },
    {
      id: "recorder",
      icon: "🪶",
      name: "마을 기록자",
      privateInfo: "사람마다 마을의 규칙을 다르게 기억해 다툼이 반복되었습니다.",
      interest: "누구나 이해하고 다음에도 적용할 수 있는 분명한 문장을 남기고 싶습니다.",
      firstChoices: gojoseonFirstChoices,
      evidence: [{ id: "record", label: "규칙을 분명히 남겨 함께 기억해야 한다" }],
    },
  ],
  sharedPrompt: {
    question: "마을의 다툼을 줄이려면 어떤 규칙을 먼저 세울까?",
    policies: [
      { id: "protect", label: "생활을 지키는 규칙" },
      { id: "fair", label: "사정을 살피는 절차" },
      { id: "record", label: "함께 기억할 기록" },
    ],
    limitations: [
      { id: "few-laws", label: "남아 있는 법 조항이 적어 모든 생활을 알 수 없다" },
    ],
    connections: [
      { id: "balance", label: "질서와 각 사람의 사정을 함께 살필 수 있다" },
      { id: "apply", label: "한 사건뿐 아니라 다음 사건에도 적용할 수 있다" },
    ],
    whyTogetherStem: "서로 다른 처지의 자료를 함께 보면",
  },
  commonEvidenceByGroupSize: { 3: [], 4: [], 5: [] },
  teacherStages: ["role", "first", "share", "draft", "confirm", "finished"],
  interventions: {
    hint: "각자 가진 정보에서 한 가지씩 말해 보세요.",
    deepen: "우리 모둠의 규칙은 누구에게 유리하고 누구에게 불리할까요?",
  },
  sources: [],
};

const earlyGoryeoPublic = publicScenario("early-goryeo-unity");
const earlyGoryeoFirstChoices = [
  { id: "include", label: "항복한 세력과 이주민을 안전하게 받아들인다" },
  { id: "local", label: "지역 세력과 협력할 약속을 분명히 한다" },
  { id: "livelihood", label: "전쟁 뒤 백성의 생활 부담을 먼저 던다" },
] as const;

const earlyGoryeo: CooperativeScenario = {
  ...earlyGoryeoPublic,
  roles: [
    {
      id: "silla-envoy",
      icon: "🕊️",
      name: "신라 사신",
      privateInfo: "935년 신라 경순왕이 고려에 항복했습니다. 고려는 경순왕을 높은 지위로 대우하고 경주의 사심관으로 삼았습니다.",
      interest: "항복한 사람과 지역을 함부로 대하지 않는 약속이 필요합니다.",
      firstChoices: earlyGoryeoFirstChoices,
      evidence: [{ id: "silla-welcome", label: "항복한 신라 왕을 예우하고 경주와의 연결을 남긴 사례" }],
    },
    {
      id: "local-messenger",
      icon: "📜",
      name: "지방 호족의 전령",
      privateInfo: "각 지역의 호족은 행정·경제·군사적 힘을 갖고 있었습니다. 태조는 혼인과 관직 등으로 이들과 관계를 맺었습니다.",
      interest: "협력의 약속과 지역 세력을 통제해야 했던 한계를 함께 살펴야 합니다.",
      firstChoices: earlyGoryeoFirstChoices,
      evidence: [{ id: "local-inclusion", label: "혼인·관직 등으로 지방 세력을 포용한 방식" }],
    },
    {
      id: "balhae-refugee",
      icon: "🏔️",
      name: "발해 유민",
      privateInfo: "발해가 무너진 뒤 대광현 일행 등 여러 발해인이 고려로 왔습니다. 고려는 이들을 받아들이고 관직·토지·집을 주기도 했습니다.",
      interest: "이주민을 받아들이는 일과 새 터전에서 정착하도록 돕는 일이 중요합니다.",
      firstChoices: earlyGoryeoFirstChoices,
      evidence: [{ id: "balhae-welcome", label: "대광현 일행을 받아들이고 정착을 도운 사례" }],
    },
    {
      id: "village-resident",
      icon: "🌾",
      name: "마을 사람",
      privateInfo: "후삼국의 전쟁과 가혹한 수취로 백성의 생활이 어려웠습니다. 태조는 부역과 세금을 가볍게 하고 농업을 안정시키려는 원칙을 내세웠습니다.",
      interest: "나라가 안정되려면 생활 부담을 덜고 농사를 이어갈 수 있어야 합니다.",
      firstChoices: earlyGoryeoFirstChoices,
      evidence: [{ id: "livelihood-relief", label: "부역·세금을 가볍게 하고 농민 생활을 안정시키려 한 원칙" }],
    },
    {
      id: "record-reviewer",
      icon: "🔎",
      name: "기록 검토자",
      privateInfo: "기록은 왕과 주요 세력의 정책을 주로 전합니다. 모든 지역과 사람의 경험이 같은 모습이었는지는 이 자료만으로 알기 어렵습니다.",
      interest: "한 사례를 전체 사람들의 생각과 결과로 단정하지 않도록 확인하고 싶습니다.",
      firstChoices: earlyGoryeoFirstChoices,
      evidence: [{ id: "record-limit", label: "정책 기록만으로 모든 지역과 사람의 경험을 알 수는 없다는 한계" }],
    },
  ],
  sharedPrompt: {
    question: "새 고려가 서로 다른 사람들을 한 나라로 묶기 위해 가장 먼저 해야 할 일은 무엇일까?",
    policies: [
      { id: "welcome", label: "항복 세력과 이주민을 안전하게 받아들이기" },
      { id: "cooperate", label: "지역 세력과 협력 약속을 만들기" },
      { id: "relieve", label: "전쟁 뒤 백성의 부담을 덜기" },
    ],
    limitations: [
      { id: "records", label: "이 자료만으로는 모든 지역·집단이 실제로 어떻게 느끼고 살았는지 알 수 없다" },
      { id: "outcomes", label: "정책을 내세운 뒤 모든 갈등이 곧바로 사라졌는지는 알 수 없다" },
    ],
    connections: [
      { id: "trust", label: "새 왕조에 대한 신뢰와 생활 안정을 함께 만들 수 있다" },
      { id: "perspectives", label: "한 집단의 요구만 따를 때 놓치는 문제를 줄일 수 있다" },
      { id: "cooperation", label: "지역의 협력과 새로 들어온 사람의 정착을 함께 도울 수 있다" },
    ],
    whyTogetherStem: "서로 다른 사람의 자료를 함께 보면",
  },
  commonEvidenceByGroupSize: {
    3: [{ id: "common-balhae", label: "공통 자료: 고려가 대광현 일행을 받아들이고 관직·토지·집을 주었다" }],
    4: [],
    5: [],
  },
  teacherStages: ["role", "first", "share", "draft", "confirm", "finished"],
  interventions: {
    hint: "아직 말하지 않은 친구가 있나요? 내 역할 자료에서 한 가지 근거를 말해 보세요.",
    deepen: "선택한 정책은 누구에게 도움이 되고, 무엇을 더 확인해야 할까요?",
  },
  sources: [
    {
      claim: "935년 경순왕 항복 뒤 높은 지위와 경주 사심관 역할을 부여한 사례",
      url: "https://contents.history.go.kr/mobile/hm/view.do?levelId=hm_046_0030",
      accessedAt: "2026-09-16",
    },
    {
      claim: "호족을 혼인·관직 등으로 포섭하고 통제한 고려 초기 정책",
      url: "https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_h51_0050_0010_0020",
      accessedAt: "2026-09-16",
    },
    {
      claim: "대광현 일행 등 발해 유민을 받아들이고 관직·토지·가옥을 제공한 사례",
      url: "https://contents.history.go.kr/front/km/print.do?levelId=km_001_0040_0030_0010_0010&whereStr=",
      accessedAt: "2026-09-16",
    },
    {
      claim: "경요박부·취민유도로 농민 생활과 농업을 안정시키려 한 정책 방향",
      url: "https://contents.history.go.kr/front/km/view.do?levelId=km_027_0040_0030_0030",
      accessedAt: "2026-09-16",
    },
  ],
};

export const SCENARIOS: readonly CooperativeScenario[] = [gojoseon, earlyGoryeo];

export function getScenario(id: string, version: number) {
  return SCENARIOS.find(
    (scenario) => scenario.id === id && scenario.version === version,
  ) ?? null;
}

export function roleById(
  scenario: CooperativeScenario,
  roleId?: string | null,
) {
  return scenario.roles.find((role) => role.id === roleId) ?? null;
}

export function validateScenarioRegistry(): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();

  for (const scenario of SCENARIOS) {
    const key = `${scenario.id}:${scenario.version}`;
    if (keys.has(key)) errors.push(`중복 시나리오: ${key}`);
    keys.add(key);

    const roleIds = new Set(scenario.roles.map((role) => role.id));
    if (roleIds.size !== scenario.roles.length) {
      errors.push(`${key}: 역할 ID가 중복됩니다.`);
    }
    for (const size of [3, 4, 5] as const) {
      const layout = scenario.groupSizes[size];
      if (layout.length !== size || new Set(layout).size !== size) {
        errors.push(`${key}: ${size}인 역할 배치가 올바르지 않습니다.`);
      }
      if (layout.some((roleId) => !roleIds.has(roleId))) {
        errors.push(`${key}: ${size}인 배치가 알 수 없는 역할을 참조합니다.`);
      }
    }
    for (const role of scenario.roles) {
      if (!role.privateInfo || !role.interest || role.evidence.length === 0) {
        errors.push(`${key}: ${role.id} 역할 자료가 완전하지 않습니다.`);
      }
    }
  }
  return errors;
}
