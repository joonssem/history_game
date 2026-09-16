// =========================================================
// scripts/15_validate_cooperative_packet.js
// 실시간 협동 시나리오 콘텐츠 패킷(`CooperativeScenario`, 계획서
// implementation_plan_joseon_late_cooperative_live_vertical_slice.md §4)의
// "계약 관문"을 기계가 검사할 수 있는 것만 옮긴다. 앱은 아직 이 JSON을
// 읽지 않는다 — 콘텐츠 초안이 계약 모양을 지키는지만 확인한다.
//
// 연결 공방과 병렬로 작업하므로, 대상 파일이 아직 없으면 건너뛰고
// 통과한다(실패로 막지 않는다).
// =========================================================

const fs = require('node:fs');
const path = require('node:path');

const PACKET_DIR = path.join(__dirname, '..', 'data', 'cooperative');
const OVERCLAIM_WORDS = ['모든 사람', '전국', '즉시', '누구나', '완전히'];

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

function validatePacket(fileName, packet) {
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

  // 과잉 단정 금지어 — 경고만(§0-2 4)
  collectStudentFacingTexts(packet).forEach(([fieldLabel, text]) => {
    OVERCLAIM_WORDS.forEach(word => {
      if (text.includes(word)) {
        warnings.push(`${fieldLabel}: 과잉 단정어 "${word}"이(가) 있습니다 — 조선 후기 변화는 지역·신분·시기에 따라 달랐다.`);
      }
    });
  });

  return { fileName, errors, warnings };
}

function main() {
  if (!fs.existsSync(PACKET_DIR)) {
    console.log(`SKIP: ${path.relative(process.cwd(), PACKET_DIR)}가 아직 없습니다 — 연결 공방 작업 전이라 건너뛰고 통과합니다.`);
    return;
  }
  const files = fs.readdirSync(PACKET_DIR).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.log('SKIP: data/cooperative/에 검증할 JSON이 아직 없습니다 — 건너뛰고 통과합니다.');
    return;
  }

  const results = files.map(file => {
    const packet = JSON.parse(fs.readFileSync(path.join(PACKET_DIR, file), 'utf-8'));
    return validatePacket(file, packet);
  });

  let hasError = false;
  results.forEach(({ fileName, errors, warnings }) => {
    if (errors.length) {
      hasError = true;
      console.error(`FAIL ${fileName}:`);
      errors.forEach(e => console.error(`  - ${e}`));
    } else {
      console.log(`PASS ${fileName}: 계약 관문 통과`);
    }
    warnings.forEach(w => console.log(`  [경고] ${fileName}: ${w}`));
  });

  if (hasError) {
    console.error('\nFAIL: 협동 시나리오 패킷 계약 위반이 있습니다.');
    process.exit(1);
  }
  console.log('\nPASS: 협동 시나리오 패킷 계약 검사 통과');
}

main();
