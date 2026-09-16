# 고려 초기 실시간 협동 활동 구현 결과

- 작업일: 2026-09-16
- 브랜치: `feat/cooperative-live-early-goryeo`
- 작업 claim: `TASK-20260916-01`
- 계획: [`implementation_plan_early_goryeo_cooperative_live_first_activity.md`](../plans/implementation_plan_early_goryeo_cooperative_live_first_activity.md)
- 상태: 코드·자동 검증 완료, 실제 기기 리허설 대기

계획 당시 Claude 단일 구현을 지정했으나 실행 에이전트들이 완료하지 못해, 같은 별도 worktree에서 Codex가 implementation/content 역할을 인계했다. 감사는 구현 커밋 뒤 다른 audit agent가 읽기 전용으로 수행한다. 기존 정적 MUD와 `data/mud`, 루트 `js`는 수정하지 않았다.

## 구현 범위

- 고조선 기술 회귀와 고려 초기 활동을 서버 검증형 다중 시나리오로 분리했다.
- 브라우저에 공개해도 되는 시나리오 메타데이터와 서버 전용 역할 본문·출처를 분리했다.
- 고려 초기 5개 역할과 3·4·5인 편성, 3인 모둠의 발해 유민 공통 보충 자료를 추가했다.
- 서버에는 최초 판단 완료 여부만 저장하고 선택·까닭은 현재 탭 `sessionStorage`에만 남긴다.
- 전원 공유 뒤 정책 2개·서로 다른 역할 근거 2개·연결 설명·한계를 검증하는 공동 초안을 연다.
- 공동 초안 revision이 바뀌면 이전 확인을 모두 무효화하고, 전원이 같은 revision을 확인해야 완료한다.
- 교사 pause/resume, 전체 단계 이동, 도움 요청·해제, 모둠별 완료·확인 n/N을 추가했다.
- 종료와 TTL 정리에 공동 초안·도움 요청을 포함했다.
- 기존 21명 고조선 흐름과 새 4명 고려 흐름을 함께 자동 검증한다.

## 역사 내용 근거

모든 상세 출처는 서버 전용 `convex/scenarios.ts`에 기록했고 확인일은 2026-09-16이다.

- 신라 왕실 예우와 사심관: <https://contents.history.go.kr/mobile/hm/view.do?levelId=hm_046_0030>
- 후삼국기 지방 세력과 고려의 통합: <https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_h51_0050_0010_0020>
- 발해 유민의 고려 수용: <https://contents.history.go.kr/front/km/print.do?levelId=km_001_0040_0030_0010_0010&whereStr=>
- 농업 생산과 수취 부담: <https://contents.history.go.kr/front/km/view.do?levelId=km_027_0040_0030_0030>

역할 문장은 특정 집단 전체의 고정된 생각으로 단정하지 않고, 건국 직후 회의에 참여한 가상 인물의 처지 자료로 제시했다.

## 검증 결과

- `npm run check`: 통과
  - lint 통과
  - TypeScript 검사 통과
  - 단위 테스트 17건 통과
  - Convex 통합 테스트 2건 통과
  - production build 통과
- client static bundle의 고려 역할 비공개 본문과 우리역사넷 URL 검색: 미검출
- `git diff --check`: 통과

## 미실행·제약

- 교사 1명+학생 역할 브라우저 4대의 수동 리허설은 아직 실행하지 않았다.
- 학교 Wi-Fi, iPad QR, 실제 WebSocket 재접속은 아직 확인하지 않았다.
- 실제 학생 반응과 8~10분 완료 여부는 아직 관찰하지 않았다.
- 운영 배포·GitHub main 병합·Production 전환은 하지 않았다.
- 장애 시 대체 절차는 교사 읽기·화이트보드 방식이며 독립 정적 웹판은 아니다.

다음 관문은 [`TEACHING_EARLY_GORYEO.md`](../../apps/cooperative-live/TEACHING_EARLY_GORYEO.md)에 따라 성인·교사 역할 4~8대 리허설을 수행하고 결과를 `EXP-009`에 기록하는 것이다.

## 코드 감사 반영

기준 커밋 `39df640`의 읽기 전용 감사에서 공동 초안 내용 미표시, 편집 시작 revision 미고정, 판단·말하기 단계의 자기 역할 자료 미표시가 발견됐다. 서버의 정확히 2개 검증도 함께 강화했다. 수정 내용과 회귀 근거는 [`early_goryeo_cooperative_live_review.md`](../audits/early_goryeo_cooperative_live_review.md)에 기록했다.

수정 커밋 `c21e74b` 이후 최종 재감사에서는 병합 차단 결함이 없었다. 21명 테스트의 고조선 시나리오 미명시와 QR “일회” 표현을 추가로 바로잡아 `bd67371`에 기록했다. 판정은 기술 Preview·성인 리허설용 main 병합 Go, 실제 학생 Production No-go다.

## main 통합

2026-09-16 최신 원격 문서 커밋 `16d28bf`와 고려 초기 기능을 main에 함께 통합했다. main 체크아웃에서 `npm ci` 뒤 `npm run check`, `scripts/04_validate_mud_contract.py`, `scripts/15_validate_cooperative_packet.js`를 다시 통과했다. 중단된 대안 시나리오 파일은 삭제하지 않고 이름 있는 stash로 보존했으며 최종 코드에는 포함하지 않았다.
