# 4트랙 세션 마무리 — 다음 세션 인계 (2026-09-11)

- 작성: Claude Opus 5 (기획·통합 세션)
- 기준 커밋: `origin/main` `699cc53` (Pages `built`, 운영 사이트 실측 확인 완료)
- 운영 URL: <https://joonssem.github.io/history_game/>

이 문서는 **다음에 무엇을 할지 정하기 전에 읽는 문서**다. 무엇이 끝났고, 무엇이 판단을 기다리고 있고, 무엇을 하면 안 되는지만 적는다. 작업 지시는 아니다.

## 1. 지금 배포되어 있는 것

| 영역 | 상태 |
|---|---|
| inquiry-task 파일럿 | **4편** — 고려 문화·신석기·삼국·근대 개항. 편마다 4관문이 서로 다른 문법 |
| 나머지 Regular | 24편은 그대로 `ordered-hotspot`/`hotspot-discovery` |
| 유물·유적 대조실 | 페어 **11개**(유물↔유물 9, 유물↔유적 1, 유적↔유적 1). 도감 진입점 있음 |
| 확장 역사 활동 | 미니게임 4종 + 스토리. 카드 짝맞추기·유물 탐정·나의 연표가 해금 유물 기반. 원인과 결과 4세트(1·2·3단원) |
| inquiry-task UI | 포커스 복원, sticky 제출 버튼, 근거 인벤토리(접기/펼치기), map-evidence 캔버스 선택 색 반영 |

검증: 자동 17종 통과, 아이패드 가로 1180×820 확인, 콘솔 error/warning 0건.

## 2. ⚠️ 가장 중요한 사실 — 아직 한 번도 학생을 만나지 않았다

라운드 1·2에서 만든 것 전부가 **수업 관찰 0회** 상태다. 이 프로젝트는 스스로 "관찰 없이 확장하지 않는다"를 원칙으로 세웠고(`BACKLOG.md` 2026-09-08, `EXPERIMENTS.md` 실험 원칙), 지금이 정확히 그 원칙을 적용할 지점이다.

- 파일럿은 1편에서 4편이 됐다. 나머지 24편 확장은 **관찰 뒤 별도 승인** 사항이다.
- 유물 비교는 2026-09-08에 "5개로 마무리하고 학생 피드백 먼저"로 합의했는데 지금 11개다.
- 미니게임 5종이 "MUD에서 얻은 것을 다시 쓴다"로 정렬됐지만, 그 정렬이 학생에게 의미 있는지는 미검증 가설이다.

관찰 준비 재료는 이미 있다 — `EXPERIMENTS.md` `EXP-002`(대조실이 유적 페어 관찰 항목 5개 추가), 각 트랙 지시서의 완료 판정, `docs/handoff/claude_track1a_gate_grammar_instruction.md` §7.

## 3. 판단을 기다리는 것

### 3-1. 승인 대기 설계 문서 4건 (구현 전 사용자 확인 필요)

| 문서 | 내용 | 영향 범위 |
|---|---|---|
| [`mud_perspective_task_design.md`](../plans/mud_perspective_task_design.md) | 새 문법 `perspective` — 병자호란 주화 vs 척화 | 신규 task 유형. 구현은 런타임 트랙 |
| [`implementation_plan_inquiry_progressive_disclosure.md`](../plans/implementation_plan_inquiry_progressive_disclosure.md) | 섹션 3개 동시 노출 → 단계 진행형 | **파일럿 4편 16관문의 전제가 바뀐다** |
| [`story_mud_relationship.md`](../plans/story_mud_relationship.md) | 타임머신 스토리가 MUD와 어떤 관계인가 | 방향 결정 |
| [`implementation_plan_map_evidence_canvas_role.md`](../plans/implementation_plan_map_evidence_canvas_role.md) 옵션 B | 지도가 실제 필수 정보를 나르게 | 데이터 스키마 확장 + 콘텐츠 재작성 |

넷 다 상호작용 모델이나 콘텐츠를 크게 바꾼다. **관찰 결과가 우선순위를 뒤집을 가능성이 크므로, §2보다 먼저 진행하는 것은 권하지 않는다.**

### 3-2. 확인받지 못한 채 배포된 것 1건

조작대가 `implementation_plan_map_evidence_canvas_role.md`의 **옵션 A**(학생이 고른 지점만 초록/빨강 표시)를 구현해 `699cc53`에 함께 배포됐다. `BACKLOG.md`에는 "사용자 확인 후"라고 적혀 있으나 기획 세션에는 그 기록이 없다. 내용 자체는 보수적이다 — 이미 텍스트로 준 피드백을 캔버스 색으로 옮길 뿐, 다른 지점의 정답 여부는 노출하지 않는다. **승인 사실만 확인하면 된다. 승인한 적이 없다면 되돌릴 수 있다.**

### 3-3. 작은 미결 1건

근거 인벤토리가 `<details>` **기본 접힘**이라, 펼치기 전에는 여전히 "근거 N장" 숫자만 보인다. 지시서는 "모은 근거가 무엇인지 항상 보이는 것이 중요"라고 했는데 세로를 늘리지 말라는 조건과 충돌한 결과다. 제안: **마지막 `claim-evidence` 관문에서만 기본 펼침**(`<details open>`). 거기가 앞에서 모은 근거로 주장을 세우는 곳이다.

### 3-4. 원격 브랜치 정리

GitHub의 `feat/mud-gate-grammar`·`feat/artifact-site-comparison`·`feat/extended-activity-loop`·`feat/inquiry-ui-console` 4개가 **리베이스 전 커밋**을 담은 채 남아 있다. 내용은 전부 main에 있다. 여기서 새 브랜치를 뜨면 라운드 2 초반에 겪었던 "낡은 base에서 시작" 문제가 재현되므로 지우는 쪽이 낫다. 원격을 건드리는 작업이라 확인 후 진행한다.

## 4. 손대면 안 되는 것

- **미반영 커밋이 남은 브랜치 3개**: `codex-deep-three-kingdoms`(18), `claude-deep-prehistoric`(7), `fix/deep-three-choice-bias`(3). 특히 `claude-deep-prehistoric`은 Claude 작업인데 main에 없는 7커밋이 있다 — **내용 확인이 필요하다.**
- **Codex 소유 worktree 4개**: `codex-interaction-audit`, `codex-interaction-deploy`, `codex-join-security`, `codex-readme-refresh`. Codex 세션이 쓰고 있을 수 있다.
- **3단원(일제 강점기·전쟁) MUD**: 민감 주제 기준 확인 전까지 inquiry-task 전환 대상이 아니다.

## 5. 이 세션에서 확인된 작업 원칙

다음 병렬 작업을 설계할 때 그대로 쓸 수 있다.

1. **파일이 인계 수단이다.** 대화 맥락이 아니라 `docs/handoff/`의 지시서가 창 사이를 잇는다. 창을 나눌 때는 한 파일에 한 소유자를 배정하고, 공유 파일(`index.html` 캐시버스터, `css/style.css`, `BACKLOG.md`)은 "자기 줄만" 또는 "말미에 추가만"으로 규칙을 정한다.
2. **worktree는 미리 만들어 둔다.** 네 창이 동시에 `git worktree add`를 실행해 경합이 났고, 한 창은 worktree가 등록되지 않은 빈 디렉터리를 받았다. 기획 세션이 미리 만들고 각 창은 `cd`만 하게 한다.
3. **통합 후 교차 검증이 별도 단계로 필요하다.** 각 창이 자기 검증을 통과해도, 공용 런타임의 문구가 다른 편에서 어색한지는 통합해서 다른 편을 열어 봐야 드러난다(D-029).
4. **자동 검증은 "조건이 있는가"만 본다.** "그 조건이 실패할 수 있는가"(D-027), "그 동작이 실제로 노출되는가"(D-028), "그 문구가 이 편에 맞는가"(D-029)는 사람이 플레이해야 드러난다. 계약 검증기에 1·3번 규칙은 추가했다.
5. **지시가 틀릴 수 있다.** 조작대는 "게이지 0% 고정"이 실제로는 노출되지 않음을 실측으로 밝혔고, 관문 설계실은 지시서의 틀린 서술을 잡아 보고했다. 실행 세션이 지시를 검증하고 정정하는 것이 정상 동작이다.

## 6. 다음 세션 시작 명령

```bash
git fetch origin && git log --oneline origin/main -5 && cat docs/handoff/claude_four_track_session_close_20260911.md
```

상태가 이 문서와 충돌하면 덮어쓰지 말고 충돌 지점을 먼저 보고한다.
