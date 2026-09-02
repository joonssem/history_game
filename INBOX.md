# INBOX — 사용자 입력·관찰 원문

이 문서는 사용자가 아이디어, 학생 반응, 수업 관찰, 문제 제보를 자유롭게 기록하는 단일 입력 창구다.

## 사용 규칙

- 사용자는 이 문서에 자연어 메모를 추가한다.
- 에이전트는 원문을 보존한 뒤 내용의 성격에 따라 `PRD.md`, `DECISIONS.md`, `EXPERIMENTS.md`, `ROADMAP.md`, `BACKLOG.md`, `ARCHITECTURE.md`로 분류·승격한다.
- 원문만으로 확정할 수 없는 내용은 결정하지 않고 가설 또는 검토 항목으로 남긴다.
- 승격이 끝난 항목에는 처리 상태와 연결 문서를 기록한다.

## 처리 상태

- `inbox`: 아직 분류하지 않음
- `triaged`: 관련 문서에 분류했지만 결정·실험·구현이 남음
- `promoted`: 필요한 기준 문서에 반영함
- `archived`: 역사적 기록으로 보관하며 현재 실행 기준으로 사용하지 않음

---

## 2026-09-01 대화 메모

상태: `promoted`

- 학생들이 MUD 두 활동을 4분 이내에 완료함.
- 친구끼리 공략을 공유하면서 더 빨라지는 현상이 있음.
- 플레이 시간 로그를 수집해 원인을 확인해보고 싶음.
- 유물 2개를 비교해서 역사적 추론을 만드는 활동이 유망해 보임.
- 학생들이 유물 등급과 설명에 관심을 보임.
- 유물을 이용한 친구와의 경쟁 의견이 나옴.
- 역사 타이쿤 의견도 학생에게서 나옴.
- 옛 MUD처럼 탐험과 숨겨진 단서를 넣는 것도 검토할 가치가 있음.
- Vercel + Supabase 도입을 검토함.
- 우선 플레이 로그 정도부터 Supabase를 사용하는 방안이 좋아 보임.
- Realtime, 타이쿤, 본격적인 멀티플레이는 아직 하지 않음.

처리 문서: [`EXPERIMENTS.md`](./EXPERIMENTS.md), [`ROADMAP.md`](./ROADMAP.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`BACKLOG.md`](./BACKLOG.md), [`PRD.md`](./PRD.md), [`DECISIONS.md`](./DECISIONS.md)

---

## 2026-09-02 방향 재정리 요청

TASK-20260902-01 | 현재 구조·멀티 트랙 방향 진단 | 담당: 기획·점검 에이전트 | 상태: DONE

상태: `triaged`

현재 차시별로 구분된 MUD의 버그 수정하기, 인터랙티브 활동 버그 수정하기 등

Deep dive MUD 고도화

여러 아이디어를 생각하여 역사 웹앱의 방향을 정하기 (현재, 유물관리, 역사타이쿤 등 아이디어가 있음)

요청: 위 의견을 확인하고 웹프로그래머의 전문가적 시선에서 평가 및 제안할 것.

분류 메모: 기존 정합성·런타임 안정화, Deep-dive 품질 확장, 제품 방향 결정의 세 트랙으로 검토한다. 새 기능 확정 전 문제 목록·검증 기준·작은 실험을 먼저 정한다.

검토 검증: `python scripts/01_validate_game_data.py`, `python scripts/03_validate_mud_integrity.py`, `python scripts/04_validate_mud_contract.py`, `python scripts/06_validate_static_assets.py`, `python scripts/08_validate_mud_catalog.py`, `python scripts/09_validate_mud_sources.py`, `python scripts/09_audit_tap_resistance.py`, `python scripts/12_audit_choice_bias.py`, `node scripts/05_test_simulator_runtime.js`, `node --check js/*.js`

## 2026-09-02 에이전트 위임

- Track B — Deep-dive MUD 고도화: Claude 담당
- Track C — 역사 웹앱 제품 방향·작은 실험 설계: Claude 담당
- Track A — Regular MUD·인터랙티브 활동 안정화 및 최종 통합: Codex 담당
- Claude는 공용 엔진과 Codex 소유 기준 문서를 동시에 수정하지 않고, 담당 파일과 결과 보고서 중심으로 작업한다.

전달 문서: [`claude_track_b_deep_dive_instruction.md`](./docs/handoff/claude_track_b_deep_dive_instruction.md), [`claude_track_c_product_direction_instruction.md`](./docs/handoff/claude_track_c_product_direction_instruction.md)

TASK-20260902-02 | Track B: deep_joseon.json 파일럿 개선 | 담당: Claude | 상태: DONE (결과: docs/handoff/claude_track_b_deep_dive_result.md)
