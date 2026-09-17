# Codex 요청 — 조선 후기 협동 시나리오 앱 등록 (D-035)

> 작성: 2026-09-17, Claude 기획 세션(Opus). 대상: 이 문서가 들어간 `main`.

## 입력

- **콘텐츠(확정)**: `docs/handoff/claude_joseon_late_runtime_scenario.json`
  - 모양은 앱의 `PublicScenario` + `CooperativeScenario`를 합친 것이다.
  - id `joseon-late-market`, version 1, 역할 5개, sources 8건.
  - `node scripts/15_validate_cooperative_packet.js --runtime …` PASS. 남은 경고는 `interest` 길이(제안값) 3건이다.
- 교사 자료(앱에 넣지 않음): `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`. 역할별 말하기 안내, 질문 틀 3종, sticky-wall 문자열이 들어 있다.
- 출처 검토: `docs/audits/joseon_late_source_review.md` 8-1~8-4
- 결정: `DECISIONS.md` D-035. 앱 코드는 Codex, 콘텐츠는 Claude다. 대상 선택 필드는 앱에 추가하지 않는다.
- 옛 초안 `data/cooperative/joseon_late_packet.draft.json`은 삭제했다(C1-02 부분 수용).

## 감사 C1-01~05 대응 상태

| ID | 상태 |
|---|---|
| C1-01 계약 불일치 | 앱 계약 모양으로 다시 만듦. 실제 등록 가능 여부는 `validateScenarioRegistry()`로 판정 요청 |
| C1-02 Pages 공개 | 초안 JSON 삭제. 위협 모델은 D-035 기록대로 고려 초기와 같은 기준 |
| C1-03 대상·공통 근거 | 대상 선택지 없음. `connections` 3문장에 이득과 어려움을 함께 담음. 3인 공통 자료는 `commonEvidenceByGroupSize.3` 읽기 전용 |
| C1-04 추론 문장 | 보부상·수공업자·품팔이 추론을 "~것 같다/걱정/때도 있을 것"으로 낮춤. `sources`에는 사실만 둠 |
| C1-05 검증기 | 문장 분리 수정, `--runtime` 추가. 콘텐츠 모양 검사일 뿐 등록 판정이 아님을 명시 |

## Codex가 할 일 (Codex 보고의 순서 그대로)

1. 별도 worktree와 구현 브랜치를 만들고 BACKLOG에 claim한다.
2. 공개 레지스트리(`shared/scenario.ts`)에 `id`·`version`·`publicMeta`·`roles`(id·icon·name)·`groupSizes`를 등록한다.
3. 서버 레지스트리(`convex/scenarios.ts`)에 나머지 필드를 등록한다.
4. 3·4·5인 역할 배치와 공통 자료를 연결한다.
5. `validateScenarioRegistry()`와 회귀 테스트를 돌린다.
6. 역할 비공개 본문이 client bundle에 없는지 검사한다.
7. Convex·UI·`npm run check`를 돌린다.
8. `walkthrough.md`에 기록한다.

**문안을 고쳐야 하면 직접 고치지 말고** `docs/audits/`에 항목을 남긴다. Claude가 JSON을 고친다.

## Claude가 확인한 내용 검토 메모

- `firstChoices` 3개는 모든 역할이 같다(고려 초기 패턴). 채점하는 정답은 없다.
- 연결 문장 1은 통합 때 "이웃 가운데 일부는"으로 범위를 좁혔다(대조실 8-3 규칙 2).
- 화면에서 보류한 이모작 문장에 대응하던 source 1건을 뺐다.
