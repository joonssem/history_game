# 민감한 역사 내용 교차 검증 보고 — `regular_japanese_rule_2` 1~3단계

작성: Claude (Sonnet 5)
작성일: 2026-09-01
기준 지시서: `claude_code_sensitive_history_crosscheck_instruction.md`
선행 판단: Codex 1차 검토 — `regular_japanese_rule_2` 1~3단계 민감한 역사 내용은 대체로 적절

## 1. 검증 범위

- 대상 파일: `data/mud/regular_japanese_rule_2.json`
- 대상 단계: `1`/`1-1`, `2`/`2-1`, `3`/`3-1`
- 대조 필드: `instruction`, `infoText`, `feedback`, `narrative`, `completion`, `simulator.scene`, `simulator.hotspots`, `simulator.interaction`, `glossary`, `sources`
- 대조 코드: `js/mudSimulators.js`(장면 렌더러), `js/mudEngine.js`(시뮬레이터·completion 소비 로직)
- 검증 방식: 코드 대 JSON 정적 대조 + 로컬 정적 서버(`python -m http.server 8791`)를 이용한 실브라우저 조작(`MudEngine.openMUD('regular_japanese_rule_2')` → 정답/오답 분기 전부 클릭 재현)

**이번 작업은 검증·보고만 수행했으며, 지시서의 변경 제한에 따라 `instruction`/`infoText`/`feedback`/`narrative`/`completion`/`simulator`를 포함해 어떤 필드도 수정하지 않았습니다.**

## 2. 대조 결과표

| 단계 | 대조 결과 | 확인된 불일치 | 위험도 | 수정 제안 |
|---|---|---|---|---|
| `1` → `1-1` | 일치 | 없음 | 낮음 | 없음 (변경 불필요) |
| `2` → `2-1` | 일치 | 없음 | 낮음 | 없음 (변경 불필요) |
| `3` → `3-1` | 일치 | 없음 | 낮음 | 없음 (변경 불필요) |

세 단계 모두 **변경 없음**으로 판정했습니다. 정답 분기(1→2→3→4)의 서사·장면도 함께 확인했으며 동일하게 일치합니다.

## 3. 교차 검증 항목별 판정

1. **narrative ↔ instruction/infoText 일치**: 세 단계 모두 서사(정책 통제 / 강제 동원·피해 기억 / 언어 운동)와 활동 목표(자료 확인·관찰)가 정확히 대응합니다.
2. **feedback의 감정·기억 강요 여부**: 강요 없음. 정답/오답 피드백 모두 "증언의 역사적 의의", "부정이 주는 2차 가해" 등 사실 설명 중심이며 특정 감정을 정답으로 요구하지 않습니다.
3. **completion의 기준**: `successText`가 세 단계 모두 "관찰과 조작을 마쳤습니다. 확인한 단서를 바탕으로 선택하세요"로 통일되어 있어, 피해 재현이나 감정 소비가 아니라 자료 확인을 기준으로 합니다.
4. **장면 도상 ↔ 학습 문구 일치, 불필요한 폭력 연상 여부**: `js/mudSimulators.js:1325`(`memorial-candlelight`, 2단계)는 코드 주석에 "인물·탄광·이송 없이 추모 공간만 그린다"고 명시되어 있고, 실제 구현도 촛불·비석·꽃만 그립니다. `imperial-subject-policy`(1단계), `korean-language-society`(3단계)도 문서·원고·실루엣만 구성되어 있으며 군인·무기 도상이 없습니다.
5. **강제 동원·전시 성폭력·언어 억압 표현의 선정성·비하 여부**: 없음. 용어집 정의("일본군 '위안부': …성노예로 삼은 중대한 반인도적 범죄")와 서사 모두 사실 서술 수준이며 자극적 묘사가 없습니다.
6. **초등 5학년 적합성**: 문장 구조·어휘가 기존 검수된 단계들과 동일한 수준을 유지하며 이해 가능합니다.
7. **단계 간 학습 순서(정책·통제 → 강제 동원과 피해 기억 → 언어 운동)**: `roadmap` 구성과 실제 브라우저 진행 순서(1→2→3)가 모두 이 순서를 유지합니다.
8. **코드-JSON 값 일치, 중복·불일치·오탈자 여부**: 없음. `gaugeLabel`/`infoText`/`completion.target`/`minActions`가 `js/mudEngine.js:370-450`에서 JSON 필드명 그대로 소비됩니다. 세 장면(`imperial-subject-policy`, `memorial-candlelight`, `korean-language-society`) 모두 렌더러에 존재하며, 브라우저 콘솔·정적 서버 로그에 오류가 없습니다.

## 4. 별도 판정

- **사실성**: 문제 없음 (용어집·서사가 국사편찬위원회 등 기존 출처 범위 내에서 서술됨. 새로운 피해 사례·수치·장소·증언을 임의로 추가하지 않았음).
- **연령 적합성**: 문제 없음.
- **정서 안전성**: 문제 없음 (피해 재현·자극적 묘사 없음, 추모·기록 중심 연출 유지).

## 5. 실제로 확인한 파일·명령·검증 결과

- `data/mud/regular_japanese_rule_2.json` 전문 검토
- `js/mudSimulators.js:1325-1393` 장면 렌더러 3종(`imperial-subject-policy`, `memorial-candlelight`, `korean-language-society`) 대조
- `js/mudEngine.js:289-450` completion/hotspot/infoText 소비 로직 대조
- 브라우저 실행: `.claude/launch.json`의 `static-server`(`python -m http.server 8791`)로 `MudEngine.openMUD('regular_japanese_rule_2')` 실행
  - 정답 경로 1→2→3→(3 재도전 루프 확인)까지 전부 클릭으로 재현
  - 오답 경로 1-1, 2-1, 3-1 전부 재현 (각 단계에서 hotspot 3개 완료 후 `simulatorProgress: 3` 확인 → 선택지 정상 활성화 → 실패 선택 클릭 → 실패 화면 문구가 JSON과 일치함을 확인)
  - `read_console_messages`(onlyErrors) — 오류 없음
  - `preview_logs`(level: error) — 서버 오류 없음
- 검증 후 임시 정적 서버는 종료했으며, 커밋·push는 진행하지 않았습니다.

## 6. 완료 조건 충족 여부

- [x] 대상 3단계(`1-1`, `2-1`, `3-1`) 전수 대조
- [x] 브라우저에서 1→2→3 흐름과 자료 탐색·완료 조건 확인
- [x] 민감한 표현의 문제 유무를 단계별로 판정 (셋 다 "문제 없음")
- [x] 수정 없이도 되는 항목과 승인 후 수정할 항목 분리 — **승인 후 수정이 필요한 항목 0건**
- [x] 커밋·push 없이 결과 보고만 제출

## 7. Codex 확인 요청

- 위 §2~§6의 대조 방법과 결론에 이견이 없는지 확인 부탁드립니다.
- 수정 필요 항목이 없어 별도 승인 대기 목록은 없습니다. 다른 단계(예: `4`/`4-1` 또는 타 MUD 파일)로 동일한 교차 검증을 확장할지 여부는 Codex/사용자 판단에 맡깁니다.
