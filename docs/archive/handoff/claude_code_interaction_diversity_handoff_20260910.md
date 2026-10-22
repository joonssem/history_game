# Claude 인계 문서 — Regular MUD 상호작용 다양성 파일럿

작성일: 2026-09-10  
인계 대상: Claude Code / 다음 구현·콘텐츠 검토 담당자  
현재 기준 커밋: `dc6f543d42787e2259825ac02ea5125342f34fea` (`origin/main`)  
운영 URL: <https://joonssem.github.io/history_game/>

## 1. 이번 작업의 목적

기존 Regular MUD의 게임성이 다음 구조로 축소되어 있다는 감사 결과를 바탕으로, 전체 28종을 한 번에 재작성하지 않고 한 편을 수직 파일럿으로 전환했다.

- 대부분의 필수 단계가 원형 핫스팟 3개를 누르는 구조였다.
- 오답에 감점·되돌림·시간 손실이 없어 정답을 찾을 때까지 누르면 통과할 수 있었다.
- 정답 판정이 역사적 이해가 아니라 좌표 근접도에 의존했다.
- 순서·목적지·완료 조건이 고정되어 재플레이 가치와 난이도 곡선이 약했다.

따라서 이번 범위의 핵심은 “핫스팟을 더 예쁘게 만들기”가 아니라, 학생이 자료를 읽고 의미 있는 상태를 만들어 제출해야만 진행되는 공용 상호작용 계약을 시험하는 것이다.

## 2. 구현된 범위

### 파일럿 콘텐츠

대상은 `data/mud/regular_goryeo_culture.json` 한 파일이다. 4개 관문을 다음 사고 행동으로 구성했다.

| 관문 | task type | 학생이 해야 하는 일 | 완료 판정 |
|---|---|---|---|
| 1. 팔만대장경 | `commit-revise` | 첫 설명을 고르고 제작 자료와 보관 자료를 확인한 뒤 설명을 수정 | 두 근거 ID + 복합 설명 제출 |
| 2. 직지 | `sequence` | 금속활자 인쇄 과정을 올바른 순서로 배열하고 의미 선택 | 4개 카드 순서 + 의미 답 |
| 3. 벽란도 | `map-evidence` | 지도 장소와 교류 기록, 자료의 범위를 연결 | 장소·근거·범위의 유효 조합 |
| 4. 고려 문화 종합 | `claim-evidence` | 주장 하나와 서로 다른 범주의 근거 2~3개, 자료의 한계 선택 | 허용 근거 수·범주·한계 조건 충족 |

### 공용 런타임

- `js/mudInquiry.js`: 위 4개 task를 DOM 우선 컨트롤로 렌더링하고 의미 상태를 판정한다.
- `js/mudEngine.js`: `completion.strategy === "validated-state"`인 경우 숫자 진행도나 클릭 수가 아니라 evaluator가 승인한 상태만 완료로 인정한다.
- `js/mudSimulators.js`: 기존 핫스팟 계열과 새 inquiry task를 분기한다. Canvas는 지도·맥락 표시용이고 실제 선택은 DOM 버튼으로도 가능하다.
- `simulator_contract.json`: `inquiry-task`, task별 필수 필드, `validated-state` 계약을 정의한다.
- `index.html`, `css/style.css`: 버전 쿼리(`20260910-inquiry2`), 반응형·포커스·상태 스타일을 반영한다.
- `data/mud/regular_goryeo_culture.json`: 4개 simulator를 `interaction: "inquiry-task"`로 전환했다.

다른 27개 Regular JSON은 이번 작업에서 변경하지 않았다. 기존 `ordered-hotspot`, `hotspot-discovery`는 호환성을 위해 그대로 남아 있다.

## 3. 중요한 동작 규칙

1. 첫 판단·자료 선택·최종 판단은 별도 상태다. 첫 선택지만으로는 관문이 열리지 않는다.
2. 자료는 실제로 열어 본 ID가 누적되어야 한다. 단순히 최종 답을 고르는 것으로 자료 확인을 대체할 수 없다.
3. 오답은 즉시 통과시키지 않는다. 재선택·힌트·오류 요약으로 수정 기회를 제공한다.
4. 완료 후에는 선택 컨트롤을 disabled 처리하고, 다음 단계 버튼만 활성화한다.
5. `completion.target`은 레거시 감사와의 호환 필드일 뿐, inquiry task의 의미 판정을 대신하지 않는다.
6. Canvas를 빠르게 여러 번 탭해도 inquiry 상태가 변하지 않는다. 모바일 대체 버튼과 키보드 조작은 같은 상태 전이를 사용한다.
7. 반복 오개념이 감지되면 힌트를 제공하고 오류 요약으로 포커스를 이동한다. 힌트가 정답을 직접 노출하지 않도록 유지한다.

## 4. 운영 검증 결과

### 자동 검증

다음 검증을 파일럿 배포 후보에서 통과했다.

```text
node --check js/mudEngine.js
node --check js/mudInquiry.js
node --check js/mudSimulators.js
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
python scripts/06_validate_static_assets.py
python scripts/07_audit_activity_duration.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
python scripts/09_audit_tap_resistance.py
python scratch/audit_interaction_diversity.py
git diff --check
```

계약 검증의 “정답 선택지 위치 1번” 경고는 런타임에서 선택지를 섞는 전제의 기존 경고이며 실패가 아니다. 반복 탭 감사기는 `validated-state` 단계를 오탐하지 않도록 조정했고, 남은 후보는 이번 파일럿 밖의 레거시 단계다.

### 실제 운영 브라우저

GitHub Pages에서 다음을 직접 확인했다.

- inquiry-task 패널과 첫 관문이 로드된다.
- Canvas의 임의 3회 탭만으로는 다음 관문이 활성화되지 않는다.
- 첫 번째(가장 긴) 선택지만 고르는 것으로는 다음 관문이 활성화되지 않는다.
- 제작 자료와 보관 자료를 모두 열고, 자료에 맞는 최종 판단을 제출하면 다음 관문이 활성화된다.
- 브라우저 콘솔 `error`/`warning` 로그는 0건이었다.

### 배포 증거

- 기능 구현 커밋: `87c1b10` (`feat: add inquiry-based Regular MUD pilot`)
- 배포 claim 기록 커밋: `1b1fc89`
- 최종 문서화 커밋: `dc6f543`
- GitHub Pages build: `1205857460`, 상태 `built`
- Pages source: `main`

## 5. 아직 해결하지 않은 문제

이번 배포는 전체 상호작용 재설계 완료가 아니다. 다음 항목은 의도적으로 남겨 두었다.

- 나머지 27개 Regular의 3-핫스팟 구조는 그대로다.
- 전체 필수 단계 중 target 3과 3개 핫스팟 편중은 여전히 높다.
- 점수·콤보·시간 압박·분기 경로는 아직 공용 기능으로 추가하지 않았다.
- 실제 학생 3명 이상, 390×844 및 820×1180 뷰포트, 7~12분 활동 시간은 아직 수업 관찰로 확정하지 않았다.
- 콘텐츠 문장과 사료 해석은 자동 계약 검증만으로 교육적 타당성이 확정되지 않는다.
- 파일럿 외 레거시 단계에 대한 대규모 일괄 변환은 승인 없이 진행하지 않는다.

## 6. Claude가 다음에 할 일

### P0 — 수업 검증 준비

1. `BACKLOG.md` P1 항목과 `project_context.md`의 classroom-validation-needed 상태를 먼저 읽는다.
2. 파일럿 4관문을 실제 학생 3명 이상이 수행하는 관찰 체크리스트를 만든다.
3. 다음 지표를 기록한다: 완료 시간, 무작위 클릭 횟수, 자료 2개 연결 설명 여부, 오답 후 수정 여부, 교사 개입 횟수, 모바일 조작 막힘.
4. 결과는 요구사항으로 즉시 승격하지 말고 `EXPERIMENTS.md`에 “관찰 → 가설 → 실험 → 결과 → 다음 결정” 형식으로 기록한다.

### P1 — 콘텐츠 품질 검토

- 네 관문의 정답 근거가 5학년 2학기 사회 성취기준 `6사04-03`과 직접 연결되는지 검토한다.
- 각 오답 피드백이 정답을 노출하지 않으면서 왜 범위가 부족한지 설명하는지 확인한다.
- `claim-evidence`의 “서로 다른 범주 2개” 조건이 학생 수준에 과도하지 않은지 검토한다.
- 사실관계 수정이 필요하면 코드보다 먼저 관련 문서·원문 출처를 갱신하고, 변경 이유를 `DECISIONS.md`에 남긴다.

### P2 — 확장 여부 결정

수업 관찰이 통과한 뒤에만 다음 후보 중 하나를 선택한다.

- 같은 계약으로 두 번째 비민감 Regular를 수직 파일럿화한다.
- 파일럿 task 중 하나를 공용 템플릿으로 추출한다.
- 관찰 결과가 부정적이면 기존 hotspot 단계 확장을 중단하고 파일럿 UX를 수정한다.

102개 장면을 한 번에 변환하거나, 점수·타이머·경쟁 요소를 먼저 넣는 것은 금지한다. 관찰 증거 없이 게임성 기능을 추가하면 교육적 판단을 다시 클릭 최적화 문제로 되돌릴 수 있다.

## 7. 작업 시 주의사항

- 공유 폴더에서 브랜치만 전환하지 않는다. 병렬 작업이 필요하면 별도 worktree를 만든다.
- 같은 파일을 동시에 수정하지 않는다. Claude가 콘텐츠를 검토하는 동안 실행 에이전트는 런타임 파일을 건드리지 않는다.
- 수정 전 현재 브랜치와 `git status`를 확인한다.
- 구현 변경 시 `walkthrough.md`와 검증 명령을 함께 갱신한다.
- 새로운 아이디어는 먼저 `INBOX.md` 또는 `BACKLOG.md`에 기록한다. 아직 실험하지 않은 아이디어를 PRD의 확정 요구사항으로 승격하지 않는다.
- 배포 시 `main`의 최신 커밋, GitHub Pages build 상태, 운영 브라우저의 실제 동작을 모두 확인한다.

## 8. 권장 시작 명령

```powershell
git rev-parse --abbrev-ref HEAD
git status --short
Get-Content BACKLOG.md -First 25
Get-Content docs/plans/implementation_plan_regular_interaction_diversity_pilot.md
Get-Content docs/plans/regular_interaction_architecture_plan.md
node --check js/mudInquiry.js
python scripts/04_validate_mud_contract.py
```

이 문서와 `BACKLOG.md`, `project_context.md`, `walkthrough.md`의 상태가 충돌하면 자동으로 덮어쓰지 말고 충돌 지점과 선택지를 먼저 보고한다.
