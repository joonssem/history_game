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
  draftRequirements?: {
    policyIds?: readonly string[];
    evidenceRoleIds?: readonly string[];
    connectionIds?: readonly string[];
  };
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

const joseonLatePublic = publicScenario("joseon-late-market");
const joseonLateFirstChoices = [
  { id: "improved", label: "많은 사람의 살림이 전반적으로 나아졌을 것이다" },
  { id: "mixed", label: "사람에 따라 좋아진 점과 어려워진 점이 함께 있었을 것이다" },
  { id: "unchanged", label: "예전과 크게 달라지지 않았을 것이다" },
] as const;

const joseonLate: CooperativeScenario = {
  ...joseonLatePublic,
  roles: [
    {
      id: "farmer",
      icon: "🌾",
      name: "농민",
      privateInfo: "저는 모내기법(이앙법)으로 벼농사를 짓습니다. 잡초 뽑는 일손이 줄어 예전보다 적은 일손으로 넓은 논을 지을 수 있게 되었습니다(광작). 남는 곡식은 장시에 내다 팔아 돈을 마련합니다. 저처럼 넓은 땅을 짓는 사람이 늘면서, 품삯을 받는 이웃도 생겼습니다.",
      interest: "적은 일손으로 넓은 땅을 지어 곡식을 많이 거두고, 남는 곡식을 좋은 값에 팔고 싶습니다. 다만 저처럼 땅을 넓힌 사람이 많아지면 땅을 구하지 못하는 이웃이 생긴다는 것도 알고 있습니다.",
      firstChoices: joseonLateFirstChoices,
      evidence: [{ id: "farmer-ipbeop", label: "모내기법으로 넓은 땅을 지음(광작)" }],
    },
    {
      id: "bobusang",
      icon: "🎒",
      name: "보부상",
      privateInfo: "저는 등짐과 봇짐을 지고 5일마다 서는 장시를 오가며 물건을 사고팝니다. 상평통보로 거래하는 사람이 늘어 무거운 곡식을 직접 지지 않아도 됩니다. 그런데 가끔 동전이 귀해지는 때가 있어(전황), 그럴 때는 물건을 팔아도 돈으로 받기가 어렵습니다. 저는 여러 장시를 돌아다니며 이 고을 물건을 저 고을에 가져가 팔기도 합니다.",
      interest: "곡식과 물건 값에는 오르내리는 때가 있을 것 같아, 그 차이를 이용하면 이문을 남길 수 있지 않을까 생각합니다. 곡식값이 쌀 때 사고 싶은 저와, 제값에 팔고 싶은 농민의 생각이 다를 때가 있습니다.",
      firstChoices: joseonLateFirstChoices,
      evidence: [{ id: "bobusang-currency", label: "상평통보 유통과 전황(동전 부족)" }],
    },
    {
      id: "craftsman",
      icon: "🔨",
      name: "장시 주민·수공업자",
      privateInfo: "저는 장시 근처에 살며 무명(면포)을 짜서 내다 파는 수공업자입니다. 예전에는 나라의 명령을 받아 만들었지만, 요즘은 스스로 만들어 파는 사람도 늘었습니다. 장이 크게 서는 날에는 물건이 잘 팔리지만, 다른 지역 물건과 겨루어야 할 때도 있습니다. 제가 만든 물건이 안 팔리는 달에는 살림이 어려워질까 걱정입니다. 보부상이 제 물건을 다른 장시로 가져가 대신 팔아 주기도 합니다.",
      interest: "제가 만든 물건을 제값에, 꾸준히 팔고 싶습니다. 다른 지역 물건과 경쟁하거나 장사가 안 되는 달에는 살림이 불안정해질까 걱정입니다.",
      firstChoices: joseonLateFirstChoices,
      evidence: [{ id: "jangsi-craftsman", label: "관영 수공업 쇠퇴, 스스로 만들어 파는 수공업자 증가" }],
    },
    {
      id: "recordkeeper",
      icon: "📜",
      name: "기록관",
      privateInfo: "저는 고을의 호적과 장시 왕래를 기록하는 일을 돕습니다. 호적에는 사람 수와 신분을 적지만, 떠돌아다니는 유리민은 빠지기도 합니다. 장시가 서는 날짜와 파는 물건 종류는 고을마다 기록이 다르고, 먼 지역까지 다 조사하지는 못합니다. 상평통보를 쓰는 사람이 늘었다지만, 저희 고을 기록만으로는 나라 전체 사정까지 알 수 없습니다. 저는 기록에 있는 것과 기록에 없는 것을 구분해서 알려 드릴 수 있습니다.",
      interest: "정확하게 기록하고 싶지만, 제가 가진 기록만으로는 모든 사람과 모든 고을의 사정을 다 알 수 없다는 것도 분명히 밝히고 싶습니다.",
      firstChoices: joseonLateFirstChoices,
      evidence: [{ id: "record-keeper-scope", label: "호적에 없는 유리민, 기록의 한계" }],
    },
    {
      id: "laborer",
      icon: "🧺",
      name: "품팔이",
      privateInfo: "저는 남의 논밭 일을 도와주고 품삯을 받아 살아가는 고공(雇工)입니다. 넓은 땅을 짓는 사람이 늘며, 몰락 농민 중 일부가 저처럼 됩니다. 농촌에 남아 품삯을 받기도 하고, 도성 근처로 가 세곡을 나르기도 합니다. 모내기·김매기 철엔 일이 많지만, 그 외엔 벌이가 불안정할 때도 있을 것입니다. 몰락한 농민 모두가 저와 같은 길을 걷진 않으며, 사정은 각자 다릅니다.",
      interest: "품삯을 받을 수 있는 일자리가 꾸준히 있으면 좋겠습니다. 넓은 땅을 짓는 사람들 덕분에 일거리가 생기기도 하지만, 저는 제 땅이 없어 늘 불안정하다는 점이 다릅니다.",
      firstChoices: joseonLateFirstChoices,
      evidence: [{ id: "laborer-wage", label: "품삯으로 사는 고공, 세곡 하역 임노동" }],
    },
  ],
  sharedPrompt: {
    question: "장시·화폐·농사법의 변화는 조선 후기 사람들의 삶을 누구에게 어떻게 바꾸었을까?",
    policies: [
      { id: "market", label: "장시(5일장)가 늘어난 변화" },
      { id: "currency", label: "화폐(상평통보)를 쓰게 된 변화" },
      { id: "farming", label: "농사짓는 방법(모내기법)이 바뀐 변화" },
    ],
    limitations: [
      { id: "scope-all", label: "우리 이야기만으로 조선 후기 모든 지역·사람이 똑같이 달라졌다고 말할 수 없다" },
      { id: "local-case", label: "우리 자료는 한 고을·한 장시의 사례이며 다른 지역은 달랐을 수 있다" },
      { id: "exact-timing", label: "화폐와 장시가 퍼진 정확한 시기는 이 자료만으로 알 수 없다" },
    ],
    connections: [
      { id: "land-vs-labor", label: "광작으로 넓은 땅을 짓는 농민이 늘었지만, 땅을 구하지 못한 이웃 가운데 일부는 품삯을 받으며 살아가야 했다" },
      { id: "currency-tradeoff", label: "보부상은 상평통보 덕분에 여러 장시를 오가며 거래하기 편해졌지만, 전황이 심할 때는 돈을 받기 어려웠다" },
      { id: "craft-tradeoff", label: "수공업자는 스스로 만들어 파는 자유를 얻었지만, 장이 안 서는 달에는 살림이 불안정해질까 걱정했다" },
    ],
    whyTogetherStem: "서로 다른 처지의 자료를 함께 보면",
  },
  commonEvidenceByGroupSize: {
    3: [{ id: "common-craftsman", label: "장시에 물건 만들어 파는 사람도 있었다" }],
    4: [],
    5: [],
  },
  teacherStages: ["role", "first", "share", "draft", "confirm", "finished"],
  interventions: {
    hint: "각자 자료에서 '좋아진 점'과 '어려워진 점'을 하나씩 짧게 말해 볼까요?",
    deepen: "농민과 보부상의 생각이 같은 곳과 다른 곳은 어디인가요? 왜 다를까요?",
  },
  sources: [
    {
      claim: "모내기법(이앙법)이 17세기 이후 빠르게 보급되어 17세기 후반 삼남지방에서 대세를 이룬 일",
      url: "https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_033_0020_0020_0010_0010",
      accessedAt: "2026-09-16",
    },
    {
      claim: "광작농이 경작지를 넓혀 감에 따라 자작농·작인층 일부가 경작지를 확보하지 못해 몰락한 일",
      url: "https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_033_0020_0030_0010_0010",
      accessedAt: "2026-09-16",
    },
    {
      claim: "5일마다 장이 서고 상인이 30~50리 거리를 두고 여러 장시를 돌며 물건을 유통한 일",
      url: "https://contents.history.go.kr/front/km/view.do?levelId=km_016_0030_0020_0020",
      accessedAt: "2026-09-16",
    },
    {
      claim: "1678년(숙종 4)부터 상평통보를 법정 화폐로 주조·유통하기 시작한 일",
      url: "https://contents.history.go.kr/front/hm/view.do?treeId=010602&tabId=01&levelId=hm_106_0060",
      accessedAt: "2026-09-16",
    },
    {
      claim: "영조대 초반 동전이 부족해지는 '전황' 현상이 나타난 일",
      url: "https://contents.history.go.kr/front/hm/view.do?treeId=010602&tabId=01&levelId=hm_106_0060",
      accessedAt: "2026-09-16",
    },
    {
      claim: "관영 수공업이 쇠퇴하고 스스로 만들어 파는 민영 수공업자가 늘어난 일(숙종 33년/1707년 사료, 정조 때 장인 등록제 폐지)",
      url: "https://contents.history.go.kr/mobile/hm/view.do?levelId=hm_105_0020",
      accessedAt: "2026-09-16",
    },
    {
      claim: "1788년(정조 12) 호조정랑 박일원이 호적대장에 등재되지 않은 인구를 30%로 추정한 일",
      url: "https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_033_0020_0010_0010",
      accessedAt: "2026-09-16",
    },
    {
      claim: "토지에서 벗어난 농민이 품삯을 받는 임노동자(고공)가 되어 농업이나 도성 근처 세곡 하역 등으로 살아간 일",
      url: "https://contents.history.go.kr/front/tg/view.do?treeId=0201&levelId=tg_003_2130&pageUnit=10",
      accessedAt: "2026-09-16",
    },
  ],
};

const goryeoRelationsPublic = publicScenario("goryeo-foreign-relations");
const goryeoRelationsFirstChoices = [
  { id: "negotiate", label: "상대가 원하는 것을 알아보고 말로 협상한다" },
  { id: "defend", label: "성과 방어 거점을 갖추고 맞서 싸운다" },
  { id: "resist", label: "도읍을 옮기거나 끝까지 버티며 저항한다" },
  { id: "protect-people", label: "백성의 피해를 줄이는 일을 먼저 한다" },
] as const;

const goryeoRelations: CooperativeScenario = {
  ...goryeoRelationsPublic,
  roles: [
    {
      id: "diplomacy-reviewer",
      icon: "🤝",
      name: "외교 기록 검토자",
      privateInfo: "993년 거란이 쳐들어왔을 때 서희가 거란 장수와 만나 협상했습니다. 서희는 고려가 고구려를 이은 나라이고, 압록강 쪽 여진 때문에 거란과 길이 막혀 있다고 설명했습니다. 거란은 압록강 동쪽 여진이 살던 땅에 대한 고려의 권리를 인정하고 물러났습니다.",
      interest: "외교는 상대가 무엇을 원하는지 읽고 조건을 주고받는 선택이었다고 생각합니다. 이 기록은 거란 시기의 한 사건입니다.",
      firstChoices: goryeoRelationsFirstChoices,
      evidence: [{ id: "diplomacy-seohui", label: "[거란 시기] 서희가 상대의 목적과 여진 문제를 짚어 협상했고, 거란이 고려의 권리를 인정하고 물러난 사례" }],
    },
    {
      id: "border-defender",
      icon: "🏯",
      name: "북방 방어 담당자",
      privateInfo: "담판 뒤 고려는 여진을 몰아내고 성을 쌓아 강동 6주를 차츰 만들어 갔습니다. 이 6주는 거란이 다시 쳐들어왔을 때 앞에서 맞서는 기지 구실을 했습니다. 한때는 개경이 함락되어 임금이 나주까지 피난한 위기도 있었고, 그 뒤 흥화진에서 귀주까지 이어진 방어로 거란군이 물러갔습니다.",
      interest: "외교로 얻은 결과도 성과 방어 거점이 있어야 지킬 수 있었다고 생각합니다. 전투가 끝난 뒤에도 거란과의 관계는 화친으로 다시 정리되었습니다.",
      firstChoices: goryeoRelationsFirstChoices,
      evidence: [{ id: "defense-gangdong", label: "[거란 시기] 성을 쌓은 강동 6주가 다시 침입을 막는 기지가 되었고, 흥화진에서 귀주까지 이어서 방어한 과정" }],
    },
    {
      id: "war-villager",
      icon: "🌾",
      name: "전란 속 마을 사람",
      privateInfo: "몽골이 여러 차례 쳐들어오는 동안 국토가 황폐해지고 백성이 큰 고통을 겪었다고 기록되어 있습니다. 대구 부인사에 있던 대장경 판목과 황룡사 9층탑 같은 문화재도 이때 불탔습니다. 삼별초가 섬을 옮겨 다닐 때에는 해안 지역이 비고 길이 막히는 일도 있었습니다.",
      interest: "나라의 대응을 평가할 때 백성의 생활 피해도 함께 살펴야 한다고 생각합니다. 이 자료는 몽골 시기 이야기이며, 거란 시기 백성의 생활은 우리 자료에 없습니다.",
      firstChoices: goryeoRelationsFirstChoices,
      evidence: [{ id: "villager-damage", label: "[몽골 시기] 오랜 침입으로 국토가 황폐해지고 백성이 고통을 겪었으며 문화재가 불탄 기록" }],
    },
    {
      id: "ganghwa-recorder",
      icon: "🌊",
      name: "강화·항쟁 기록자",
      privateInfo: "1231년 몽골이 침입한 뒤 이어서 여러 차례 쳐들어왔고, 집권자 최우는 1232년 도읍을 강화도로 옮겼습니다. 몽골군이 바다 싸움에 약했다는 이유와 함께 최씨 정권을 지키려는 계산도 있었다고 설명합니다. 처인성에서는 승려 김윤후가 몽골 장수를 쏘아 죽였고, 나중에 삼별초는 강화를 받아들이지 않고 진도와 제주도로 옮겨 가며 1273년까지 저항했습니다.",
      interest: "저항의 뜻과 오래 이어진 전쟁의 부담을 함께 살펴야 한다고 생각합니다. 삼별초를 영웅이나 반란 한쪽으로만 말하기는 어렵습니다.",
      firstChoices: goryeoRelationsFirstChoices,
      evidence: [{ id: "ganghwa-resistance", label: "[몽골 시기] 강화도로 도읍을 옮기고, 처인성과 삼별초처럼 여러 곳에서 저항이 이어진 과정" }],
    },
    {
      id: "timeline-reviewer",
      icon: "🗓️",
      name: "관계 연표 검토자",
      privateInfo: "거란과의 일은 10~11세기, 몽골과의 일은 13세기에 있었던 서로 다른 시기의 일입니다. 몽골과의 오랜 전쟁은 강화와 복속(힘센 쪽을 따르는 관계)으로 이어졌습니다. 기록은 고려의 국가 위상이 보장되는 가운데 몽골의 강한 간섭도 받았다고 설명합니다.",
      interest: "두 시기를 하나의 전쟁처럼 섞지 않도록 확인하고 싶습니다. 몽골과의 결과도 이겼다 졌다 한쪽으로만 평가하지 않도록 살피고 싶습니다.",
      firstChoices: goryeoRelationsFirstChoices,
      evidence: [{ id: "timeline-eras", label: "[두 시기 비교] 거란(10~11세기)과 몽골(13세기)은 서로 다른 시기이고, 몽골과의 관계는 복속을 전제로 한 간섭 속에서 이어졌다는 설명" }],
    },
  ],
  sharedPrompt: {
    question: "고려는 주변 나라의 위기에 어떻게 대응했고, 그 선택은 사람들의 생활에 어떤 영향을 주었을까?",
    policies: [
      { id: "negotiate", label: "상대의 목적을 읽고 협상한 외교" },
      { id: "defend", label: "성과 방어 거점을 갖추고 싸운 방어" },
      { id: "relocate-resist", label: "도읍을 옮기고 이어 간 저항" },
      { id: "reduce-harm", label: "백성의 피해를 줄이려는 노력" },
    ],
    limitations: [
      { id: "single-event", label: "한두 사건의 결과만으로 고려의 모든 대외 관계를 설명할 수 없다" },
      { id: "two-eras", label: "거란 시기와 몽골 시기는 서로 다르므로 한 시기의 모습을 다른 시기에 그대로 적용할 수 없다" },
      { id: "people-gap", label: "우리 자료는 몽골 시기 백성의 피해만 전하고, 거란 시기 백성의 생활은 알 수 없다" },
    ],
    connections: [
      { id: "diplomacy-needs-defense", label: "외교로 얻은 결과를 지키려면 성과 방어 거점이 함께 필요했다" },
      { id: "resist-cost", label: "몽골 시기의 도읍 이동과 저항은 나라를 지키려는 선택이었지만, 오랜 전쟁으로 백성과 문화재가 큰 피해를 입었다" },
      { id: "different-eras", label: "거란 시기에는 협상과 방어가, 몽골 시기에는 도읍 이동과 저항이 중심이어서 같은 방법이 두 시기에 똑같이 쓰이지 않았다" },
      { id: "resistance-spread", label: "삼별초의 저항은 강화 결정에 대한 반대에서 시작되었고, 그 이동은 주변 지역 사람들에게도 영향을 주었다" },
    ],
    whyTogetherStem: "서로 다른 시기와 처지의 자료를 함께 보면",
  },
  commonEvidenceByGroupSize: {
    3: [{ id: "common-villager", label: "공통 자료: [몽골 시기] 오랜 침입으로 국토가 황폐해지고 백성이 고통을 겪었으며 문화재가 불탔다는 기록" }],
    4: [],
    5: [],
  },
  teacherStages: ["role", "first", "share", "draft", "confirm", "finished"],
  interventions: {
    hint: "지금 말한 대응은 어느 시기의 일인가요? 거란과 몽골 침입을 구분해 보세요.",
    deepen: "그 선택은 나라를 지키는 데 어떤 도움이 되었고, 평범한 사람의 생활에는 어떤 부담을 주었을까요?",
  },
  sources: [
    {
      claim: "993년 서희의 담판과 강동 6주 개척, 거란 재침입 때 전진 기지 역할",
      url: "https://contents.history.go.kr/front/tg/print.do?levelId=tg_002_1060&treeId=&whereStr=",
      accessedAt: "2026-10-02",
    },
    {
      claim: "거란 침입 때 흥화진·귀주로 이어진 강감찬의 방어 과정",
      url: "https://contents.history.go.kr/front/hm/print.do?levelId=hm_048_0030&tabId=03&treeId=010401&whereStr=",
      accessedAt: "2026-10-02",
    },
    {
      claim: "거란 2차 침입 때 개경 함락과 현종의 피난, 귀주대첩 뒤 책봉·연호 사용 방식의 화친",
      url: "https://contents.history.go.kr/front/ta/print.do?levelId=ta_h31_0050_0010_0030",
      accessedAt: "2026-10-02",
    },
    {
      claim: "1231년 몽골 침입, 강화도 천도, 처인성 전투, 몽골 침입의 피해, 환도와 복속 관계",
      url: "https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_h31_0050_0040_0010",
      accessedAt: "2026-10-02",
    },
    {
      claim: "최우의 1232년 강화도 천도와 해도입보책, 몽골에 대한 복속 관계",
      url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i200800&code=kc_age_20",
      accessedAt: "2026-10-02",
    },
    {
      claim: "삼별초의 구성과 강화 반대, 진도·제주도로의 이동과 1273년 진압",
      url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_o200400&code=kc_age_20",
      accessedAt: "2026-10-02",
    },
  ],
};

const goryeoCulturePublic = publicScenario("goryeo-culture-life");
const goryeoCultureFirstChoices = [
  { id: "technology", label: "문화유산은 고려의 기술 발달을 보여 준다" },
  { id: "people", label: "문화유산과 기록은 사람들의 생활도 보여 준다" },
  { id: "whole-society", label: "남은 유물만으로 고려 사람 모두의 삶을 알 수 있다" },
] as const;

const goryeoCulture: CooperativeScenario = {
  ...goryeoCulturePublic,
  roles: [
    {
      id: "celadon-artisan",
      icon: "🏺",
      name: "청자 공방 장인",
      privateInfo: "역할극 자료: 고려청자는 맑고 푸른 비색과 상감 무늬로 알려져 있습니다. 상감청자는 그릇에 무늬를 새기고 흰 흙이나 검은 흙을 넣어 표현했습니다.",
      interest: "정교한 청자를 만든 기술을 소개하되, 청자 한 점만으로 모든 사람이 이를 쓰거나 가졌다고 단정하지 않으려 합니다.",
      firstChoices: goryeoCultureFirstChoices,
      evidence: [{ id: "celadon-inlay", label: "비색과 상감 기법은 고려 도자 제작 기술의 발달을 보여 준다" }],
    },
    {
      id: "family-record-reader",
      icon: "📜",
      name: "가족 기록 살피는 사람",
      privateInfo: "염경애 묘지명에는 한 고려 여성의 가족 관계와 재산 상속에 관한 내용이 남아 있습니다. 딸들이 재산을 받은 사례이지만, 한 가족의 기록만으로 모든 고려 여성의 삶을 설명할 수는 없습니다.",
      interest: "문화유산뿐 아니라 가족과 재산에 관한 기록도 살펴, 당시 생활 모습을 구체적인 사례로 말하고 싶습니다.",
      firstChoices: goryeoCultureFirstChoices,
      evidence: [{ id: "inheritance-record", label: "염경애 묘지명에는 딸들이 재산을 받은 가족 사례가 기록되어 있다" }],
    },
    {
      id: "tripitaka-woodblock-reader",
      icon: "🪵",
      name: "대장경 목판 작업자",
      privateInfo: "역할극 자료: 고려는 몽골의 침입 시기에 부처의 힘으로 나라를 지키려는 뜻을 담아 대장경 목판을 새겼습니다. 판각에는 10년이 넘는 시간이 걸렸고 여러 계층의 사람이 참여했다는 기록이 있습니다. 작업자의 구체적인 생활과 작업 조건은 이 자료만으로 알 수 없습니다.",
      interest: "불교 신앙과 목판 제작이 나라를 지키려는 바람과 연결된 점을 설명하고, 긴 제작 과정에 많은 사람의 노동이 필요했음을 살펴보려 합니다.",
      firstChoices: goryeoCultureFirstChoices,
      evidence: [
        { id: "tripitaka-purpose", label: "대장경 목판에는 불교 신앙과 나라를 지키려는 염원이 담겼다" },
        { id: "tripitaka-labor", label: "10년 넘는 판각 기간과 여러 계층의 참여 기록은 많은 사람의 노동이 모였음을 보여 준다" },
      ],
    },
    {
      id: "movable-type-printer",
      icon: "🔤",
      name: "금속 활자 인쇄 기술자",
      privateInfo: "직지는 1377년에 금속 활자로 인쇄되었습니다. 지금까지 남아 있는 금속 활자 인쇄 책 가운데 가장 오래된 것으로 알려져 있습니다. 이 책 한 권만으로 금속 활자 인쇄가 얼마나 널리 쓰였는지는 알 수 없습니다.",
      interest: "고려에 금속 활자 기술이 있었음을 알리면서, 기술이 있었다는 사실과 누구나 책을 쉽게 볼 수 있었다는 주장은 구분하고 싶습니다.",
      firstChoices: goryeoCultureFirstChoices,
      evidence: [{ id: "jikji-metal-type", label: "1377년 직지는 고려의 금속 활자 인쇄 기술을 보여 주는 현존 자료다" }],
    },
    {
      id: "evidence-curator",
      icon: "🔎",
      name: "자료 한계 검토자",
      privateInfo: "청자·묘지명·목판·책은 서로 다른 까닭으로 만들어지고 보존된 자료입니다. 남은 자료는 당시 모든 지역과 계층의 일상을 똑같이 보여 주지 않습니다.",
      interest: "무엇을 알 수 있는지와 아직 알기 어려운 점을 나누어, 모둠의 설명이 한 사례를 전체로 넓히지 않게 돕고 싶습니다.",
      firstChoices: goryeoCultureFirstChoices,
      evidence: [{ id: "evidence-scope", label: "남은 유물과 기록만으로 모든 사람의 생활을 알 수는 없다" }],
    },
  ],
  sharedPrompt: {
    question: "고려의 문화유산과 기록은 고려 사람들의 삶과 생각을 어디까지 보여 줄까?",
    policies: [
      { id: "craft-technology", label: "청자와 금속 활자에서 제작 기술과 지식을 살펴본다" },
      { id: "belief-purpose", label: "대장경에서 불교 신앙과 나라를 지키려는 염원을 살펴본다" },
      { id: "family-life", label: "가족 기록에서 재산과 생활 모습을 살펴본다" },
    ],
    limitations: [
      { id: "one-family", label: "한 가족의 묘지명만으로 모든 고려 가족의 모습을 알 수 없다" },
      { id: "who-used", label: "남은 청자와 직지만으로 누가 얼마나 자주 사용했는지 알 수 없다" },
      { id: "missing-lives", label: "남은 유물과 기록에는 여러 지역·계층의 생활이 빠져 있을 수 있다" },
    ],
    connections: [
      { id: "tech-and-access", label: "청자와 직지는 정교한 제작 기술을 보여 주지만, 모든 사람이 이를 이용했는지는 다른 자료가 필요하다" },
      { id: "belief-and-work", label: "대장경은 불교 신앙과 나라를 지키려는 염원을 보여 주며, 긴 제작 기간에는 많은 사람의 작업이 필요했다" },
      { id: "record-and-scope", label: "묘지명은 한 가족의 생활을 보여 주지만 다른 계층과 지역의 경험까지 대표하지는 않는다" },
    ],
    whyTogetherStem: "서로 다른 유물과 기록을 함께 보면",
  },
  draftRequirements: {
    policyIds: ["family-life"],
    evidenceRoleIds: ["family-record-reader"],
    connectionIds: ["record-and-scope"],
  },
  commonEvidenceByGroupSize: {
    3: [{ id: "common-jikji", label: "공통 자료: 1377년 직지는 고려의 금속 활자 인쇄 기술을 보여 주는 현존 자료다" }],
    4: [],
    5: [],
  },
  teacherStages: ["role", "first", "share", "draft", "confirm", "finished"],
  interventions: {
    hint: "자료에 직접 적힌 사실과, 그 사실에서 짐작한 점을 나누어 말해 볼까요?",
    deepen: "이 자료가 보여 주지 않는 사람이나 생활은 누구일까요? 다른 자료가 더 필요한 까닭은 무엇인가요?",
  },
  sources: [
    {
      claim: "고려청자의 비색과 상감 기법 및 장인의 제작 기술",
      url: "https://www.museum.go.kr/MUSEUM/contents/M0501000000.do?relicRecommendId=254458&schM=view",
      accessedAt: "2026-10-02",
    },
    {
      claim: "염경애 묘지명에 기록된 한 가족의 관계와 딸의 재산 상속 사례",
      url: "https://contents.history.go.kr/front/hm/view.do?levelId=hm_064_0040",
      accessedAt: "2026-10-02",
    },
    {
      claim: "고려대장경 목판의 제작 기간·참여와 몽골 침입기 불교 신앙·수호 염원",
      url: "https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0150_0010&code=eh_age_20",
      accessedAt: "2026-10-02",
    },
    {
      claim: "1377년 직지와 고려 금속 활자 인쇄의 현존 자료 범위",
      url: "https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0160_0010",
      accessedAt: "2026-10-02",
    },
  ],
};

export const SCENARIOS: readonly CooperativeScenario[] = [
  gojoseon,
  earlyGoryeo,
  joseonLate,
  goryeoRelations,
  goryeoCulture,
];

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
  for (const scenario of SCENARIOS) {
    const key = `${scenario.id}:${scenario.version}`;
    for (const policyId of scenario.draftRequirements?.policyIds ?? []) {
      if (!scenario.sharedPrompt.policies.some((policy) => policy.id === policyId)) {
        errors.push(`${key}: unknown required policy ${policyId}`);
      }
    }
    for (const roleId of scenario.draftRequirements?.evidenceRoleIds ?? []) {
      if (!scenario.roles.some((role) => role.id === roleId)) {
        errors.push(`${key}: unknown required evidence role ${roleId}`);
      }
    }
    for (const connectionId of scenario.draftRequirements?.connectionIds ?? []) {
      if (!scenario.sharedPrompt.connections.some((item) => item.id === connectionId)) {
        errors.push(`${key}: unknown required connection ${connectionId}`);
      }
    }
  }
  return errors;
}
