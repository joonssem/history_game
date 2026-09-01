# ARCHITECTURE — 현재 구조와 목표 확장

## 현재 구현 구조

```text
GitHub Pages
    ↓
학생 브라우저
    ├─ HTML/CSS/Vanilla JS
    ├─ JSON 콘텐츠·Canvas 시뮬레이터
    └─ localStorage
       ├─ 유물·배지
       └─ 개인 진행 상태
```

현재 핵심 MUD 학습 흐름은 서버 없이 작동한다.

## 목표 확장 구조

```text
GitHub → Vercel → 학생 브라우저
                    ├─ localStorage
                    │  └─ 즉시 상태·복원·네트워크 장애 대응
                    └─ Supabase
                       └─ 익명 플레이 이벤트·향후 집계
```

Vercel은 정적 프런트엔드의 목표 배포 경로이며, 현재 GitHub Pages를 즉시 대체하지 않는다. Supabase는 첫 단계에서 `play_events` 로그만 검토한다.

## 데이터 흐름 원칙

1. 플레이 상태와 보상은 우선 localStorage에 반영한다.
2. 네트워크가 가능할 때만 최소 익명 이벤트를 Supabase에 전송하는 방식을 검토한다.
3. 서버 장애가 핵심 학습 흐름을 막지 않도록 한다.
4. 학생 식별 정보와 불필요한 행동 기록은 저장하지 않는다.

## 단계별 데이터 후보

- 초기: `play_events`
- 이후 검토: `artifact_inventory`, `artifact_observations`, `artifact_inferences`
- 타이쿤 단계 이후 검토: `village_state`, `decision_history`

## 보안 경계

- 브라우저에는 공개 클라이언트 키만 사용한다.
- secret/service-role 키는 브라우저 코드에 포함하지 않는다.
- Supabase 도입 시 모든 테이블에 RLS를 명시한다.
- Anonymous Auth는 여러 활동 간 상태 관계가 실제로 필요해질 때만 검토한다.
- Realtime은 학급 공동·협력 활동이 먼저 검증된 뒤 검토한다.

## 현재 상태

- Supabase 프로젝트·테이블·Auth·Realtime: 미구현
- Vercel 이전: 미실행
- 플레이 로그 코드: 미구현
- 현재 문서의 기술 후보를 구현 지시로 해석하지 않는다.
