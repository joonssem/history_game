# Codex 전달 — Claude 4트랙 결과 red team 요청 + 저장소 조율 (2026-09-14)

- 작성: Claude Opus 5 (기획·통합 세션)
- 기준 커밋: `origin/main` `bda1588` (GitHub Pages `built`)
- 받는 쪽: Codex (실시간 협동 MUD 시스템 담당 + red team)

## 1. 그동안 무엇이 바뀌었나

Codex가 2026-09-10에 넘긴 inquiry-task 파일럿 인계(`claude_code_interaction_diversity_handoff_20260910.md`)를 받아, Claude가 네 창으로 두 라운드를 진행해 main에 배포했다. 요약은 `claude_four_track_session_close_20260911.md`, 상세 로그는 `walkthrough.md` 2026-09-10~11 항목.

| 영역 | 변경 |
|---|---|
| inquiry-task 파일럿 | 1편 → **4편**(고려 문화·신석기·삼국·근대 개항). 편마다 4관문이 서로 다른 문법 |
| 유물·유적 대조실 | 페어 9 → 11. `pairType`, 유적 `kind: "site"` 도입. 도감 진입점 |
| 확장 역사 활동 | 카드 짝맞추기·나의 연표를 해금 유물 기반으로. 원인과 결과 2 → 4세트 |
| inquiry-task UI | 포커스 복원, sticky 제출 버튼, 근거 인벤토리, map-evidence 캔버스 선택 색 |

### Codex 파일럿에서 취한 것

3단 잠금(첫 판단 → 자료 → 최종 판단, DOM `disabled`), 카드 단위 오답 피드백, 관문 간 근거 누적, 셔플의 정답순서 회피는 검증된 강점이라 그대로 유지했다.

### Codex 파일럿에서 고친 것

- **D-027**: 고려 문화 4관문의 `minCategories: 2`가 절대 실패할 수 없는 조건이었다(허용 근거 5장 category가 전부 달라서). "국제 교류" 주장이 교류 근거 0장으로 통과했다.
- **D-029**: `js/mudInquiry.js`의 화면 문구가 고려 문화 기준으로 하드코딩돼, 같은 문법을 쓴 다른 편에 "국제 교류", "금속활자" 문구가 따라왔다.

## 2. Codex에 영향이 있는 계약 변경 ⚠️

MUD JSON을 만지게 되면 아래가 이제 **계약 검증 실패**로 잡힌다(`scripts/04_validate_mud_contract.py`).

1. `claim-evidence`의 `minCategories`가 어떤 선택으로도 실패할 수 없으면 오류(`check_claim_categories`).
2. `requiredCategories`가 `accepts`로 도달 불가능하면 오류.
3. `map-evidence`에 `task.labels.location`·`support`·`limit`가 없으면 오류(`check_task_labels`).
4. 화면 문구는 코드가 아니라 편 데이터가 갖는다. 코드의 fallback은 특정 유물·지명·사건 이름이 없는 중립 문장이어야 한다(D-029).

그 외: `.gitignore`에 `.worktrees/`·`debug.log` 추가(`git add -A`가 worktree를 gitlink로 커밋한 사고 재발 방지), `index.html:12`에 `css/style.css` 캐시버스터 신설 — `css/style.css`를 고치면 함께 올려야 브라우저에 반영된다.

## 3. red team 요청

사용자 방침: Codex가 Claude 작업을 비판적으로 감사하고, Claude는 **좋은 지적은 취해 발전시키고 나머지는 문서에 기록만** 한다. 전부 수용을 전제로 하지 않으니 **확신 없는 지적도 근거와 함께 그대로 적어 달라.**

### 우선 감사 대상 (위험도 순)

1. **파일럿 4편의 "탭 저항"** — 무작위 클릭·전수 대입으로 4관문을 통과할 수 있는가. 특히 새로 전환된 `regular_neolithic`·`regular_three_kingdoms`·`regular_modern_open`. 선택지가 3개뿐인 섹션은 조합 수가 작다.
2. **근대 개항 편의 민감 주제 처리** — `regular_modern_open` 1·4관문. "근대 문물은 발전인가 침탈인가"를 한쪽 정답으로 만들지 않도록 설계했다(양 극단을 오답으로 배치). 그 균형이 실제로 성립하는지, 또는 정답 선택지가 결국 한 관점을 강요하는지.
3. **죽은 조건·노출 안 되는 조건의 잔존** — D-027 검증기는 `claim-evidence` 범주 조건만 본다. `commit-revise`의 `requiredEvidenceIds`, `sequence`의 의미 질문, `map-evidence`의 조합 판정에 같은 계열 결함이 남았는지.
4. **나의 연표의 정렬 가정** — `unlockedArtifacts` 배열 순서 = 클리어 순서, 유물 `hint`의 "N단원 M차시" = 역사 순서라는 두 가정. 차시를 건너뛰거나 협동 MUD·Deep-dive 보상(`art_29`, `art_deep_1~4`)이 섞일 때 틀린 순서를 "정답"으로 요구하지 않는가.
5. **유적 페어의 사실관계** — `cmp_artifact_site_1`(빗살무늬 토기 ↔ 서울 암사동), `cmp_site_vs_site_1`(암사동 vs 고창 죽림리 지석묘군)의 `traits` 수치·서술. 출처 규칙은 `docs/plans/artifact_site_source_policy.md`.

### 감사하지 않아도 되는 것

- 스타일·문구 취향 수준의 지적
- 수업 관찰 없이는 답할 수 없는 질문(학생 체감 난이도 등) — 가설로만 적어 달라
- 승인 대기 설계 문서 4건(`perspective`, 단계 진행형, 스토리 관계, 캔버스 옵션 B)의 구현 여부 — 아직 구현 전이다. 설계 자체의 결함 지적은 환영

### 결과물 형식

`docs/audits/claude_four_track_red_team_audit.md` 한 파일. 항목마다 **재현 경로(편·관문·선택 순서)**, **실제 결과 vs 기대 결과**, **심각도(학생 오학습 / 게임성 붕괴 / 경미)**. 코드·데이터는 수정하지 말고 보고만 한다 — 수정은 Claude 트랙 소유 파일이다.

## 4. 브랜치 조율 — Codex 확인 필요

2026-09-11 정리 때 Claude 트랙 브랜치·worktree는 지웠고, 아래는 **Codex 영역이라 손대지 않았다.** 각각 어떻게 할지 알려 달라.

| 브랜치 | main 미반영 커밋 | worktree | 질문 |
|---|---|---|---|
| `codex-deep-three-kingdoms` | **18** | 없음 | 폐기인가, 병합 대기인가 |
| `fix/deep-three-choice-bias` | **3** | `.worktrees/codex-join-security` | 병합 대기인가 |
| `audit/interaction-diversity` | 0 | `.worktrees/codex-interaction-audit` | 삭제해도 되는가 |
| `integrate/interaction-diversity-deploy` | 0 | `.worktrees/codex-interaction-deploy` | 삭제해도 되는가 |
| `docs/readme-refresh` | 0 | `.worktrees/codex-readme-refresh` | 삭제해도 되는가 |
| `feat/cooperative-join-security`, `feat/cooperative-live-vertical-slice`, `feat/cooperative-virtual-load-test`, `chore/cooperative-live-privacy-preview` | 0 | 없음 | 실시간 협동 MUD 작업에서 아직 참조하는가 |

참고: `claude-deep-prehistoric`(main 미반영 7커밋)은 Claude 쪽이 따로 확인한다. 원격의 `feat/mud-gate-grammar` 등 Claude 4트랙 브랜치 4개도 Claude 쪽에서 정리 예정이니, **거기서 새 브랜치를 뜨지 말 것**(리베이스 전 낡은 커밋이 남아 있다).

## 5. 파일 경계 (충돌 방지)

- Claude 트랙 소유: `data/mud/regular_*.json`, `js/mudInquiry.js`, `js/mudEngine.js`, `js/mudSimulators.js`, `js/miniGames.js`, `js/artifactComparison.js`, `js/encyclopedia.js`, `data/artifactComparisons.json`, `data/causeEffectChains.json`, `data/timeline.json`, `index.html` 대부분.
- 공유: `css/style.css`(추가만 + 캐시버스터 갱신), `BACKLOG.md`·`DECISIONS.md`·`EXPERIMENTS.md`·`walkthrough.md`(말미에 추가만).
- 실시간 협동 MUD 코드(`apps/`, `cooperative-mud/`)는 Codex 영역이며 Claude는 건드리지 않는다.
- 같은 파일을 동시에 수정해야 하면 먼저 알려 달라.
