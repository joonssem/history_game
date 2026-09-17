// =========================================================
// scripts/15_validate_cooperative_packet.js
// 실시간 협동 시나리오 콘텐츠 패킷(`CooperativeScenario`, 계획서
// implementation_plan_joseon_late_cooperative_live_vertical_slice.md §4)의
// "계약 관문"을 기계가 검사할 수 있는 것만 옮긴다. 앱은 아직 이 JSON을
// 읽지 않는다 — 콘텐츠 초안이 계약 모양을 지키는지만 확인한다.
//
// 연결 공방과 병렬로 작업하므로, 대상 파일이 아직 없으면 건너뛰고
// 통과한다(실패로 막지 않는다).
//
// 라운드 7: 부정문 오탐 제거, D-034 확정값·역할 카드 문서와의 교차 검사,
// 타입에 없는 최상위 필드 경고, 자리표시자 개수 보고(--final로 실패 전환)를
// 추가했다. 1단계(라운드 7)는 연결 공방·관문 설계실의 id 변경과 동시에
// 진행되므로, 각 창의 개별 worktree에서는 교차 검사가 실패할 수 있다 —
// 실패해도 정상이며, 통합본 기준으로 통과하면 된다(지시서 §4 1단계 주의).
//
// 라운드 8: 문장 나누기가 "다"·"요"에서도 잘려 부정문 오탐을 냈던 결함을
// 고치고(C1-05) 회귀 fixture를 넣었다. `--runtime <파일>`을 추가해 실제 앱
// 계약(`apps/cooperative-live/convex/scenarios.ts`·`shared/scenario.ts`,
// **읽기만 함**)과 같은 모양으로 조립된 최종 JSON을 검사한다 — 이 검사는
// **콘텐츠 모양**만 본다. 실제 등록 가능 여부는 Codex의
// `validateScenarioRegistry()`와 앱 테스트가 판정한다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const PACKET_DIR = path.join(__dirname, '..', 'data', 'cooperative');
const ROLE_CARD_DOC = path.join(__dirname, '..', 'docs', 'handoff', 'claude_joseon_late_role_cards.md');
const OVERCLAIM_WORDS = ['모든 사람', '전국', '즉시', '누구나', '완전히'];
const PLACEHOLDER_MARKER = '[PLACEHOLDER';
const IS_FINAL = process.argv.includes('--final');
const IS_CARDS = process.argv.includes('--cards');
const RUNTIME_FLAG_INDEX = process.argv.indexOf('--runtime');
const RUNTIME_FILE = RUNTIME_FLAG_INDEX >= 0 ? process.argv[RUNTIME_FLAG_INDEX + 1] : null;

// 라운드 7 2단계 §3: 아이패드 가독성 기준값. 전부 제안값이며, 실패로
// 막지 않고 경고만 낸다 — 수업 리허설(10/12~16)에서 실측하며 조정한다.
const LENGTH_LIMITS = {
  privateInfoSentenceMin: 3,
  privateInfoSentenceMax: 5,
  privateInfoRecommended: 40,
  privateInfoWarn: 60,
  singleSentenceWarn: 80,
  shortLabelWarn: 30,
  limitTextWarn: 60
};

function isPlaceholder(text) {
  return typeof text === 'string' && text.includes(PLACEHOLDER_MARKER);
}

// D-034(라운드 7 확정값). "확정값"과 다르면 라운드 6에서 벌어진 것과 같은
// 어긋남(역할 id·5인 역할·3인 구성이 문서마다 달랐던 문제)이므로 실패로 낸다.
const CONFIRMED_ROLES = {
  farmer: { evidenceId: 'farmer-ipbeop', variants: [3, 4, 5] },
  bobusang: { evidenceId: 'bobusang-currency', variants: [3, 4, 5] },
  craftsman: { evidenceId: 'jangsi-craftsman', variants: [4, 5] },
  recordkeeper: { evidenceId: 'record-keeper-scope', variants: [3, 4, 5] },
  laborer: { evidenceId: 'laborer-wage', variants: [5] }
};
const THREE_PERSON_SHARED_EVIDENCE_ID = 'jangsi-craftsman-summary';

// --runtime: 실제 앱 계약 모양. apps/cooperative-live/convex/scenarios.ts의
// CooperativeScenario·apps/cooperative-live/shared/scenario.ts의
// PublicScenario를 **읽고** 옮긴 것이다(이 스크립트는 그 파일들을 고치지
// 않는다). 라운드 6·7의 패킷 초안 계약(KNOWN_TOP_LEVEL_FIELDS 등)과는
// 필드 이름이 다르다 — 예를 들어 패킷의 role별 `sharePrompt`는 앱에 없고,
// 앱의 `sharedPrompt`(공유, 모둠 단위)는 패킷에 없던 필드다.
const RUNTIME_TOP_LEVEL_FIELDS = new Set([
  'id', 'version', 'publicMeta', 'groupSizes', 'roles',
  'sharedPrompt', 'commonEvidenceByGroupSize', 'teacherStages',
  'interventions', 'sources'
]);
const RUNTIME_PUBLIC_META_FIELDS = new Set(['title', 'lesson', 'recommendedMinutes']);
const RUNTIME_ROLE_FIELDS = new Set(['id', 'icon', 'name', 'privateInfo', 'interest', 'firstChoices', 'evidence']);
const RUNTIME_SHARED_PROMPT_FIELDS = new Set(['question', 'policies', 'limitations', 'connections', 'whyTogetherStem']);
const RUNTIME_INTERVENTIONS_FIELDS = new Set(['hint', 'deepen']);
const RUNTIME_SOURCE_FIELDS = new Set(['claim', 'url', 'accessedAt']);
const RUNTIME_MIN_POLICIES = 3; // 모둠이 2개를 고르므로(§3-4) 고를 여지가 있으려면 3개 이상
const RUNTIME_MIN_FIRST_CHOICES = 2;

function checkUnknownFields(obj, allowed, label, errors) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach(key => {
    if (!allowed.has(key)) errors.push(`${label}에 앱 계약에 없는 필드 "${key}"이(가) 있습니다.`);
  });
}

// CooperativeScenario 타입(계획서 §4)에 정의된 최상위 필드만 허용한다.
// `_`로 시작하는 키는 이 파일이 초안임을 표시하는 메모 관례로 보고 넘어간다
// (예: `_draftNote`).
const KNOWN_TOP_LEVEL_FIELDS = new Set([
  'id', 'version', 'title', 'lessonLabel', 'commonPrompt', 'roles',
  'groupVariants', 'firstJudgment', 'synthesis', 'interventions', 'stickyWall'
]);

// "~인지는 알 수 없다", "~라고 단정할 수 없다"처럼 부정·한계를 말하는 문장은
// 그 자체가 과잉 단정을 **경계하는** 문장이다. limitOptions가 대표 사례다.
const NEGATION_PATTERN = /(수(는)?\s*없|것은\s*아니|않았|아니었|알기\s*어렵)/;

// C1-05(라운드 8): 마침표·물음표·느낌표·줄바꿈에서만 문장을 나눈다. 이전에는
// 어중의 "다"·"요" 뒤 공백에서도 잘라, "내다 팔아"·"다 조사하지는" 같은
// 문장 중간의 "다"가 문장 경계로 오인됐다. 그 결과 과잉 단정어와 그것을
// 부정하는 문구가 서로 다른 "문장"으로 쪼개져 부정문 오탐(§4-2)이 났다.
function splitSentences(text) {
  return String(text || '').split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
}

function collectStudentFacingTexts(packet) {
  const texts = [];
  const push = (label, value) => { if (typeof value === 'string' && value) texts.push([label, value]); };

  push('commonPrompt', packet.commonPrompt);
  (packet.roles || []).forEach(role => {
    push(`roles[${role.id}].privateInfo`, role.privateInfo);
    push(`roles[${role.id}].sharePrompt`, role.sharePrompt);
    push(`roles[${role.id}].interest`, role.interest);
  });
  if (packet.firstJudgment) {
    push('firstJudgment.prompt', packet.firstJudgment.prompt);
    push('firstJudgment.reasonPrompt', packet.firstJudgment.reasonPrompt);
    (packet.firstJudgment.choices || []).forEach(c => push(`firstJudgment.choices[${c.id}].text`, c.text));
  }
  if (packet.synthesis) {
    push('synthesis.claimPrompt', packet.synthesis.claimPrompt);
    (packet.synthesis.targetOptions || []).forEach(o => push(`synthesis.targetOptions[${o.id}].text`, o.text));
    (packet.synthesis.evidenceOptions || []).forEach(o => push(`synthesis.evidenceOptions[${o.id}].shortLabel`, o.shortLabel));
    (packet.synthesis.limitOptions || []).forEach(o => push(`synthesis.limitOptions[${o.id}].text`, o.text));
  }
  if (packet.interventions) {
    push('interventions.hint', packet.interventions.hint);
    push('interventions.deepen', packet.interventions.deepen);
  }
  if (packet.stickyWall) push('stickyWall.heading', packet.stickyWall.heading);

  return texts;
}

// 문서의 헤딩 `### 이름 (\`id\`)` / `#### 이름 (\`id\`)`과 그 아래 첫
// `**evidenceId**: \`값\`` 줄만 짝지어 읽는다. 백틱 id를 읽는 정도면
// 충분하다는 지시(§4 2) 그대로, 본문 서술은 파싱하지 않는다.
function extractRoleIdsFromDoc(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const lines = fs.readFileSync(docPath, 'utf-8').split(/\r?\n/);
  const headingRe = /^#{2,6}\s+.*?\(`([a-z][a-z0-9_-]*)`\)/;
  const evidenceRe = /\*\*evidenceId\*\*:\s*`([a-z][a-z0-9_-]*)`/;
  const pairs = [];
  let currentId = null;
  for (const line of lines) {
    const heading = line.match(headingRe);
    if (heading) { currentId = heading[1]; continue; }
    const evidence = line.match(evidenceRe);
    if (evidence && currentId) {
      pairs.push({ id: currentId, evidenceId: evidence[1] });
      currentId = null;
    }
  }
  return pairs;
}

// --cards용: 역할 카드 문서의 "- **privateInfo**(...):" 아래 번호 목록
// 항목을 역할별로 뽑는다. 각 항목이 이미 문장 하나이므로 다시 나누지
// 않는다. 항목 끝의 `[출처 후보: ...]` 같은 인라인 코드(백틱) 표기는
// 학생 화면에 나가지 않는 메모라 길이 계산에서 뺀다.
function extractPrivateInfoFromDoc(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const lines = fs.readFileSync(docPath, 'utf-8').split(/\r?\n/);
  const headingRe = /^#{2,6}\s+.*?\(`([a-z][a-z0-9_-]*)`\)/;
  const fieldLineRe = /^-\s+\*\*(\w+)\*\*/;
  const listItemRe = /^\s*\d+\.\s+(.*)$/;
  const cardsByRole = new Map();
  let currentId = null;
  let collecting = false;
  for (const line of lines) {
    const heading = line.match(headingRe);
    if (heading) { currentId = heading[1]; collecting = false; continue; }
    const field = line.match(fieldLineRe);
    if (field) {
      collecting = field[1] === 'privateInfo';
      if (collecting && currentId && !cardsByRole.has(currentId)) cardsByRole.set(currentId, []);
      continue;
    }
    if (!collecting || !currentId) continue;
    // "메모:" 줄(항목 아래 별도 줄)은 애초에 번호 목록 형식이 아니라 위
    // listItemRe에 걸리지 않고 자연히 건너뛴다. 여기서는 항목 줄 자체에
    // 남은 인라인 메모(백틱 코드, 줄 끝 대괄호)만 제거한다(C1-05 §3).
    const item = line.match(listItemRe);
    if (!item) continue;
    // 메모는 항상 줄 끝에 붙는 관례라, 첫 백틱부터 줄 끝까지 통째로 잘라낸다
    // (메모 안에 인용 URL 슬러그 등 백틱이 중첩되는 경우가 있어, 짝을 맞춰
    // 지우려던 이전 방식은 중첩된 안쪽만 남기는 문제가 있었다).
    const text = item[1]
      .replace(/`.*$/, '')
      .replace(/\[[^\]]*\]\s*$/, '')
      .trim();
    if (text) cardsByRole.get(currentId).push(text);
  }
  return cardsByRole;
}

function checkPrivateInfoLength(label, sentences, warnings) {
  if (!sentences.length) return;
  if (sentences.length < LENGTH_LIMITS.privateInfoSentenceMin || sentences.length > LENGTH_LIMITS.privateInfoSentenceMax) {
    warnings.push(`${label}: 문장 ${sentences.length}개 — 권장 ${LENGTH_LIMITS.privateInfoSentenceMin}~${LENGTH_LIMITS.privateInfoSentenceMax}문장(제안값)`);
  }
  sentences.forEach((sentence, index) => {
    const length = sentence.length;
    if (length > LENGTH_LIMITS.privateInfoWarn) {
      warnings.push(`${label}[${index + 1}]: ${length}자 — 권장 ${LENGTH_LIMITS.privateInfoRecommended}자 안팎, ${LENGTH_LIMITS.privateInfoWarn}자 초과(제안값): "${sentence}"`);
    }
  });
}

function checkSingleSentenceLength(label, text, limit, warnings) {
  if (!text) return;
  if (text.length > limit) {
    warnings.push(`${label}: ${text.length}자 — ${limit}자 초과(제안값): "${text}"`);
  }
}

function checkReadability(packet) {
  const warnings = [];
  (packet.roles || []).forEach(role => {
    if (!isPlaceholder(role.privateInfo)) {
      checkPrivateInfoLength(`roles[${role.id}].privateInfo`, splitSentences(role.privateInfo), warnings);
    }
    if (!isPlaceholder(role.sharePrompt)) {
      checkSingleSentenceLength(`roles[${role.id}].sharePrompt`, role.sharePrompt, LENGTH_LIMITS.singleSentenceWarn, warnings);
    }
    if (!isPlaceholder(role.interest)) {
      checkSingleSentenceLength(`roles[${role.id}].interest`, role.interest, LENGTH_LIMITS.singleSentenceWarn, warnings);
    }
  });
  if (packet.firstJudgment && !isPlaceholder(packet.firstJudgment.prompt)) {
    checkSingleSentenceLength('firstJudgment.prompt', packet.firstJudgment.prompt, LENGTH_LIMITS.singleSentenceWarn, warnings);
  }
  (packet.synthesis?.evidenceOptions || []).forEach(o => {
    if (!isPlaceholder(o.shortLabel)) {
      checkSingleSentenceLength(`synthesis.evidenceOptions[${o.id}].shortLabel`, o.shortLabel, LENGTH_LIMITS.shortLabelWarn, warnings);
    }
  });
  (packet.synthesis?.limitOptions || []).forEach(o => {
    if (!isPlaceholder(o.text)) {
      checkSingleSentenceLength(`synthesis.limitOptions[${o.id}].text`, o.text, LENGTH_LIMITS.limitTextWarn, warnings);
    }
  });
  return warnings;
}

function checkOverclaimWords(packet) {
  const warnings = [];
  collectStudentFacingTexts(packet).forEach(([fieldLabel, text]) => {
    splitSentences(text).forEach(sentence => {
      OVERCLAIM_WORDS.forEach(word => {
        if (!sentence.includes(word)) return;
        if (NEGATION_PATTERN.test(sentence)) return; // 부정·한계 문장 오탐 제거(라운드 7 §4-1)
        warnings.push(`${fieldLabel}: 과잉 단정어 "${word}"이(가) 있습니다 — "${sentence.trim()}"`);
      });
    });
  });
  return warnings;
}

// C1-05 회귀 fixture(라운드 8 §3-1·2). 실제로 오탐을 냈던 문구를 그대로
// 박아 둔다 — 이 함수가 실패하면 splitSentences/checkOverclaimWords 자체가
// 다시 망가진 것이므로 항상 실행하고, 깨지면 스크립트를 즉시 실패시킨다.
function runRegressionFixtures() {
  // "내다 팔아": 문장 중간의 "다" 뒤에 공백이 있어도 문장이 갈라지면 안 된다.
  const farmerSentence = '남는 곡식은 장시에 내다 팔아 돈을 마련합니다.';
  assert.deepEqual(
    splitSentences(farmerSentence),
    [farmerSentence],
    'C1-05 회귀: "내다 팔아"에서 문장이 잘못 나뉘면 안 됩니다.'
  );

  // "다 조사": 마찬가지로 "다"가 부사로 쓰인 경우.
  const recordkeeperSentence = '장시가 서는 날짜와 파는 물건 종류는 고을마다 기록이 다르고, 먼 지역까지 다 조사하지는 못합니다.';
  assert.deepEqual(
    splitSentences(recordkeeperSentence),
    [recordkeeperSentence],
    'C1-05 회귀: "다 조사"에서 문장이 잘못 나뉘면 안 됩니다.'
  );

  // 기록관 interest: "모든 사람"(과잉 단정어)과 그것을 부정하는 "알 수
  // 없다"가 원래 한 문장이다. 문장이 잘못 갈라지면 부정 문맥을 놓쳐
  // "모든 사람"만 남은 조각에 오탐이 뜬다(라운드 8 §3-2).
  const recordkeeperInterest = '정확하게 기록하고 싶지만, 제가 가진 기록만으로는 모든 사람과 모든 고을의 사정을 다 알 수 없다는 것도 분명히 밝히고 싶습니다.';
  const fixturePacket = {
    roles: [{ id: 'recordkeeper', evidenceId: 'record-keeper-scope', privateInfo: 'x', sharePrompt: 'x', interest: recordkeeperInterest }]
  };
  assert.deepEqual(
    checkOverclaimWords(fixturePacket),
    [],
    'C1-05 회귀: 기록관 interest의 "모든 사람...알 수 없다"는 경고하면 안 됩니다.'
  );
}

function checkUnknownTopLevelFields(packet) {
  return Object.keys(packet)
    .filter(key => !key.startsWith('_') && !KNOWN_TOP_LEVEL_FIELDS.has(key))
    .map(key => `최상위 필드 "${key}"은(는) CooperativeScenario 타입(계획서 §4)에 없습니다 — 앱 데이터가 아니라면 별도 문서로 옮기는 것을 검토하세요.`);
}

function countPlaceholders(packet) {
  const json = JSON.stringify(packet);
  return (json.match(new RegExp(PLACEHOLDER_MARKER.replace(/[[\]]/g, '\\$&'), 'g')) || []).length;
}

// D-034 확정값과 role-card 문서 양쪽에 패킷을 대조한다. 어느 한쪽이 비교
// 대상 자체가 없으면(문서가 아직 없거나 role이 비어 있으면) 그 축은 건너뛴다.
function checkCrossReferences(packet, docPairs) {
  const errors = [];
  const roles = Array.isArray(packet.roles) ? packet.roles : [];

  roles.forEach(role => {
    const confirmed = CONFIRMED_ROLES[role.id];
    if (!confirmed) {
      errors.push(`roles[].id "${role.id}"은(는) D-034 확정값(${Object.keys(CONFIRMED_ROLES).join(', ')})에 없습니다.`);
      return;
    }
    if (role.evidenceId !== confirmed.evidenceId) {
      errors.push(`roles[${role.id}].evidenceId가 "${role.evidenceId}"인데, D-034 확정값은 "${confirmed.evidenceId}"입니다.`);
    }
  });

  const packetRoleIds = new Set(roles.map(r => r.id));
  Object.entries(CONFIRMED_ROLES).forEach(([id, { variants }]) => {
    if (!packetRoleIds.has(id)) {
      errors.push(`D-034 확정 역할 "${id}"이(가) roles에 없습니다(참여 변형: ${variants.join('/')}인).`);
    }
  });

  // 3인 변형은 craftsman·laborer 대신 공통 자료를 쓴다(D-034).
  const threeVariant = packet.groupVariants?.[3];
  if (threeVariant) {
    if ((threeVariant.roleIds || []).some(id => id === 'craftsman' || id === 'laborer')) {
      errors.push('groupVariants.3.roleIds에 craftsman·laborer가 있습니다 — D-034는 3인에서 이 둘을 겸임 대신 공통 자료로 보충하기로 했습니다.');
    }
    if (!(threeVariant.sharedEvidenceIds || []).includes(THREE_PERSON_SHARED_EVIDENCE_ID)) {
      errors.push(`groupVariants.3.sharedEvidenceIds에 "${THREE_PERSON_SHARED_EVIDENCE_ID}"이(가) 없습니다(D-034 3인 공통 자료).`);
    }
  }
  const fiveVariant = packet.groupVariants?.[5];
  if (fiveVariant && !(fiveVariant.roleIds || []).includes('laborer')) {
    errors.push('groupVariants.5.roleIds에 laborer가 없습니다 — D-034는 laborer를 다섯째 역할로 정했습니다.');
  }

  if (docPairs) {
    const docById = new Map(docPairs.map(p => [p.id, p.evidenceId]));
    roles.forEach(role => {
      if (!docById.has(role.id)) {
        errors.push(`역할 카드 문서(claude_joseon_late_role_cards.md)에 패킷의 role "${role.id}"가 보이지 않습니다.`);
        return;
      }
      const docEvidenceId = docById.get(role.id);
      if (docEvidenceId !== role.evidenceId) {
        errors.push(`역할 카드 문서의 "${role.id}" evidenceId("${docEvidenceId}")가 패킷("${role.evidenceId}")과 다릅니다.`);
      }
    });
    docPairs.forEach(({ id }) => {
      if (!packetRoleIds.has(id)) {
        errors.push(`역할 카드 문서에는 role "${id}"가 있는데 패킷 roles에는 없습니다.`);
      }
    });
  }

  return errors;
}

function validatePacket(fileName, packet, docPairs) {
  const errors = [];
  const warnings = [];

  const roles = Array.isArray(packet.roles) ? packet.roles : [];
  const roleIdSet = new Set(roles.map(r => r.id));
  const evidenceIdSet = new Set([
    ...roles.map(r => r.evidenceId).filter(Boolean),
    ...((packet.synthesis?.evidenceOptions || []).map(o => o.id).filter(Boolean))
  ]);

  // roleIds/evidenceIds 참조 무결성
  const groupVariants = packet.groupVariants || {};
  [3, 4, 5].forEach(size => {
    const variant = groupVariants[size];
    if (!variant) { errors.push(`groupVariants.${size}가 없습니다.`); return; }
    const variantRoleIds = variant.roleIds || [];
    if (variantRoleIds.length !== size) {
      errors.push(`groupVariants.${size}.roleIds 길이가 ${variantRoleIds.length}입니다(기대: ${size}).`);
    }
    variantRoleIds.forEach(id => {
      if (!roleIdSet.has(id)) errors.push(`groupVariants.${size}.roleIds에 존재하지 않는 role "${id}"이(가) 있습니다.`);
    });
    (variant.sharedEvidenceIds || []).forEach(id => {
      if (!evidenceIdSet.has(id)) errors.push(`groupVariants.${size}.sharedEvidenceIds에 존재하지 않는 evidence "${id}"이(가) 있습니다.`);
    });

    // 참여자마다 고유 자료가 하나 이상인가 — 역할 중복(겸임) 자체가 그 역할의
    // 근거를 두 참여자가 나눠 갖는 것과 같으므로 먼저 겸임 여부부터 본다.
    const distinctRoleIds = new Set(variantRoleIds);
    if (distinctRoleIds.size !== variantRoleIds.length) {
      errors.push(`groupVariants.${size}.roleIds에 같은 역할이 중복됩니다(겸임) — 참여자마다 고유 자료를 가질 수 없습니다.`);
    } else {
      const evidencePerParticipant = variantRoleIds.map(id => roles.find(r => r.id === id)?.evidenceId).filter(Boolean);
      if (new Set(evidencePerParticipant).size !== variantRoleIds.length) {
        errors.push(`groupVariants.${size}: 참여자 역할 중 evidenceId가 겹치거나 비어 있습니다.`);
      }
    }

    // 3인 변형은 특히 겸임 금지를 명시적으로 확인한다(§1 지시).
    if (size === 3 && distinctRoleIds.size !== 3) {
      errors.push('3인 변형이 역할을 겸임시킵니다 — 지시서 §1은 이를 금지한다.');
    }
  });

  // roles 자체의 evidenceId 중복 확인(참조 대상 전체에서도 성립해야 한다)
  const allEvidenceIds = roles.map(r => r.evidenceId).filter(Boolean);
  if (new Set(allEvidenceIds).size !== allEvidenceIds.length) {
    errors.push('roles[].evidenceId에 중복된 값이 있습니다 — 역할마다 고유 자료여야 합니다.');
  }

  // synthesis 최소값
  const synthesis = packet.synthesis || {};
  if (!(Number(synthesis.minEvidence) >= 2)) {
    errors.push(`synthesis.minEvidence는 2 이상이어야 합니다(현재: ${synthesis.minEvidence}).`);
  }
  if (!(Number(synthesis.minDistinctRoleSources) >= 2)) {
    errors.push(`synthesis.minDistinctRoleSources는 2 이상이어야 합니다(현재: ${synthesis.minDistinctRoleSources}).`);
  }

  // limitOptions에 "알 수 없는 것" 항목이 있는가
  const limitOptions = synthesis.limitOptions || [];
  const hasUnknownOption = limitOptions.some(o => /알\s*수\s*없|알기\s*어렵|단정할\s*수\s*없/.test(o.text || ''));
  if (!limitOptions.length) {
    errors.push('synthesis.limitOptions가 비어 있습니다.');
  } else if (!hasUnknownOption) {
    errors.push('synthesis.limitOptions에 "이 자료만으로 알 수 없는 것"에 해당하는 항목이 보이지 않습니다.');
  }

  // synthesis.evidenceOptions[].roleId 참조 무결성(있을 때만)
  (synthesis.evidenceOptions || []).forEach(o => {
    if (o.roleId && !roleIdSet.has(o.roleId)) {
      errors.push(`synthesis.evidenceOptions[${o.id}].roleId "${o.roleId}"이(가) roles에 없습니다.`);
    }
  });

  // 라운드 7 추가 검사
  errors.push(...checkCrossReferences(packet, docPairs));
  warnings.push(...checkUnknownTopLevelFields(packet));
  warnings.push(...checkOverclaimWords(packet));
  // 라운드 7 2단계: 글 길이·가독성(제안값, 실패로 막지 않음)
  warnings.push(...checkReadability(packet));

  const placeholderCount = countPlaceholders(packet);
  if (placeholderCount > 0) {
    const message = `자리표시자(${PLACEHOLDER_MARKER}...)가 ${placeholderCount}곳 남아 있습니다.`;
    if (IS_FINAL) errors.push(`${message} --final 모드에서는 실패로 처리합니다.`);
    else warnings.push(`${message} (1단계는 경고 — 2단계 이후 --final로 확인)`);
  }

  return { fileName, errors, warnings, placeholderCount };
}

function collectRuntimeTexts(scenario) {
  const texts = [];
  const push = (label, value) => { if (typeof value === 'string' && value) texts.push([label, value]); };

  (scenario.roles || []).forEach(role => {
    push(`roles[${role.id}].privateInfo`, role.privateInfo);
    push(`roles[${role.id}].interest`, role.interest);
    (role.firstChoices || []).forEach(c => push(`roles[${role.id}].firstChoices[${c.id}].label`, c.label));
    (role.evidence || []).forEach(e => push(`roles[${role.id}].evidence[${e.id}].label`, e.label));
  });
  const shared = scenario.sharedPrompt || {};
  push('sharedPrompt.question', shared.question);
  (shared.policies || []).forEach(o => push(`sharedPrompt.policies[${o.id}].label`, o.label));
  (shared.limitations || []).forEach(o => push(`sharedPrompt.limitations[${o.id}].label`, o.label));
  (shared.connections || []).forEach(o => push(`sharedPrompt.connections[${o.id}].label`, o.label));
  Object.entries(scenario.commonEvidenceByGroupSize || {}).forEach(([size, list]) => {
    (list || []).forEach(e => push(`commonEvidenceByGroupSize[${size}][${e.id}].label`, e.label));
  });
  if (scenario.interventions) {
    push('interventions.hint', scenario.interventions.hint);
    push('interventions.deepen', scenario.interventions.deepen);
  }
  return texts;
}

// --runtime <파일>: 조립된 최종 JSON을 실제 앱 계약(콘텐츠 모양만) 기준으로
// 검사한다. 등록 가능 여부(중복 시나리오 id, 실제 앱 로딩 등)는 검사하지
// 않는다 — 그건 Codex의 validateScenarioRegistry()와 앱 테스트의 몫이다.
function validateRuntimeScenario(scenario) {
  const errors = [];
  const warnings = [];

  checkUnknownFields(scenario, RUNTIME_TOP_LEVEL_FIELDS, '최상위', errors);

  if (!scenario.id) errors.push('id가 없습니다.');
  if (!(Number(scenario.version) > 0)) errors.push('version이 없거나 올바르지 않습니다.');

  const publicMeta = scenario.publicMeta || {};
  if (!scenario.publicMeta) errors.push('publicMeta가 없습니다.');
  else {
    checkUnknownFields(publicMeta, RUNTIME_PUBLIC_META_FIELDS, 'publicMeta', errors);
    if (!publicMeta.title) errors.push('publicMeta.title이 없습니다.');
    if (!publicMeta.lesson) errors.push('publicMeta.lesson이 없습니다.');
    if (!(Number(publicMeta.recommendedMinutes) > 0)) errors.push('publicMeta.recommendedMinutes가 없거나 올바르지 않습니다.');
  }

  const roles = Array.isArray(scenario.roles) ? scenario.roles : [];
  if (!roles.length) errors.push('roles가 비어 있습니다.');
  const roleIdSet = new Set(roles.map(r => r.id));
  if (roleIdSet.size !== roles.length) errors.push('roles[].id에 중복이 있습니다.');
  roles.forEach(role => {
    checkUnknownFields(role, RUNTIME_ROLE_FIELDS, `roles[${role.id}]`, errors);
    if (!role.id) errors.push('roles[]에 id가 없는 항목이 있습니다.');
    if (!role.icon) errors.push(`roles[${role.id}].icon이 없습니다.`);
    if (!role.name) errors.push(`roles[${role.id}].name이 없습니다.`);
    if (!role.privateInfo) errors.push(`roles[${role.id}].privateInfo가 없습니다.`);
    if (!role.interest) errors.push(`roles[${role.id}].interest가 없습니다.`);
    if (!Array.isArray(role.firstChoices) || role.firstChoices.length < RUNTIME_MIN_FIRST_CHOICES) {
      errors.push(`roles[${role.id}].firstChoices는 ${RUNTIME_MIN_FIRST_CHOICES}개 이상이어야 합니다(현재: ${role.firstChoices?.length ?? 0}).`);
    }
    if (!Array.isArray(role.evidence) || role.evidence.length < 1) {
      errors.push(`roles[${role.id}].evidence는 1개 이상이어야 합니다.`);
    }
  });

  const groupSizes = scenario.groupSizes || {};
  [3, 4, 5].forEach(size => {
    const layout = groupSizes[size] ?? groupSizes[String(size)];
    if (!Array.isArray(layout)) { errors.push(`groupSizes.${size}가 없습니다.`); return; }
    if (layout.length !== size || new Set(layout).size !== size) {
      errors.push(`groupSizes.${size}는 서로 다른 역할 ${size}개여야 합니다(현재: ${layout.length}개).`);
    }
    layout.forEach(id => {
      if (!roleIdSet.has(id)) errors.push(`groupSizes.${size}에 존재하지 않는 role "${id}"이(가) 있습니다.`);
    });
  });

  const shared = scenario.sharedPrompt;
  if (!shared) {
    errors.push('sharedPrompt가 없습니다.');
  } else {
    checkUnknownFields(shared, RUNTIME_SHARED_PROMPT_FIELDS, 'sharedPrompt', errors);
    if (!shared.question) errors.push('sharedPrompt.question이 없습니다.');
    if (!shared.whyTogetherStem) errors.push('sharedPrompt.whyTogetherStem이 없습니다.');
    if (!Array.isArray(shared.policies) || shared.policies.length < RUNTIME_MIN_POLICIES) {
      errors.push(`sharedPrompt.policies는 ${RUNTIME_MIN_POLICIES}개 이상이어야 합니다(모둠이 2개를 고름, 현재: ${shared.policies?.length ?? 0}).`);
    }
    if (!Array.isArray(shared.limitations) || shared.limitations.length < 1) {
      errors.push('sharedPrompt.limitations는 1개 이상이어야 합니다.');
    }
    if (!Array.isArray(shared.connections) || shared.connections.length < 1) {
      errors.push('sharedPrompt.connections는 1개 이상이어야 합니다.');
    }
  }

  const commonEvidence = scenario.commonEvidenceByGroupSize;
  if (!commonEvidence) {
    errors.push('commonEvidenceByGroupSize가 없습니다.');
  } else {
    [3, 4, 5].forEach(size => {
      if (!Array.isArray(commonEvidence[size]) && !Array.isArray(commonEvidence[String(size)])) {
        errors.push(`commonEvidenceByGroupSize.${size}가 없습니다(빈 배열이어도 키는 있어야 합니다).`);
      }
    });
  }

  if (!Array.isArray(scenario.teacherStages) || !scenario.teacherStages.length) {
    errors.push('teacherStages가 비어 있습니다.');
  }

  if (!scenario.interventions) {
    errors.push('interventions가 없습니다.');
  } else {
    checkUnknownFields(scenario.interventions, RUNTIME_INTERVENTIONS_FIELDS, 'interventions', errors);
    if (!scenario.interventions.hint) errors.push('interventions.hint가 없습니다.');
    if (!scenario.interventions.deepen) errors.push('interventions.deepen이 없습니다.');
  }

  if (!Array.isArray(scenario.sources) || !scenario.sources.length) {
    errors.push('sources는 1개 이상이어야 합니다.');
  } else {
    scenario.sources.forEach((source, index) => {
      checkUnknownFields(source, RUNTIME_SOURCE_FIELDS, `sources[${index}]`, errors);
      if (!source.claim) errors.push(`sources[${index}].claim이 없습니다.`);
      if (!source.url) errors.push(`sources[${index}].url이 없습니다.`);
      if (!source.accessedAt) errors.push(`sources[${index}].accessedAt이 없습니다.`);
    });
  }

  // 과잉 단정어·길이 검사는 패킷과 동일하게 적용한다(§3-4).
  collectRuntimeTexts(scenario).forEach(([fieldLabel, text]) => {
    splitSentences(text).forEach(sentence => {
      OVERCLAIM_WORDS.forEach(word => {
        if (!sentence.includes(word)) return;
        if (NEGATION_PATTERN.test(sentence)) return;
        warnings.push(`${fieldLabel}: 과잉 단정어 "${word}"이(가) 있습니다 — "${sentence.trim()}"`);
      });
    });
  });
  roles.forEach(role => {
    checkPrivateInfoLength(`roles[${role.id}].privateInfo`, splitSentences(role.privateInfo || ''), warnings);
    checkSingleSentenceLength(`roles[${role.id}].interest`, role.interest, LENGTH_LIMITS.singleSentenceWarn, warnings);
    (role.evidence || []).forEach(e => checkSingleSentenceLength(`roles[${role.id}].evidence[${e.id}].label`, e.label, LENGTH_LIMITS.shortLabelWarn, warnings));
  });
  (shared?.limitations || []).forEach(o => checkSingleSentenceLength(`sharedPrompt.limitations[${o.id}].label`, o.label, LENGTH_LIMITS.limitTextWarn, warnings));

  return { errors, warnings };
}

function runRuntimeMode(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.log(`SKIP: ${filePath}가 아직 없습니다 — 연결 공방의 2단계 조립 전이라 건너뛰고 통과합니다.`);
    return;
  }
  const scenario = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  const { errors, warnings } = validateRuntimeScenario(scenario);
  warnings.forEach(w => console.log(`  [경고] ${w}`));
  if (errors.length) {
    console.error(`FAIL ${filePath}:`);
    errors.forEach(e => console.error(`  - ${e}`));
    console.error('\nFAIL: 앱 계약(콘텐츠 모양) 검사 실패.');
    console.error('참고: 이 검사는 콘텐츠 모양만 본다. 실제 등록 가능 여부는 Codex의 validateScenarioRegistry()와 앱 테스트로 판정한다.');
    process.exit(1);
  }
  console.log(`PASS ${filePath}: 앱 계약(콘텐츠 모양) 검사 통과`);
  console.log('참고: 이 검사는 콘텐츠 모양만 본다. 실제 등록 가능 여부는 Codex의 validateScenarioRegistry()와 앱 테스트로 판정한다.');
}

// --cards: 패킷 JSON 없이 역할 카드 문서(claude_joseon_late_role_cards.md)의
// privateInfo 목록만 같은 길이 기준으로 검사한다. 관문 설계실이 문서를
// 확정하는 동안(2단계 §1) 바로 쓸 수 있게 하기 위함이다. 경고만 내고
// 실패시키지 않는다 — 기준값 자체가 제안값이라서다.
function runCardsMode() {
  const cardsByRole = extractPrivateInfoFromDoc(ROLE_CARD_DOC);
  if (cardsByRole === null) {
    console.log(`SKIP: ${path.relative(process.cwd(), ROLE_CARD_DOC)}가 없습니다.`);
    return;
  }
  if (!cardsByRole.size) {
    console.log('SKIP: 역할 카드 문서에서 privateInfo 목록을 찾지 못했습니다.');
    return;
  }
  let total = 0;
  for (const [roleId, sentences] of cardsByRole) {
    const warnings = [];
    checkPrivateInfoLength(`${roleId}.privateInfo`, sentences, warnings);
    if (!warnings.length) {
      console.log(`OK ${roleId}: 문장 ${sentences.length}개, 길이 기준 통과`);
    } else {
      warnings.forEach(w => console.log(`  [경고] ${w}`));
      total += warnings.length;
    }
  }
  console.log(`\n총 경고 ${total}건 (제안값 기준 — 수업 리허설(10/12~16)에서 실측하며 조정한다).`);
}

function main() {
  runRegressionFixtures();

  if (IS_CARDS) {
    runCardsMode();
    return;
  }
  if (RUNTIME_FILE) {
    runRuntimeMode(RUNTIME_FILE);
    return;
  }
  if (!fs.existsSync(PACKET_DIR)) {
    console.log(`SKIP: ${path.relative(process.cwd(), PACKET_DIR)}가 아직 없습니다 — 연결 공방 작업 전이라 건너뛰고 통과합니다.`);
    return;
  }
  const files = fs.readdirSync(PACKET_DIR).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.log('SKIP: data/cooperative/에 검증할 JSON이 아직 없습니다 — 건너뛰고 통과합니다.');
    return;
  }

  const docPairs = extractRoleIdsFromDoc(ROLE_CARD_DOC);
  if (docPairs === null) {
    console.log(`참고: ${path.relative(process.cwd(), ROLE_CARD_DOC)}가 없어 역할 카드 문서 교차 검사는 건너뜁니다.`);
  }

  const results = files.map(file => {
    const packet = JSON.parse(fs.readFileSync(path.join(PACKET_DIR, file), 'utf-8'));
    return validatePacket(file, packet, docPairs);
  });

  let hasError = false;
  results.forEach(({ fileName, errors, warnings, placeholderCount }) => {
    if (errors.length) {
      hasError = true;
      console.error(`FAIL ${fileName} (자리표시자 ${placeholderCount}곳):`);
      errors.forEach(e => console.error(`  - ${e}`));
    } else {
      console.log(`PASS ${fileName}: 계약 관문 통과 (자리표시자 ${placeholderCount}곳)`);
    }
    warnings.forEach(w => console.log(`  [경고] ${fileName}: ${w}`));
  });

  if (hasError) {
    console.error('\nFAIL: 협동 시나리오 패킷 계약 위반이 있습니다.');
    console.error('1단계(라운드 7)는 연결 공방·관문 설계실의 id 변경과 동시에 진행되므로, 개별 worktree의 실패는 통합본에서 재확인하세요(지시서 §4).');
    process.exit(1);
  }
  console.log('\nPASS: 협동 시나리오 패킷 계약 검사 통과');
}

main();
