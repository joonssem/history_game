# 정규 편 연대표 띠 읽기 전용 레드팀 감사

> 감사일: 2026-09-21  
> 기준: `main` `2982c77`  
> 범위: `data/lesson_track.json`, `data/mud/_index.json`, `js/lessonTrack.js`, `js/mudEngine.js`, `js/encyclopedia.js`, `scripts/16_validate_lesson_track.js`, `css/style.css`  
> 원칙: 읽기 전용. 코드·데이터를 수정하지 않았으며 Claude가 작업 중인 3단원 파일을 건드리지 않았다.

## 요약

`node scripts/16_validate_lesson_track.js`는 현재 데이터에서 통과했다. 색 외 상태 구분(기호·테두리·텍스트), 터치 목표 크기, 통일신라·발해 병존 안내는 양호하다. 다만 완료 판정이 유물 보유와 결합되어 있고, 검증기가 레지스트리와 띠의 메타데이터 차이를 충분히 잡지 못하며, 버튼의 접근성 역할이 덮이는 문제가 있다.

## 발견 사항

### LT-01 — 보상 유물 보유를 편 완료로 간주함

- 심각도: **높음**
- 파일: `js/lessonTrack.js`의 `rewardKeys()`·`isCompleted()`·`computeStatuses()`, `js/mudEngine.js` 완료 보상 저장, `js/encyclopedia.js` 저장 구조
- 재현: `history_explorer_save_v1.unlockedArtifacts`에 정규 편의 reward name 또는 artifactId를 플레이 전에 넣고 포털에 진입하면 해당 편이 완료로 표시된다. 반대로 보상명·ID가 바뀌면 기존 완료가 미완료로 돌아갈 수 있다.
- 현재 확인: 28편 사이 reward 중복과 빈 rewards는 없다.
- 수용 기준: `mudId` 기반의 불변 완료 기록으로 저장·판정하거나 기존 저장과 호환되는 명시적 마이그레이션을 제공한다. 유물 선해금, 보상 이름·ID 변경 fixture에서 오탐·회귀가 없어야 한다.

### LT-02 — 완료 편 재방문 시 `지금`이 `완료`를 덮음

- 심각도: **중간**
- 파일: `js/lessonTrack.js`의 `computeStatuses()`
- 재현: 완료한 편의 `mudId`를 `currentMudId`로 전달하면 완료 여부와 무관하게 `current`가 반환된다.
- 수용 기준: 완료와 현재가 겹칠 때의 우선순위를 사양에 명시하고 테스트한다. 완료를 유지하면서 현재 위치를 별도 채널로 표현하거나, 현 동작을 의도된 계약으로 확정한다.

### LT-03 — `_index.json`과 띠 메타데이터 어긋남을 놓침

- 심각도: **중간**
- 파일: `scripts/16_validate_lesson_track.js`
- 재현: 같은 `mudId`의 `unitId` 또는 `lessonNumbers`를 한쪽에서만 바꾸되 정렬 조건을 유지하면 통과할 수 있다. 신규 `regular_*.json` 파일을 만들고 `_index.json` 등록을 빠뜨린 경우도 검사 기준이 index라서 탐지하지 못한다. `lesson_track.json` 부재는 성공적 SKIP이다.
- 현재 잘 잡는 것: index에 정상 등록한 regular 편의 track 누락, 개수 차이, 중복, 유령 ID, non-regular 참조.
- 수용 기준: mudId별 `unitId`·`lessonNumbers`를 exact 비교하고, index가 가리키는 파일 존재·JSON 내부 mudId·rewards를 검증한다. CI에서는 track 부재를 실패 처리한다. `regular_*.json` 파일 목록과 index도 상호 대조한다.

### LT-04 — 버튼의 네이티브 접근성 역할을 덮음

- 심각도: **높음**
- 파일: `js/lessonTrack.js`의 `itemHtml()`
- 재현: `<button role="listitem">` 구조라 접근성 트리에서 버튼 대신 목록 항목으로 공표될 수 있다. 브라우저 키보드 동작은 남더라도 스크린리더가 활성화 가능한 컨트롤임을 정확히 안내하지 못할 수 있다.
- 수용 기준: button의 네이티브 role을 유지한다. 목록 의미가 필요하면 `<li role="listitem"><button ...></button></li>`로 구성한다. NVDA/Chrome 또는 접근성 트리에서 버튼으로 읽히고 Enter·Space로 활성화되어야 한다.

### LT-05 — 전용 키보드 포커스 표시가 없음

- 심각도: **중간**
- 파일: `css/style.css`의 `.lesson-track-item`, `.lesson-track-nav-btn`
- 재현: Tab 이동 시 브라우저 기본 outline에만 의존한다. 모바일 폭의 가로 스크롤 영역에서는 현재 포커스 위치를 알아보기 더 어렵다.
- 수용 기준: 두 버튼 클래스에 대비 3:1 이상의 최소 2px `:focus-visible` outline과 offset을 제공하고, 390px 폭에서도 포커스 항목이 가시 영역에 들어오는지 확인한다.

### LT-06 — `아직` 상태가 스크린리더 이름에 없음

- 심각도: **중간**
- 파일: `js/lessonTrack.js`의 `statusLabel()`·`itemHtml()`
- 재현: todo 항목은 시대·제목·연대만 읽고 미완료 상태를 공표하지 않는다.
- 수용 기준: 시각 라벨은 비워 두더라도 `aria-label` 또는 sr-only 텍스트로 `아직`을 제공하고 done/current/todo 세 fixture가 모두 상태를 명시적으로 읽게 한다.

### LT-07 — 비동기 렌더와 완료 갱신 공지가 없음

- 심각도: **낮음~중간**
- 파일: `js/lessonTrack.js`의 `renderStrip()`, `js/mudEngine.js` 완료 흐름
- 재현: 비동기 fetch 뒤 띠가 생기거나 완료 후 포털 상태가 바뀌어도 스크린리더에 변화가 공지되지 않는다.
- 수용 기준: 과도한 낭독 없이 제목·상태 요약에 적절한 status/live 처리를 하거나 포털 진입 시 heading 포커스 정책을 검증한다.

### LT-08 — `조선 전기` 라벨과 노출 연대가 충돌함

- 심각도: **중간**
- 파일: `data/lesson_track.json`의 order 16~17, `docs/audits/lesson_track_era_review.md`
- 재현: `regular_myeongnyang`과 `regular_joseon_diplomacy`는 `조선 전기`이지만 각각 1597년, 1636~1637년으로 표시된다. 앞선 전기 공통 범위는 1392~1592년경이다. 모순을 설명하는 `eraRangeNote`는 UI·aria·title에 노출되지 않는다.
- 수용 기준: 교육 기준에 따라 사건기·조선 중기·전쟁기 등의 라벨로 조정하거나 공통 경계를 재정의한다. 학생에게 노출되는 문자열끼리 모순이 없어야 하며 era review 근거를 함께 갱신한다.

### LT-09 — 열린 연대 범위의 의미가 불명확함

- 심각도: **중간**
- 파일: `data/lesson_track.json`의 `regular_modern_open`, `regular_independence_army`, `regular_gwangbok`
- 재현: `1876년~` 뒤에 `1910~1945`, `1945년~` 뒤에 `1950~1953`과 `1953년~`가 이어져 앞 범위가 현재까지 계속된다는 뜻처럼 읽힐 수 있다.
- 수용 기준: `1876년 이후(이 편의 중심 시기)`, `1945년~현재`처럼 의미를 분명히 하거나 검증된 종료 경계를 쓴다. 시대 범위와 사건 연도 표기 규칙을 통일한다.

### LT-10 — 연대 값 회귀 검사가 사실상 없음

- 심각도: **낮음~중간**
- 파일: `scripts/16_validate_lesson_track.js`
- 재현: `eraRange`가 비어 있지 않으면 `935~676`, 고조선의 `(전한다)` 누락, 통일신라 936 오기 등도 통과할 수 있다.
- 수용 기준: 자유 텍스트를 과도하게 고정하지 않되 확정된 13개 eraLabel의 canonical 범위와 예외 allowlist 또는 별도 검증 데이터로 핵심 값을 회귀 검사한다.

## 양호한 점

- 완료·지금은 색 외에도 `✓`·`📍`, 실선·점선, 텍스트 라벨로 구분된다.
- todo의 opacity가 1이라 저시력 가독성을 불필요하게 낮추지 않는다.
- 기본 버튼 크기와 모바일 크기가 44×44px 이상이다.
- 통일신라·발해의 중첩 안내가 캡션과 aria/title에 반영돼 있다.
- CSS 주석의 상태 기호(`✓/●/○`)는 현재 구현(`✓/📍/없음`)과 달라 낮은 우선순위의 문서 혼선이 있다.

## 검증

```text
node scripts/16_validate_lesson_track.js  # PASS
git status --short --branch               # 감사 전 clean
```

## 2026-09-28 — 라운드 11 통합본 후속 확인 (`261964cf`)

코드는 수정하지 않고 `data/lesson_track.json`, `scripts/16_validate_lesson_track.js`, `origin/feat/codex-lesson-track-validator`를 읽기 전용으로 대조했다.

| ID | 상태 | 확인 결과 |
|---|---|---|
| LT-03 | **부분 해결** | `unitId`·`lessonNumbers` exact 비교, index가 가리키는 파일 존재, 파일 내부 `mudId`, 디스크의 미등록 `regular_*.json`, `--ci`에서 track 부재 실패가 구현됐고 fixture도 통과한다. 그러나 원 수용 기준의 실제 MUD `rewards` 검증은 구현되지 않았다. |
| LT-08 | **해결** | 명량·병자호란이 모두 `조선 후기 / 1592년경~1876년경`으로 바뀌어 학생 노출 문자열의 모순이 해소됐다. D-037과 시대 검토 근거도 함께 갱신돼 있다. |
| LT-09 | **해결** | 개항기는 `1876년~1910년`, 광복·대한민국은 `1945년~현재`로 통일됐다. 사건 연도를 시대 범위처럼 섞던 표기와 의미가 불명확한 열린 `~`가 없어졌다. |
| LT-10 | **부분 해결** | 같은 `eraLabel`의 범위 불일치와 `~현재`가 아닌 열린 `~`는 오류로 실패하고, 13개 canonical 기대값 표와 회귀 fixture가 추가됐다. 다만 canonical 값 자체가 달라지면 경고만 내고 종료 코드는 성공이므로, `935~676` 같은 핵심 값 회귀를 실패시키라는 원 수용 기준을 완전히 닫지는 못한다. |

### `feat/codex-lesson-track-validator`에만 있는 검사

- `_index.json`의 regular 항목이 가리키는 파일명이 실제 디스크의 `regular_*.json` 집합에도 속하는지 역방향으로 확인한다. 통합본은 파일 존재와 내부 `mudId`는 확인하지만, 존재하는 비정규 파일명을 regular 항목이 가리키는 경우까지는 거부하지 않는다.
- canonical 기대값 표에 없는 새 `eraLabel`을 경고한다. 통합본은 알려진 label의 값 변경만 경고하고, 새 label은 조용히 통과한다.
- 자기 테스트에서 `--ci`일 때 track 부재가 실패하고 기본 실행에서는 SKIP되는 분기를 직접 fixture로 확인한다. 통합본은 동작 자체는 구현했지만 이 분기의 자기 테스트가 없다.
- JSON 파싱 오류를 검증 결과로 모아 보고한다. 통합본도 비정상 JSON에서 실패하지만 예외로 즉시 중단하므로, 이는 수용 기준 추가라기보다 진단 품질 차이다.

검증 결과:

```text
node scripts/16_validate_lesson_track.js --ci
# 자기 테스트 8건 통과
# PASS: entries 28개, order 1~28, regular 1:1·3중 대조·연대 회귀 검사 통과
```
