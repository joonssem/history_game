# 기술 스택 및 시스템 경계

## 목적

현재 구현을 설명하고 향후 에이전트가 불필요한 프레임워크·서버·패키지를 도입하지 않도록 기술 선택과 범위를 기록한다.

## 현재 스택

| 영역 | 선택 | 역할 |
|---|---|---|
| 화면 | HTML5 | 단일 진입점과 화면 구조 |
| 스타일 | CSS3 | 반응형 레이아웃·시대별 테마 |
| 로직 | Vanilla JavaScript ES6+ | 포털·MUD·퀴즈·도감 엔진 |
| 상호작용 | HTML5 Canvas | 역사 시뮬레이터 렌더링·터치 입력 |
| 효과음 | Web Audio API | 브라우저 내장 효과음 생성 |
| 콘텐츠 | JSON | 커리큘럼·MUD·퀴즈·유물 데이터 |
| 개인 저장 | localStorage | 유물·배지·최고점 등 로컬 진행 저장 |
| 배포 | GitHub Pages | 정적 파일 호스팅 |
| 자동 검증 | GitHub Actions + Python + Node.js | 데이터·계약·런타임·문법 검사 |

## 의도적으로 없는 구성

- 백엔드 API 없음
- 데이터베이스 없음
- 로그인·계정 없음
- 빌드 도구와 프런트엔드 프레임워크 없음

이는 교실 기기에서 별도 설치 없이 실행하고, 정적 GitHub Pages에 배포하는 현재 제품 범위에 따른 결정이다. 서버 저장이나 교사별 학습 분석이 필요해질 때 별도 의사결정으로 검토한다.

## 주요 실행 경계

```text
index.html
  └─ app.js
      ├─ history_curriculum_48_lessons.json
      ├─ mud/_index.json
      └─ MudEngine → mud/*.json → MudSimulators

MUD 완료 → encyclopedia → artifacts.json → localStorage
퀴즈 시작 → quizGame → quizzes.json → localStorage
```

## 검증 명령

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
node --check js/app.js
```

새 라이브러리, 서버, 빌드 체계를 추가하려면 먼저 `BACKLOG.md`에 필요성과 대안을 기록하고 사용자 승인을 받는다.
