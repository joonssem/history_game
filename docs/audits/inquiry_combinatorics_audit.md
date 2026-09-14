# inquiry-task 관문별 통과 조합 밀도 감사

생성: `scripts/13_audit_inquiry_combinatorics.js` (2026-09-14)

자동 검증(§8)이 아니라 **의미 검증을 위한 데이터**다. "조건이 구조적으로 성립하는가"만 본다 — 문장의 뜻과 근거가 실제로 맞는지는 `docs/audits/inquiry_pilot_semantic_review.md`에서 사람이 판단한다.

| 편 | 관문 | 문법 | N | 통과 | 밀도 | 경고 |
|---|---|---|---|---|---|---|
| regular_goryeo_culture | 1 | commit-revise | 9 | 3 | 33.3% |  |
|  | 2 | sequence | 72 | 1 | 1.4% |  |
|  | 3 | map-evidence | 27 | 1 | 3.7% |  |
|  | 4 | claim-evidence | 160 | 22 | 13.8% |  |
| regular_modern_open | 1 | commit-revise | 9 | 3 | 33.3% |  |
|  | 2 | sequence | 18 | 1 | 5.6% |  |
|  | 3 | map-evidence | 12 | 1 | 8.3% |  |
|  | 4 | claim-evidence | 24 | 4 | 16.7% |  |
| regular_neolithic | 1 | map-evidence | 12 | 1 | 8.3% |  |
|  | 2 | sequence | 18 | 1 | 5.6% |  |
|  | 3 | commit-revise | 9 | 3 | 33.3% |  |
|  | 4 | claim-evidence | 32 | 4 | 12.5% |  |
| regular_three_kingdoms | 1 | commit-revise | 9 | 3 | 33.3% |  |
|  | 2 | map-evidence | 12 | 1 | 8.3% |  |
|  | 3 | sequence | 18 | 1 | 5.6% |  |
|  | 4 | claim-evidence | 32 | 4 | 12.5% |  |

## 경고 규칙

- 마지막 관문(claim-evidence) 통과 밀도가 50%를 넘으면 표시한다.
- claim-evidence의 각 주장이 서로 다른 범주에 걸친 근거를 받는데 `requiredCategories`·`requiredEvidenceIds`가 둘 다 없으면 표시한다.
- 경고는 실패가 아니라 검토 대상 목록이다.
