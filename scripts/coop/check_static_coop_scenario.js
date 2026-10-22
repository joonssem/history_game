// 정적 협동 시나리오가 episode.js가 읽는 필드를 모두 갖췄는지 검사한다.
// 사용: node scripts/coop/check_static_coop_scenario.js cooperative-mud/<폴더>/scenario.js
const fs = require('fs');
const vm = require('vm');
const file = process.argv[2];
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
const s = ctx.window.CoopScenario;
const errors = [];
const need = (cond, msg) => { if (!cond) errors.push(msg); };
need(s, 'window.CoopScenario 없음');
['id', 'storageKey', 'title', 'teamCount'].forEach((k) => need(s[k], k + ' 없음'));
['roleStep', 'shareStep', 'secondStep', 'privateLabel', 'interestLabel', 'roleStatus', 'secondStatus'].forEach((k) => need(s.labels && s.labels[k], 'labels.' + k + ' 없음'));
const maxSize = Math.max(...s.teamSizeOptions);
need(s.roles.length >= maxSize, '역할 수(' + s.roles.length + ')가 최대 인원(' + maxSize + ')보다 적음');
const ids = new Set();
s.roles.forEach((r, i) => {
  ['id', 'icon', 'name', 'figure', 'privateInfo', 'interest', 'shareText'].forEach((k) => need(r[k], 'roles[' + i + '].' + k + ' 없음'));
  need(!ids.has(r.id), '역할 id 중복: ' + r.id); ids.add(r.id);
});
need(s.firstChoices.length >= 2, '최초 판단 선택지 부족');
need(new Set(s.firstChoices.map((c) => c.id)).size === s.firstChoices.length, '선택지 id 중복');
need(s.smallTeamClue && s.smallTeamClue.title && s.smallTeamClue.text, 'smallTeamClue 불완전');
['5', '10'].forEach((m) => need(s.statement.headings[m], 'statement.headings.' + m + ' 없음'));
s.statement.fields.forEach((f) => f.options.forEach((o) => need(o.value && o.text && o.sentence, f.key + ' 선택지 불완전')));
const parts = s.statement.fields.map((f) => f.options[0].sentence);
need(typeof s.statement.compose(parts) === 'string', 'compose 실패');
const c = s.compare;
need(c && c.none && c.aligned && c.aligned.includes('{answer}'), 'compare 불완전');
if (c.unverifiableChoiceId) need(s.firstChoices.some((x) => x.id === c.unverifiableChoiceId) && c.unverifiable, 'unverifiableChoiceId 불일치');
need(s.sources.length && s.sources.every((x) => /^https:\/\//.test(x.url) && x.label), 'sources 불완전');
need(s.documents.length, 'documents 없음');
const order = s.pacing.order;
['5', '10'].forEach((m) => Object.keys(s.pacing.budgets[m]).forEach((k) => need(order.includes(k), 'budget 단계 ' + k + ' 가 order에 없음')));
order.forEach((k) => need(s.pacing.prompts[k] && s.pacing.prompts[k].slow && s.pacing.prompts[k].fast, 'prompts.' + k + ' 불완전'));
need(!('second' in s.pacing.budgets['5']), '5분형에 second 예산이 있음');
// 모든 칸의 선택지 조합을 만들어 문장 끝 마침표가 겹치지 않는지 본다(칸 수는 시나리오마다 다름).
let combos = [[]];
s.statement.fields.forEach((f) => { combos = combos.flatMap((c) => f.options.map((o) => c.concat(o.sentence))); });
combos.forEach((c) => { const t = s.statement.compose(c); need(!/\.\./.test(t), '문장 마침표 중복: ' + t); });
// 과잉일반화 함정(traps): 칸·값이 실제로 있어야 하고, 기본값(첫 선택지)이면 안 된다.
(s.traps || []).forEach((t, i) => {
  const f = s.statement.fields.find((x) => x.key === t.field);
  need(f, 'traps[' + i + '].field 없음: ' + t.field);
  if (f) {
    need(f.options.some((o) => o.value === t.value), 'traps[' + i + '].value 가 선택지에 없음');
    need(f.options[0].value !== t.value, 'traps[' + i + '] 가 기본 선택지임');
  }
  need(t.note && t.note.length > 10, 'traps[' + i + '].note 없음');
});
console.log(errors.length ? 'FAIL\n- ' + errors.join('\n- ') : 'OK ' + s.id + ' (역할 ' + s.roles.length + ', 문장 조합 ' + combos.length + ', 함정 ' + (s.traps || []).length + ')');
console.log('예시: ' + s.statement.compose(parts));
process.exit(errors.length ? 1 : 0);
