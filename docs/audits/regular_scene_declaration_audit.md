# Regular MUD 씬(scene) 선언 누락 감사

> 읽기 전용 감사입니다. `data/mud/regular_*.json`은 이 감사 시점에 Codex가 `ordered-hotspot` 전환 작업으로 uncommitted 수정 중이었으므로, 파일을 전혀 편집하지 않고 현재 디스크 상태만 읽어서 분석했다.

## 배경

Deep-dive 작업 중 `deep_three_kingdoms:3`(6·25 전쟁 자료 해석 IF 화면)에서 `mode: "battle-gauge"`가 `scene` 미선언 상태로 남아 있어, 서술문("영웅 놀이로 재현하지 말자")과 정반대로 "⚔️ 호국 결전 🛡️" 전투 그래픽이 뜨는 버그가 발견됐다(`claude_track_b_deep_modern_result.md` §8 참고). Codex가 이후 같은 패턴을 Regular MUD에서도 찾아 커밋 `b3adfbc`로 5곳(`regular_goryeo_founding`·`regular_three_kingdoms`·`regular_three_kingdoms_life`의 IF 재시도 단계)을 고쳤다. 이번 감사는 **그 수정이 전수 반영됐는지, 같은 종류의 다른 위험이 남아 있는지**를 확인한다.

## 결론 먼저: 진짜 위험군은 0건 — Codex의 이전 수정이 완전했다

| 점검 항목 | 결과 |
|---|---|
| `scene` 미선언 + `hotspots` 없음 + `mode`가 `battle-gauge`로 시작(서사와 무관한 전투 그래픽이 강제로 뜨는 패턴) | **0건** — 28개 파일 전수 확인, 잔존 사례 없음 |
| `regular_myeongnyang.json` 밖에서 `mn-` 계열 모드(명량해전 전용 함선·포격 그래픽) 사용 | **0건** — 다른 MUD로 교차 오염된 사례 없음 |

즉 Deep-dive에서 찾았던 것과 같은 등급(서사와 시각 자료가 정면으로 모순되는 D급 문제)은 Regular MUD 28종 전체에서 더 남아 있지 않다.

## 2026-09-04 실행 결과

학생 피드백 대응의 B-1(기존 씬 팔레트 재사용) 범위로 36곳을 다시 대조했다.

- 28곳은 주제에 맞는 기존 씬이 확인되어 `scene` 필드만 추가했다(`b369bbd`). 공용 엔진은 수정하지 않았다.
- 나머지 8곳은 `regular_gwangbok` 4곳(`gwangbok-flag`·`gwangbok-vote`)과 `regular_myeongnyang` 4곳(`mn-*`)이다. 이 단계들은 전용 레거시 캔버스 렌더러가 상태·조작 화면을 직접 그린다.
- 현재 `drawSim()` 경로에서 `scene`을 선언하면 전용 렌더러보다 먼저 일반 배경을 반환하므로, 임의의 기존 씬을 추가하면 전용 태극기·투표·명량해전 화면을 가릴 수 있다. 또한 8곳 전체에 정확히 대응하는 기존 씬도 없다.

따라서 이 8곳은 씬 누락이 아니라 **전용 렌더러 예외**로 확정하고 JSON을 변경하지 않았다. 시각적 정교화를 계속하려면 별도의 엔진 합성 경로 또는 전용 렌더러 개선 계획이 필요하며, 이는 이번 JSON-only 범위에 포함하지 않는다.

## 참고용: 씬 미선언 상태로 남은 나머지 36곳 (경고 아님)

`scene`도 없고 `hotspots`도 없어 범용 fallback 그래픽(text-reading의 사료 두루마리, culture-touch의 문화 원형 아이콘, economy-*의 엽전, gwangbok-*의 태극기, dolmen-*의 고인돌, mn-*의 함선)이 뜨는 스테이지가 36곳 더 있다. 전부 `-1`(IF 재시도) 또는 MUD 자체의 최종 엔딩 스테이지이고, 3곳을 표본으로 서술문과 대조한 결과 **역사적으로 부적절하거나 정서적으로 위험한 매칭은 없었다** — 다만 가끔 톤이 살짝 겉돈다(예: `regular_gojoseon:3-1`은 법 기록의 한계를 담담히 설명하는 내용인데 "✨ 찬란한 민족 문화 🏺"라는 축제적 그래픽이 뜬다).

<details>
<summary>펼치기 — 36곳 전체 목록</summary>

| 파일 | 스테이지 | mode |
|---|---|---|
| regular_bronze_age.json | 4 (엔딩) | dolmen-step4 |
| regular_bronze_age.json | 1-1 | dolmen-step1 |
| regular_bronze_age.json | 2-1 | dolmen-step1 |
| regular_bronze_age.json | 3-1 | dolmen-step3 |
| regular_gojoseon.json | 1-1 | text-reading |
| regular_gojoseon.json | 2-1 | text-reading |
| regular_gojoseon.json | 3-1 | culture-touch |
| regular_goryeo_founding.json | 1-1 | text-reading |
| regular_goryeo_founding.json | 2-1 | text-reading |
| regular_goryeo_founding.json | 3-1 | culture-touch |
| regular_goryeo_society.json | 1-1 | text-reading |
| regular_goryeo_society.json | 2-1 | culture-touch |
| regular_goryeo_society.json | 3-1 | text-reading |
| regular_gwangbok.json | 4 (엔딩) | gwangbok-vote |
| regular_gwangbok.json | 1-1 | gwangbok-flag |
| regular_gwangbok.json | 2-1 | gwangbok-flag |
| regular_gwangbok.json | 3-1 | gwangbok-vote |
| regular_joseon_economy.json | 1-1 | economy-farm |
| regular_joseon_economy.json | 2-1 | economy-farm |
| regular_joseon_economy.json | 3-1 | economy-market |
| regular_joseon_founding.json | 1-1 | text-reading |
| regular_joseon_founding.json | 2-1 | text-reading |
| regular_joseon_founding.json | 3-1 | culture-touch |
| regular_joseon_silhak.json | 1-1 | culture-touch |
| regular_joseon_silhak.json | 2-1 | culture-touch |
| regular_joseon_silhak.json | 3-1 | text-reading |
| regular_myeongnyang.json | 4 (엔딩) | mn-current-switch |
| regular_myeongnyang.json | 1-1 | mn-map-idle |
| regular_myeongnyang.json | 2-1 | mn-map-choose |
| regular_myeongnyang.json | 3-1 | mn-combat-active |
| regular_three_kingdoms.json | 1-1 | text-reading |
| regular_three_kingdoms.json | 2-1 | text-reading |
| regular_three_kingdoms.json | 3-1 | text-reading |
| regular_three_kingdoms_life.json | 1-1 | culture-touch |
| regular_three_kingdoms_life.json | 2-1 | culture-touch |
| regular_three_kingdoms_life.json | 3-1 | text-reading |

</details>

## 방법

- `data/mud/regular_*.json` 28개 전체를 순회, 모든 스테이지의 `simulator.mode`·`simulator.scene`·`simulator.hotspots` 유무를 집계.
- "위험군" 기준: `hotspots` 배열이 있으면 공용 hotspot 렌더러가 우선하므로 `scene` 유무와 무관하게 안전(코드 경로상 `drawSim()`이 hotspots 존재 시 씬/모드 분기보다 먼저 처리). 따라서 `hotspots` 없음 + `scene` 없음 + `mode`가 고정 그래픽을 그리는 레거시 분기(`battle-gauge`/`culture-touch`/`text-reading`/`economy-*`/`gwangbok-*`/`dolmen-*`/`mn-*`/`silhak`/`hanyang*`/`neolithic`/`paleo-intro`)일 때만 표로 뽑았다.
- 3건을 표본으로 서술문(`narrative`)과 실제로 뜨는 그래픽의 텍스트/주제를 대조.

## 남은 판단 (액션 아이템 아님, 참고용)

- 36곳은 전부 "버그"가 아니라 "장식이 서사와 느슨하게만 연결된" 수준이다. Codex가 우선순위 낮은 폴리시 항목으로 백로그에 둘지, 그대로 둘지는 판단 사항.
- 정말 고치고 싶다면 Deep-dive에서 이미 쓴 패턴(hotspot-discovery로 전환하거나 `scene`만 선언)을 그대로 재사용할 수 있다 — 다만 이건 Regular MUD 파일 수정이라 Codex 담당 영역이다.
