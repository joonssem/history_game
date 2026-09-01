# 반복 탭 내성 후보 우선순위 — Codex 1차 분류

검토일: 2026-09-01
근거: `scripts/09_audit_tap_resistance.py` 실행 결과 40개

| 우선순위 | 단계 | 현재 구조 | 1차 판단 | 다음 조치 |
|---|---|---|---|---|
| A | `regular_gwangbok:3` | `gwangbok-vote`, target 2, minActions 2 | 서로 다른 투표 행동 2개를 요구하는지 확인 필요 | 브라우저에서 기표·투표함 투입의 중복 방지 확인 |
| A | `regular_myeongnyang:4` | `mn-current-switch`, target 80, minActions 1 | 슬라이더 위치 조건이 실제 학습 행동을 요구하는지 확인 필요 | 보조 MUD 노출 여부와 함께 확인 |
| B | `regular_bronze_age:1` | `dolmen-step1`, target 1, minActions 1 | 거석 운반 전 단계의 단일 버튼 활동 | 1회 확인 단계인지 반복 탭 우회인지 확인 |
| B | `regular_bronze_age:4` | `dolmen-step4`, target 1, minActions 1 | 완료 확인용 단일 버튼 활동 | 엔딩 확인 단계로 의도된 것인지 확인 |

## 범위 판단

- 40개는 구조 감사 신호이지 실제 학생의 반복 탭 우회 측정 결과가 아니다.
- 나머지 36개는 `scene` 보유 단계이므로 장면 좌표·핫스팟·상호작용·완료조건은 Claude 담당 범위다.
- `type: buttons`와 특수 슬라이더는 일반 게이지 반복 탭과 같은 방식으로 일괄 수정하지 않는다.
- 위 4개를 브라우저에서 확인한 뒤, 수정이 필요하면 별도 계획과 사용자 승인을 받는다.
- 실제 학생 활동 시간 측정(3명 이상, 목표 5~10분)은 별도 검토다.
