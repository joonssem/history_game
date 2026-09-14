# 라운드 3 red team — 재현 명령

- TASK-20260914-T1 감사 부속. 기준 `main / 9e27a67`, 확인일 2026-09-14.
- [판정과 출처](./round3_red_team_audit.md).
- 저장소 루트의 PowerShell에서 아래 블록을 실행한다. Node.js v24.14.1에서 확인했다.
- 디스크 파일을 수정하지 않는다. 원본 13번의 보고서 쓰기를 VM의 fs 스텁에서 무시한다. 그 외 실제 판정 함수와 스크립트 로직을 실행한다.
- 변이 검사는 정상 통과를 잘못 거부하도록 **메모리의 판정 함수만** 감싼 뒤 기존 테스트가 그 오류를 잡는지 보는 검사다. 사용자 코드에 패치를 적용하지 않는다.
- DOM 검사에서는 실제 버튼 이벤트 콜백을 실행하되 render 전체와 Canvas 갱신 등 화면 검증은 하지 않는다. 실제 브라우저 테스트의 대체라고 해석하지 않는다.

## 재실행 블록

```powershell
$auditProbe = @'
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');const root=process.cwd();
function run(file,mutate){const filename=path.join(root,file),native=createRequire(filename),messages=[];const context=vm.createContext({console:{log:(...x)=>messages.push(x.join(' ')),error:(...x)=>messages.push(x.join(' '))},process:{cwd:()=>root,exit:c=>{throw Error('EXIT '+c)}},__dirname:path.dirname(filename)});context.global=context;const loaded=new Set();context.require=id=>{if(id==='node:fs')return {...fs,mkdirSync(){},writeFileSync(){}};const p=native.resolve(id);if(p.endsWith('.js')&&p.startsWith(root)){if(!loaded.has(p)){loaded.add(p);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});if(p.endsWith('mudInquiry.js')&&mutate)mutate(context.window.MudInquiry);}return {};}return native(id);};let passed=true,error=null;try{vm.runInContext(fs.readFileSync(filename,'utf8'),context,{filename});}catch(e){passed=false;error=e.message;}return {context,messages,passed,error};}
const baseline=run('scripts/13_audit_inquiry_combinatorics.js');console.log('BASELINE 13',baseline.passed,baseline.error,baseline.messages.join('\n'));const q=baseline.context.window.MudInquiry;
for(const id of ['regular_goryeo_culture','regular_neolithic','regular_three_kingdoms','regular_modern_open']){const d=JSON.parse(fs.readFileSync('data/mud/'+id+'.json','utf8')),t=d.stages['4'].simulator.task;const evidence=['1','2','3'].flatMap(k=>d.stages[k].simulator.task.awards||[]),pool=evidence.filter(e=>t.allowedEvidenceIds.includes(e.id)&&e.role!=='limit').map(e=>e.id);const limits=t.requireLimit?t.limits.map(x=>x.id):[null,...t.limits.map(x=>x.id)];let n=0,pass=0,orderedN=0,orderedPass=0,by={};for(const c of t.claims)for(let mask=0;mask<2**pool.length;mask++){const selected=pool.filter((x,i)=>mask&(1<<i));if(selected.length<t.minEvidence||selected.length>t.maxEvidence)continue;const weight=selected.length===2?2:6;for(const l of limits){n++;orderedN+=weight;const r=q.evaluateTask(t,{claimId:c.id,selectedEvidence:selected,limitId:l},evidence);if(r.status==='complete'){pass++;orderedPass+=weight;}const k=String(l);by[k]??={n:0,pass:0};by[k].n++;if(r.status==='complete')by[k].pass++;}}console.log('FULL CLAIM',id,JSON.stringify({n,pass,orderedN,orderedPass,by}));}
function blockWhen(predicate){return q=>{const original=q.evaluateClaimEvidence;q.evaluateClaimEvidence=function(t,s,e){const r=original.call(this,t,s,e);return r.status==='complete'&&predicate(t,s)?{status:'revise',issue:'AUDIT-MUTATION'}:r;};};}
const mutations={'block all second claims':blockWhen((t,s)=>s.claimId===t.claims[1].id),'block goryeo printing alternative':blockWhen((t,s)=>s.claimId==='technology-and-exchange'&&!s.selectedEvidence.includes('tripitaka-making')),'block modern urban alternative':blockWhen((t,s)=>s.claimId==='connect-treaty-institution-city'&&!s.selectedEvidence.includes('modern-institution-access')),'block optional correct limits except existing goryeo case':blockWhen((t,s)=>!t.requireLimit&&s.limitId&&s.claimId!=='technology-and-exchange')};console.log('BASELINE 05',run('scripts/05_test_simulator_runtime.js').passed);for(const [name,mutate]of Object.entries(mutations)){const a=run('scripts/05_test_simulator_runtime.js',mutate),b=run('scripts/13_audit_inquiry_combinatorics.js',mutate);console.log('MUTATION',name,JSON.stringify({runtimePass:a.passed,runtimeError:a.error,auditPass:b.passed,auditError:b.error}));}
function element(tag='div'){return {tag,style:{},dataset:{},children:[],events:{},appendChild(x){this.children.push(x);},replaceChildren(){this.children=[];},setAttribute(){},addEventListener(k,f){this.events[k]=f;}};}
baseline.context.document.createElement=element;
q.render=()=>{};
function buttons(n){return n.children.flatMap(c=>[...(c.tag==='button'?[c]:[]),...buttons(c)]);}
function click(render,label){const panel=element();q[render](panel);const b=buttons(panel).find(b=>b.textContent===label);if(!b||b.disabled)throw Error('unavailable '+label);b.events.click();}
const g=JSON.parse(fs.readFileSync('data/mud/regular_goryeo_culture.json','utf8'));
q.task=g.stages['1'].simulator.task;q.state=q.createInitialState(q.task);
q.engine={inquiryRunState:{evidence:[]},acceptInquiryResult(r){console.log('SAVED FIRST CHOICE',JSON.stringify({firstChoice:r.firstChoice,revised:r.revised,quality:r.quality}));return true;}};
click('renderCommitRevise',q.task.options[0].label);
for(const e of q.task.evidence)click('renderCommitRevise',e.label);
click('renderCommitRevise',q.task.options[2].label); // the first matching label belongs to initial choice
const panel=element();q.renderCommitRevise(panel);const sameLabel=buttons(panel).filter(b=>b.textContent===q.task.options[2].label);sameLabel[1].events.click();
q.submit();
q.task=g.stages['4'].simulator.task;q.state=q.createInitialState(q.task);q.engine.inquiryRunState.evidence=['1','2','3'].flatMap(k=>g.stages[k].simulator.task.awards||[]);
click('renderClaimEvidence',q.task.claims[0].label);
for(const id of ['tripitaka-making','byeokrando-network'])click('renderClaimEvidence',q.engine.inquiryRunState.evidence.find(e=>e.id===id).label);
const wrong=q.task.limits.find(l=>!l.correct);
click('renderClaimEvidence',wrong.label);console.log('OPTIONAL BAD',q.evaluateTask(q.task,q.state,q.engine.inquiryRunState.evidence).status);
click('renderClaimEvidence',wrong.label);console.log('OPTIONAL CLEARED',q.state.limitId,q.evaluateTask(q.task,q.state,q.engine.inquiryRunState.evidence).status);
let mismatch=0,total=0;
function perms(a){if(a.length<2)return [a];return a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(p=>[x,...p]));}
for(const id of ['regular_goryeo_culture','regular_neolithic','regular_three_kingdoms','regular_modern_open']){const d=JSON.parse(fs.readFileSync('data/mud/'+id+'.json','utf8')),t=d.stages['4'].simulator.task,e=['1','2','3'].flatMap(k=>d.stages[k].simulator.task.awards||[]),pool=t.allowedEvidenceIds;for(const c of t.claims)for(let mask=0;mask<2**pool.length;mask++){const s=pool.filter((x,i)=>mask&(1<<i));if(s.length<t.minEvidence||s.length>t.maxEvidence)continue;for(const l of (t.requireLimit?t.limits.map(x=>x.id):[null,...t.limits.map(x=>x.id)])){const result=q.evaluateTask(t,{claimId:c.id,selectedEvidence:s,limitId:l},e);for(const selectedEvidence of perms(s)){total++;const actual=q.evaluateTask(t,{claimId:c.id,selectedEvidence,limitId:l},e);if(actual.status!==result.status||actual.quality!==result.quality)mismatch++;}}}}
console.log('EVIDENCE ORDER CHECK',JSON.stringify({total,mismatch}));

'@
$auditProbe | node
```

## 확인한 핵심 출력

```text
BASELINE 13 true
고려 11/40, 신석기 2/8, 삼국 2/8, 근대 4/24
FULL CLAIM regular_goryeo_culture: pass=22 n=160 orderedPass=108 orderedN=640
FULL CLAIM regular_neolithic: pass=4 n=32 orderedPass=16 orderedN=96
FULL CLAIM regular_three_kingdoms: pass=4 n=32 orderedPass=16 orderedN=96
FULL CLAIM regular_modern_open: pass=4 n=24 orderedPass=12 orderedN=72
BASELINE 05 true
block all second claims: runtimePass=true auditPass=false
block goryeo printing alternative: runtimePass=true auditPass=false
block modern urban alternative: runtimePass=true auditPass=false
block optional correct limits except existing goryeo case: runtimePass=true auditPass=true
SAVED FIRST CHOICE {"firstChoice":"making-and-storage","revised":false,"quality":"connector"}
OPTIONAL BAD revise
OPTIONAL CLEARED null complete
EVIDENCE ORDER CHECK {"total":904,"mismatch":0}
```

첫 스텁 시도는 VM의 `global` 별칭이 없어 실패했다. 위 블록은 `context.global=context`를 설정한 수정된 **감사 실행 명령**이며, 원본 코드 수정은 없었다. 이후 기준선 05·13 통과를 확인한 상태에서만 변이 결과를 해석했다.

## 별도로 실행한 기준선 검사

```powershell
node scripts/05_test_simulator_runtime.js
python scripts/04_validate_mud_contract.py
git diff --check
```

05와 04는 PASS. 13번을 직접 실행하면 기존 `docs/audits/inquiry_combinatorics_audit.md`를 덮어쓰므로, T1에서는 위 VM 실행으로만 검사했다.
