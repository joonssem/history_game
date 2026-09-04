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
| 협동 MUD 운영 모드 | GitHub Pages 정적 모드 + Supabase DB 모드 | 정적 링크 공유와 DB 기반 세션·역할·진행·교사 제어·집계를 병행하되, 개인 기기별 단서·판단·실제 대화는 유지 |
| 플레이 진단 | Vanilla JS + session/localStorage 후보 | mudId·stageId·단계 시작·선택·재시도·시뮬레이터·완료 시각의 최소 기록. 학생 식별 정보는 저장하지 않음 |
| 현재 배포 | GitHub Pages | 현재 정적 파일 호스팅 |
| 목표 배포 경로 | Vercel | GitHub push 기반 자동 배포를 향후 기본 경로로 검토 |
| 백엔드·데이터베이스(계획) | Supabase | 익명 로그에서 시작해 협동 MUD에 필요한 세션·동기화·교사 제어·집계 기능으로 단계적 확장 |
| 자동 검증 | GitHub Actions + Python + Node.js | 데이터·계약·런타임·문법 검사 |

## 현재 구현과 목표 확장 구분

- 백엔드 API 없음
- 데이터베이스 없음
- 로그인·계정 없음
- 빌드 도구와 프런트엔드 프레임워크 없음

현재는 교실 기기에서 별도 설치 없이 실행하는 정적 GitHub Pages 배포와 localStorage 저장이 실제 운영 상태다. Vercel·Supabase는 목표 확장 경로이며, 프로젝트·테이블·코드 연동은 아직 구현하지 않았다.

협동 MUD는 GitHub Pages 정적 링크 모드와 Supabase DB 모드를 함께 고려한다. DB 모드에서는 세션·QR 입장·역할 배정·진행 동기화·교사 대시보드·힌트·익명 집계·이어하기·활동 변형 실험 등 필요한 기능을 폭넓게 활용한다. 어떤 모드에서도 개인 기기별 역할 정보·개인 판단·대화 유도 화면과 실제 교실 대화를 유지하며, 온라인 채팅이 이를 대체하지 않도록 한다.

## Future / Not Now

### 단계적 도입 경계

- **NOW / EARLY**: Vercel 배포 경로 확인, Supabase `play_events` 최소 로그 설계
- **NEXT**: 익명 활동 결과와 유물 기반 추론 데이터, 간단한 학급 단위 집계 검토
- **LATER**: Anonymous Auth, 친구 비교·협력, 교사용 통계 검토
- **FUTURE**: Realtime, 학급 공동 이벤트, 역사 타이쿤 장기 상태

서버 연결이 끊겨도 핵심 MUD 학습 흐름은 유지한다. localStorage는 현재 플레이 상태·빠른 UI 응답·네트워크 장애 시 복원을 담당하고, Supabase는 장기 보관이 필요한 익명 이벤트와 집계 후보를 담당한다. 서버 도입 전 개인정보 최소 수집, 보안, 보관 기간, 학교 운영 조건, 교사 관리 부담을 검토한다.

### 목표 실행 경계

```text
GitHub → Vercel → 학생 브라우저
                    ├─ localStorage: 즉시 상태·복원
                    └─ Supabase: 익명 이벤트·향후 집계
```

초기 Supabase 후보 테이블은 `play_events`이며, `session_id`, `mud_id`, `stage_id`, `event_type`, `elapsed_ms`, `is_correct`, `retry_count`, `created_at` 정도를 검토한다. 학생 이름·학번·이메일·계정·기기 고유 ID·IP 기반 개인 식별·위치는 저장하지 않는다.

Supabase를 실제 도입할 경우 공개 클라이언트 키와 RLS를 전제로 한다. 클라이언트에는 secret/service-role 키를 넣지 않으며, 학생은 필요한 이벤트만 INSERT하고 조회는 별도 정책으로 제한한다. Anonymous Auth는 유물·활동 상태의 관계 유지가 필요해질 때, Realtime은 학급 공동 단서·협력 미션이 검증된 뒤 검토한다.

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
python scripts/12_audit_choice_bias.py
node scripts/05_test_simulator_runtime.js
node --check js/app.js
```

새 라이브러리, 서버, 빌드 체계를 추가하려면 먼저 `BACKLOG.md`에 필요성과 대안을 기록하고 사용자 승인을 받는다.
