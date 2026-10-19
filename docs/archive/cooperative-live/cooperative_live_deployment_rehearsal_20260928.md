# 조선 후기 실시간 활동 배포 리허설 점검 (2026-09-28)

`TASK-20260928-CODEX-JOSEON-LATE-REHEARSAL | Preview·고정 주소 실제 브라우저 점검 | integration agent(Codex) | 상태: DOING (배포 복구 완료, 물리 기기 현장 실측 대기)`

## 결론

- 최초 점검에서는 새 Preview가 교사 로그인 callback에서, 고정 주소가 세션 생성 시 프런트·Convex 계약 차이에서 각각 차단됐다.
- 고정 주소가 참조하는 Convex 개발 배포를 현재 함수·스키마와 동기화해 세션 생성과 가상 학생 8명 입장을 복구했다.
- 임시 Preview 주소는 Auth0 callback에 추가하지 않고, 이미 허용된 고정 주소 `https://history-game-kappa-gilt.vercel.app`를 리허설 기준 주소로 사용한다.
- 시나리오 문안이나 MUD JSON은 변경하지 않았다.

## 재현 1 — 새 Preview Auth0 callback 불일치

- 주소: `https://history-game-ec09i4dg5-joon0noh-3339.vercel.app/teacher`
- 브라우저에서 `Google 계정으로 로그인`을 눌렀다.
- Auth0가 `Callback URL mismatch`를 표시했다.
- 실제 `redirect_uri`는 위 Preview의 `/teacher`였고, Auth0 허용 callback 목록에 없는 것으로 판정됐다.
- 판정: **운영 경로 변경으로 해소**. 임시 Preview 주소가 바뀔 때마다 Auth0 허용목록을 늘리지 않고, 고정 주소를 리허설 기준으로 사용한다. 새 Preview는 HTTP·정적 등록 확인에만 사용한다.

## 재현 2 — 고정 주소 Convex 함수 계약 불일치

- 주소: `https://history-game-kappa-gilt.vercel.app/teacher`
- Google 로그인과 서버 교사 허용목록을 통과했고, `joseon-late-market` v1이 활동 목록에 표시됐다.
- `활동 만들기`를 실행하면 다음 서버 오류가 화면에 표시됐다.

```text
[CONVEX M(sessions:create)] Server Error
ArgumentValidationError: Object contains extra field `scenarioId` that is not in the validator.
Object: {scenarioId: "joseon-late-market", scenarioVersion: 1.0}
Validator: v.object({})
```

- 저장소의 현재 `apps/cooperative-live/convex/sessions.ts`는 두 인자를 선택 인자로 받는다. 따라서 고정 주소 프런트는 최신이지만 연결된 Convex 함수는 다중 시나리오 도입 전 버전으로 판단된다.
- 조치: Vercel production 환경의 공개 `NEXT_PUBLIC_CONVEX_URL`이 가리키는 `glorious-guanaco-616` 개발 배포를 식별하고, 현재 `convex/**` 함수·스키마를 같은 대상에 반영했다.
- 재검증: `Convex functions ready` 완료 뒤 고정 주소에서 Google 교사 로그인 → `joseon-late-market` v1 선택 → 세션 생성 → 수업 코드 표시 → 가상 학생 8명 입장 → 4명씩 2모둠 진행 화면을 확인했다.
- 판정: **해결**. 물리 기기·학교 Wi-Fi·실제 QR 카메라·재접속은 현장 실측이 남아 있다.

## Regular MUD 배포 화면 표본 플레이

- GitHub Pages의 `regular_joseon_founding` 2·2-1·3·3-1과 `regular_joseon_folk` 1~3·3-1을 실제 버튼으로 진행했다.
- 수정된 사대문·박석·탈춤 풍자 문구, 오답 피드백, 재시도 버튼, 재도전 뒤 진행은 정상적으로 표시·작동했다.
- 새 화면 수준 불일치: `header.interactiveTitle`이 편 전체에서 고정되어 조선 건국 3·3-1 박석 화면에도 `한양 4대문(인·의·예·지) 배치 시뮬레이터`, 서민 문화 1·2단계에도 `탈춤 추임새 시뮬레이터`가 표시된다.
- 권고: 시나리오 문안을 직접 고치지 말고, 단계별 활동 제목 또는 모든 단계에 맞는 중립 제목을 별도 작업으로 검토한다. `scripts/18` 재설계 때 `header.interactiveTitle`과 단계별 `simulator.instruction`의 정합성도 비교 후보에 넣는다.

## 다음 게이트

1. 고정 주소에서 교사 1명+성인·교사 역할 4~8대의 학교 Wi-Fi·iPad QR·재접속·pause/resume·revision 0/N 초기화·종료 삭제를 현장에서 측정한다.
2. 실제 학생은 이번 리허설 범위에 포함하지 않는다.
