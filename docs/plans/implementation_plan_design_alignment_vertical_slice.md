# 구현 계획 — 설계 정합성 대표 수직 슬라이스

## 상태

- 상태: completed (정적·브라우저 점검 완료)
- 우선순위: P1-01
- 대상: `regular_paleolithic`
- 코드 구현: 대표 흐름의 최소 범위 반영 완료

## 목적

새 기능을 대량 추가하지 않고, 대표 Regular MUD 1종의 실제 학생 흐름이 PRD·사용자 흐름·와이어프레임과 일치하는지 확인한다. 발견된 문제만 최소 범위로 수정해 이후 다른 MUD에 적용할 기준을 만든다.

## 검토 범위

```text
포털 진입
→ 1단원·차시 카드
→ 구석기 MUD 시작
→ 단계 안내·자료 본문
→ 시뮬레이터 상호작용
→ 선택지 활성화
→ 다음 단계 또는 IF 스테이지
→ 엔딩·성찰·유물 해금
```

## 사전 확인 항목

- [x] 실제 차시 카드와 `WIREFRAMES.md`의 정보 구조 비교
- [x] `[자료 보기]`처럼 문서에만 존재하는 요소의 처리 결정
- [x] 세로형 태블릿에서 본문·캔버스·피드백·선택지의 화면 배치 확인
- [x] 캔버스와 버튼 대체 조작의 제공 여부 확인
- [x] 필수 단서 완료 전 선택지 진행 차단 확인
- [x] 오답 후 IF 스테이지와 원래 흐름 복귀 확인
- [x] 엔딩 전 성찰을 필수 활동으로 적용
- [x] 엔딩·성찰·유물 해금 흐름 브라우저 확인

## 1차 정적 대조 결과

정적 파일과 `regular_paleolithic.json`을 먼저 대조한 결과다. 브라우저 시각 점검은 브라우저 연결 오류로 아직 수행하지 못했다.

| 항목 | 확인 결과 | 처리 방향 |
|---|---|---|
| `[자료 보기]` 버튼 | 와이어프레임에는 있으나 `index.html`의 차시 카드 생성에는 없음 | 실제 기능을 추가하지 않고 와이어프레임에서 제거 완료 |
| 엔딩 전 성찰 | 6단계 `paleo-reflection`이 `required: false` | PRD 흐름에 맞춰 `required: true`로 변경 완료 |
| 태블릿 반응형 | MUD 레이아웃은 인라인 `auto-fit`을 사용하고 별도 `@media` 규칙은 없음 | 820×1180 및 좁은 세로 폭에서 실제 확인 |
| 시뮬레이터 대체 조작 | `mn-hotspot-actions` 컨테이너가 존재하고 일부 공통 처리 사용 | 구석기 5개 활동에서 실제 표시·조작 확인 |
| 필수 진행 차단 | 주요 정상 단계에 `required: true`, `target`, `minActions` 선언 | 브라우저에서 단서 완료 전 선택지 상태 확인 |

위 결과 중 결정이 필요한 항목은 현재 PRD와 실제 기능 범위를 기준으로 반영했으며, 브라우저 시각 점검만 남아 있다.

## 예상 변경 범위

검토 결과에 따라 다음 파일 중 필요한 파일만 수정한다.

- `index.html`: 화면 구조·접근성 속성
- `css/style.css`: 반응형·터치 레이아웃
- `js/mudEngine.js`: 진행 조건·상태 표시
- `js/mudSimulators.js`: 대표 시뮬레이터의 대체 조작
- `data/mud/regular_paleolithic.json`: 선언형 콘텐츠·완료 조건

다음은 이번 계획의 범위에서 제외한다.

- 전체 MUD 일괄 개편
- 새 프레임워크·패키지 도입
- 서버·로그인·데이터베이스 추가
- 역사 콘텐츠의 대량 문장 수정

## 완료 기준

- [x] 대표 흐름의 설계-실제 차이를 표로 기록
- [x] 수정이 필요할 때 변경 파일과 이유를 사전에 확정
- [x] 모바일·태블릿 세로 화면에서 핵심 흐름 완료
- [x] 필수 시뮬레이터를 우회하지 않고 선택지 진행 가능
- [x] 오답·IF·엔딩·성찰·보상 흐름에 회귀 없음
- [x] 다음 MUD에 재사용할 점검 기준을 문서화

## 검증 명령

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
node --check js/mudEngine.js
node --check js/mudSimulators.js
git diff --check
```

## 구현 후 기록

- `walkthrough.md`: 실제 변경과 검증 결과
- `BACKLOG.md`: 남은 문제와 다음 우선순위
- `DECISIONS.md`: 다른 MUD에도 적용할 장기 설계 결정이 생긴 경우
