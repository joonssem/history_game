# Vercel Git 연동·삭제 push 이후 빌드 점검

- 작업 claim: `TASK-20261019-VERCEL-LINK-CHECK | Vercel Git 연동·삭제 push 이후 빌드 상태 | audit agent(Codex) | 상태: DONE`
- 점검일: 2026-10-19, 기록 마감 14:24 KST. 아래 결과는 조회 시점의 상태다.
- 기한: 2026-10-28 이전.
- 범위: 외부 상태 읽기 전용 조회와 이 문서 기록. 설정 변경·배포·재배포·push 금지.
- 기준: `main`, 앱 제거 커밋 `429d88c2f64afa8f5c61ee8d95c1cedaf64f6f60`.

## 판정

**GitHub 연동은 유지되어 있으며, 앱 제거를 포함한 push 이후 Production 빌드 2건이 실패했다.** 두 빌드 모두 삭제된 Root Directory를 찾지 못해 중단됐다. 기존 운영 별칭은 마지막 성공 배포를 계속 가리킨다. 연결 해제 또는 실패 유지 여부는 사용자 결정 사항이며 이번 점검에서는 변경하지 않았다.

## 연결 상태

| 항목 | 확인값 |
|---|---|
| Vercel 프로젝트 | `joon0noh-3339/history-game` |
| 프로젝트 ID | `prj_J4IFbF7lFg3B0nQTyl1pT16AogwR` |
| Git 공급자·저장소 | GitHub, `joonssem/history_game` |
| Production branch | `main` |
| Root Directory | `apps/cooperative-live` |
| Framework / Node.js | Next.js / 24.x |
| 최근 배포 생성 경로 | `source: git`, `target: production` |

근거: Vercel CLI `project inspect history-game` 및 GET `/v9/projects/prj_J4IFbF7lFg3B0nQTyl1pT16AogwR`의 연결 정보. 프로젝트 설정과 실제 Git 생성 배포를 함께 대조했다.

## 삭제 push 이후 빌드

시각은 배포 생성 시각(KST)이며 로그의 UTC에는 9시간을 더했다.

| 생성 시각(2026-10-19) | 커밋 | 상태 | 배포 |
|---|---|---|---|
| 13:25:44 | `a45aa7545cbf3730028260c6ad2dc19811c01048` | READY, 제거 전 마지막 성공 | [6u81jjpjn](https://history-game-6u81jjpjn-joon0noh-3339.vercel.app) |
| 13:34:48 | `7bb45b6c6956b27daada767d93f519659700324c` | ERROR | [771mbwsuj](https://history-game-771mbwsuj-joon0noh-3339.vercel.app) |
| 13:46:27 | `5a74a3e72786ef28534c7ba43c334732380bfbb2` | ERROR | [5a8j5qrbw](https://history-game-5a8j5qrbw-joon0noh-3339.vercel.app) |

- 앱 제거 커밋은 `429d88c2f64afa8f5c61ee8d95c1cedaf64f6f60`(13:27:29 KST)이다. `git merge-base --is-ancestor 429d88c 7bb45b6`가 성공해 첫 실패 배포에 앱 제거가 포함됨을 확인했다.
- 최근 배포 목록에서 제거 커밋 자체를 SHA로 하는 별도 배포는 보이지 않았다. 따라서 “429d88c 단독 빌드 실패”가 아니라 **“제거가 포함된 push 이후 빌드 실패”**로 판정한다.
- 첫 실패 배포 ID: `dpl_CKiSGxQBSkKYDmPYHWxKXR3dF4hD`.
- 두 번째 실패 배포 ID: `dpl_BJJJYby49kcnT3bNMKZrxERJ9QDJ`.
- 두 로그 모두 `main`의 해당 커밋 clone 뒤 같은 오류를 기록했다: Root Directory `apps/cooperative-live`가 존재하지 않음. 첫 오류는 13:34:50 KST, 두 번째 오류는 13:46:29 KST다. 앱 컴파일에 들어가기 전 디렉터리 확인에서 중단됐다.

근거: GET `/v6/deployments?projectId=prj_J4IFbF7lFg3B0nQTyl1pT16AogwR&limit=6`의 SHA·상태·생성 경로 및 두 배포의 `inspect <URL> --logs`. 실패 배포의 로그 조회 종료 코드 1은 배포 상태 ERROR와 함께 반환됐다.

## 기존 운영 주소

`inspect https://history-game-kappa-gilt.vercel.app` 결과:

- 대상: `dpl_3qXKyuxRTjAVKTBAJAyPB99hAqRS`, 상태 `Ready`, Production.
- 실제 배포: 위 표의 `6u81jjpjn`(제거 전 `a45aa75`).
- 해당 배포의 별칭: `history-game-kappa-gilt.vercel.app`, `history-game-joon0noh-3339.vercel.app`, `history-game-git-main-joon0noh-3339.vercel.app`.

따라서 실패 빌드로 운영 별칭이 실패 배포로 교체되지는 않았다. 이 확인은 배포 상태·별칭 연결 확인이며, 학생 입장·교사 인증·Convex 동작을 검증한 것은 아니다. GitHub Pages는 이번 점검 대상에 포함하지 않았다.

## 수행·검증 범위

- 실행 명령: `vercel project inspect history-game`, `vercel list history-game`, 위 두 GET API, 실패 배포 두 건의 `vercel inspect <URL> --logs`, 운영 별칭의 `vercel inspect <URL>`.
- CLI 실행에는 기존 `scripts/manual/vercel_ascii_hostname.cjs`와 `node --use-system-ca`를 사용했다. 첫 기본 CLI 조회의 `fetch failed` 이후 네트워크 승인을 받아 재조회했다.
- 로컬 확인: `git rev-parse --abbrev-ref HEAD`, `git status --short`, `git show -s --format=fuller 429d88c`, `git merge-base --is-ancestor 429d88c 7bb45b6`, `git diff 429d88c^ 429d88c --stat`, `git diff --check`.
- 이 작업의 변경 파일은 이 감사 문서 하나다. 다른 세션의 변경은 수정·stash·discard하지 않았다. 브랜치는 시작과 종료 모두 `main`이다.
- 설정 변경·환경변수 조회/변경·연결 해제·배포·재배포·push·커밋은 수행하지 않았다. 콘텐츠·코드 변경이 없어 앱 회귀 테스트는 실행하지 않았다.

## 후속 판단

현재 설정을 유지하면, 삭제된 폴더를 빌드하려는 후속 Git 배포도 같은 오류가 날 것으로 예상된다. 취소된 실시간 앱의 Git 연동을 해제할지, 실패를 감수하며 유지할지 별도로 결정해야 한다([기존 정리 계획 단계 0](../archive/plans/implementation_plan_repo_cleanup_20261016.md)). 이번 감사는 점검·기록 완료이며 이 후속 결정을 승인하거나 실행하지 않는다.
