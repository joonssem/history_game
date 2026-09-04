# 구현 계획 — 학생 피드백 3건에 대한 Regular MUD 해결 방안

작성: Claude (2026-09-04) — 제안. `data/mud/regular_*.json`은 Regular MUD 소유자(Codex) 담당이라 이 문서는 실행하지 않고 방안만 제시한다.

## 0. 핵심 요약

`INBOX.md`(2026-09-04 학생 피드백 3건)에 기록된 세 가지 문제는 **두 가지 해법으로 묶인다** — 그리고 둘 다 이번 세션에서 Deep-dive 4종에 이미 실행·검증한 패턴을 그대로 재사용한다. 새로 발명할 게 없다.

| 학생 피드백 | 해법 | 이번 세션 검증 이력 |
|---|---|---|
| ② 긴 문장이 정답 (27곳) | **A. 선택지 재작성** | `deep_prehistoric`/`joseon`/`modern`/`three_kingdoms` 4개 파일, 총 27곳에 적용해 전부 편향 해소 확인(`scripts/12_audit_choice_bias.py`) |
| ③ 무조건 눌러도 통과 (게이팅은 있지만 이해를 요구 안 함) | **A. 선택지 재작성**(같은 해법) | 위와 동일 — "선택지가 단서를 인용" 패턴 |
| ① 그림이 너무 단순함 (36곳 씬 미선언) | **B. 씬 선언 확장** | `docs/audits/regular_scene_declaration_audit.md`에서 이미 36곳 목록화 완료. Deep-dive에서 기존 씬 팔레트 재사용으로 5개 신규 삽화 적용해 검증 |

두 해법 모두 **공용 엔진(`js/mudEngine.js`/`js/mudSimulators.js`) 코드 변경이 필요 없다** — JSON 콘텐츠만 고치면 된다. 이게 중요한 이유: 지금 Codex가 진행 중인 `ordered-hotspot` 게이팅 작업과 파일은 겹치지만 **필드는 겹치지 않는다**(선택지 `text`, `simulator.scene` vs `simulator.interaction`/`sequence`) — 같은 파일에 순서만 맞추면 충돌 없이 이어 붙일 수 있다.

## 1. 해법 A — 선택지 재작성 (피드백 ②③ 동시 해결)

### 1-1. 왜 두 문제가 사실 하나인가

"게이팅"(시뮬레이터를 눌러야 선택지가 열림)은 Regular MUD 101곳 전부 이미 있다(`INBOX.md` 확인 결과). 그런데 게이팅은 **행동**(클릭 3번)만 강제하지 **이해**를 강제하지 않는다. 학생이 단서를 안 읽고 아무 데나 눌러도 통과되고, 그다음 선택지 화면에서는 "더 길고 구체적인 게 정답"이라는 표면적 패턴만으로 찍어도 맞는다. 두 불만은 같은 뿌리(시뮬레이터와 선택지가 서로 무관하게 설계됨)의 다른 증상이다.

### 1-2. 해법: 선택지가 단서를 인용하게 다시 쓴다

이번 세션에서 4개 Deep-dive 파일 전체에 적용한 방식을 그대로 쓴다.

**적용 순서(회귀 위험 낮은 순)**:
1. 정답 선택지 문장에 hotspot 라벨을 하나 이상 명시적으로 인용하도록 다시 쓴다 → 단서를 안 읽으면 어떤 선택지가 그 스테이지의 근거와 맞는지 알 수 없게 만든다.
2. 그 결과 정답 문장이 길어지면서 새로 생기는 길이 편향은, 오답도 같은 단서를 반대 결론으로 인용해 균형을 맞춘다.
3. `scripts/12_audit_choice_bias.py`로 재검증 — 목표는 해당 스테이지가 상위 목록에서 빠지는 것.

**실제 적용 예시 (이번 세션, `deep_three_kingdoms` 커밋 `5001038`에서 발췌)**:

```diff
- "text": "🤝 \"백제 귀족과 백성을 차별 없이 신라 관등에 편입하고, 당나라의 야욕에 맞설 아군으로 포용한다!\""
+ "text": "🤝 \"웅진도독부의 야심과 백제 부흥군의 저항을 감안해, 백제 귀족과 백성을 신라 관등에 편입해 아군으로 포용한다!\""
```

```diff
- "text": "⛓️ \"백제 유민의 사정은 듣지 않고 모두 같은 방식으로 강압 통치한다.\""
+ "text": "⛓️ \"웅진도독부의 야심도 백제 부흥군의 저항도 살피지 않고, 모두 같은 방식으로 강압 통치한다.\""
```

두 문장 모두 같은 두 단서("웅진도독부"·"백제 부흥군")를 인용하지만 반대 결론으로 간다 — 단서를 안 읽으면 어느 쪽이 정답인지 알 방법이 없고, 길이도 비슷해진다.

### 1-3. 대상: 27곳 (INBOX.md `scripts/12_audit_choice_bias.py` 재실행 결과 상위 목록)

```
regular_goryeo_society:3 (delta 18.0)
regular_gojoseon:3 (delta 14.5)
regular_joseon_silhak:2 (delta 14.5)
regular_joseon_folk:2 (delta 14.0)
regular_sejong:3 (delta 14.0)
regular_balhae:4 (delta 13.0)
regular_independence_army:3 (delta 13.0)
regular_joseon_silhak:3 (delta 13.0)
regular_three_kingdoms:3 (delta 12.5)
regular_goryeo_culture:3 (delta 12.0)
regular_independence:2 (delta 12.0)
regular_joseon_folk:1 (delta 12.0)
regular_bronze_age:1 (delta 11.5)
regular_goryeo_war:1 (delta 11.5)
regular_myeongnyang:3 (delta 11.5)
regular_three_kingdoms_life:2 (delta 11.5)
... (전체 목록은 `python scripts/12_audit_choice_bias.py` 재실행으로 확인)
```

**우선순위 제안**: 델타 상위 10곳부터(학생이 가장 쉽게 눈치챌 수 있는 극단값) → 나머지는 일괄.

### 1-4. 학생이 지목한 그 사례부터 먼저 확인할 것

교사가 이미 "수정했다"고 답한 특정 사례가 있다면, 그 스테이지부터 §1-3 목록과 대조해 실제로 빠졌는지 확인하고, 빠졌다면 다음 재발 방지를 위해 어떤 걸 고쳤는지 `walkthrough.md`에 남기는 걸 권장한다(이번 세션 스타일의 회귀 방지 관례).

## 2. 해법 B — 씬 선언 확장 (피드백 ① 해결)

### 2-1. 이미 목록화되어 있다

`docs/audits/regular_scene_declaration_audit.md`에 씬 미선언 36곳이 전부 정리돼 있다. 이 문서는 "버그 아님, 참고용"으로 분류했지만, **학생이 직접 "그림이 단순하다"고 짚었다는 건 이게 콘텐츠 품질 이슈로 격상됐다는 뜻**이다.

### 2-2. 두 가지 실행 경로

| 경로 | 방법 | 비용 |
|---|---|---|
| B-1. 기존 씬 재사용 | `js/mudSimulators.js`에 이미 그려진 팔레트 중 주제가 맞는 걸 `scene` 필드에 선언만 추가 | 매우 낮음 — JSON 한 줄, 코드 변경 없음 |
| B-2. 신규 씬 제작 | 기존 팔레트에 맞는 게 없으면 `drawConfiguredSceneBackground`에 새 삽화 추가 | 높음 — 공용 코드(`js/mudSimulators.js`) 변경 필요, 사전 협의 대상 |

**우선 B-1만 먼저 적용을 제안한다.** 이번 세션에 Deep-dive에서 실제로 5곳(한양 4대문·훈민정음·수원 화성·고조선 관련 등)을 기존 팔레트만으로 해결했다 — Regular MUD의 36곳 중에도 주제가 겹치는 기존 씬이 있을 가능성이 높다(예: `regular_gojoseon.json`은 Deep-dive가 이미 쓴 `gojoseon-map`/`gojoseon-law`/`gojoseon-artifacts`와 주제가 정확히 겹친다).

### 2-3. 대상 36곳과 씬 매칭 후보 (일부 예시, 전수는 원 감사 문서 참고)

| 파일:스테이지 | 현재 | 매칭 후보 씬(기존 팔레트) |
|---|---|---|
| `regular_gojoseon.json:3-1` | culture-touch(범용) | `gojoseon-law` (법 조항 내용과 정확히 일치) |
| `regular_joseon_founding.json:*-1` | text-reading/culture-touch | `joseon-founding-evidence` (이미 그 MUD 자체 스테이지 4에서 쓰는 씬 — 재시도 화면에도 같은 씬 적용 가능) |
| `regular_myeongnyang.json:1-1~3-1` | mn-map-idle 등 | 해당 MUD 자체가 명량해전 전용 렌더러(`drawPreciseMyeongnyang`)를 이미 씀 — 씬보다는 IF 화면에 실제 지도/함선 상태를 반영하는 방식 검토 |

전체 36곳의 정확한 매칭은 `docs/audits/regular_scene_declaration_audit.md`의 목록과 §2-2 표(코드에 실제 존재하는 전체 씬 팔레트 78종)를 대조해 하나씩 확인이 필요하다 — 이 문서는 방향만 제시한다.

## 3. 실행하지 않을 것 (범위 밖 제안)

- **신규 일러스트/이미지 자산 제작**: 학생 불만이 "너무 단순하다"이지 "그림 자체가 없다"가 아니다. 기존 캔버스 벡터 팔레트를 확장하는 것으로 충분할 가능성이 높고, 이미지 파일 도입은 D-002(Vanilla JS 정적 구조 유지)와 자산 파이프라인·용량 문제를 새로 만든다.
- **함정 단서(decoy) 전면 도입**: Codex가 이미 Deep-dive에서 시작한 패턴이라 Regular까지 확장할지는 별개 결정 — 이 문서는 A(선택지 재작성)만으로도 학생이 지목한 문제 두 개가 해결된다고 보고 범위에 넣지 않았다.
- **DECISIONS.md/PRD.md 변경**: 이 세 문제 모두 기존 원칙(문제 수 늘리지 않기, 선택지 편향 금지, 게이팅 필수)을 이미 명문화하고 있다 — 새 결정이 아니라 기존 결정의 미이행 사례를 고치는 것이다.

## 4. 검증

```text
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/12_audit_choice_bias.py   # 해법 A 회귀 확인
node --check js/mudSimulators.js         # 해법 B가 코드 변경 없이 끝났는지 재확인
```

## 5. 다음 단계 제안

1. §1-3 상위 10곳부터 해법 A 시범 적용(이번 세션에서 4개 파일에 쓴 방식 그대로) → 재검증 → 나머지 일괄.
2. §2-3 표를 `docs/audits/regular_scene_declaration_audit.md`의 36곳 전체와 대조해 씬 매칭 완성.
3. 두 작업 모두 끝나면 `INBOX.md`의 2026-09-04 학생 피드백 항목 상태를 `triaged`→`promoted`로 갱신하고 무엇을 고쳤는지 학생에게 실제로 확인해 줄 후속 관찰(EXPERIMENTS.md 가설화)을 검토.
