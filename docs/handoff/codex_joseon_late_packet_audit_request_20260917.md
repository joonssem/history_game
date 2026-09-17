# Codex 요청 — 조선 후기 협동 패킷(C1) 읽기 전용 감사

> 작성: 2026-09-17, Claude 기획 세션(Opus). 대상 커밋: 이 문서가 들어간 `main`.
> 근거: `docs/plans/implementation_plan_joseon_late_cooperative_live_vertical_slice.md` §4(콘텐츠 계약), §7(Codex는 읽기 전용 감사), §8 C1.

## 1. 무엇이 준비됐나

| 파일 | 내용 |
|---|---|
| `data/cooperative/joseon_late_packet.draft.json` | `CooperativeScenario` 모양의 초안, 자리표시자 0곳. **앱에 연결하지 않았다.** |
| `docs/handoff/claude_joseon_late_role_cards.md` | 역할 카드 확정본(2단계), 보류 문장 §11 |
| `docs/audits/joseon_late_source_review.md` | 다섯 주제 출처 검토, 역할 카드 문장별 판정 |
| `docs/handoff/claude_joseon_late_teacher_sticky_wall.md` | 질문 틀 3종(대상·근거·한계), sticky-wall 운영 |
| `docs/handoff/claude_joseon_late_packet_notes.md` | 연결 공방 작업 노트 |
| `scripts/15_validate_cooperative_packet.js` | 계약 관문·D-034 교차 검사·과잉 단정어·글 길이. `--final`, `--cards` |
| `DECISIONS.md` D-034 | 역할 id, 5인=품팔이, 3인=기록관 유지, 질문 틀은 교사 자료 |

검증: `node scripts/15_validate_cooperative_packet.js --final` PASS(자리표시자 0곳, 제안값 기준 경고 14건).

## 2. 감사해 줄 것 (문안·코드는 고치지 않고 기록만)

1. **정보 비대칭**: 역할 카드 한 장만으로 공동 해석(근거 2개·서로 다른 역할 2개)을 완성할 수 있는 경로가 있는가.
2. **정답 유도**: `firstJudgment`에 사실상 정답이 있는가. `limitOptions`가 특정 선택으로 몰리는가.
3. **역사 서술**: 대조실 판정과 JSON 문장이 어긋난 곳이 있는가. 특히 대동법 시기, 광작→품팔이 "일부" 범위, 설점수세제 범위를 본다.
4. **계약 적합성**: 고려 초기 활동(`39df640` 이후)에서 확정한 실제 타입·레지스트리와 이 초안의 필드가 맞는가. 다르면 차이 목록을 만든다. **이 항목이 T1 착수 전 가장 중요하다.**
5. **scripts/15의 한계**: 부정문 속 "모든 사람"(`recordkeeper.interest`) 오탐처럼 검사가 놓치거나 과하게 잡는 유형.

## 3. 결과 위치

`docs/audits/joseon_late_packet_red_team_audit.md`. 항목마다 파일·필드·재현·심각도·수용 기준을 적는다.

## 4. 알려 둔 한계

- 글 길이 기준(문장 40자 권장, 60자 경고)은 제안값이다. 10/12~16 리허설에서 조정한다.
- 역할 카드 문서의 농민 #2(77자)와 기록관 #4(71자)는 원문을 유지했다. 기록관 #4는 JSON에서만 두 문장으로 나눴다.
- 보류 문장 3건(이모작, 값 변동, 수공업자 경쟁)은 되살리지 않았다.
