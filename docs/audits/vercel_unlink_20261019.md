# Vercel Git 연결 해제

- 작업 claim: `TASK-20261019-VERCEL-UNLINK | Vercel Git 연결 해제 | integration agent(Codex) | 상태: DONE`
- 변경 후 검증: 2026-10-19 15:20 KST.
- 승인: 사용자 Git 연결 해제 승인(2026-10-19), 기한 2026-10-28 이전.
- 기준: `main` / `af16333`, 시작 시 작업 트리 깨끗함.
- 근거: [연동 점검](./vercel_link_check_20261019.md).

## 변경 전

- 프로젝트: `joon0noh-3339/history-game`, ID `prj_J4IFbF7lFg3B0nQTyl1pT16AogwR`.
- Git: `hasGitLink: true`, `github`, `joonssem/history_game`, Production branch `main`.
- Root Directory: `apps/cooperative-live`.
- 운영 주소 inspect: `Ready`, Production, `dpl_3qXKyuxRTjAVKTBAJAyPB99hAqRS` / `history-game-6u81jjpjn-joon0noh-3339.vercel.app`, 생성 2026-10-19 13:25:44 KST.
- 위 성공 배포의 별칭 3개: `history-game-kappa-gilt.vercel.app`, `history-game-joon0noh-3339.vercel.app`, `history-game-git-main-joon0noh-3339.vercel.app`.

## 실행·결과

Vercel CLI 61.0.0의 `api` 명령으로 Git 연결 해제 endpoint만 호출했다. 로컬에 Vercel 프로젝트 연결 파일이 없어, 별도 연결 파일을 생성하는 대신 프로젝트 ID를 직접 지정했다. 설치된 CLI의 `disconnectGitProvider` 구현(`dist/chunks/chunk-XQQGQ55A.js`)에서 `git disconnect`도 아래와 동일한 DELETE endpoint를 호출함을 먼저 확인했다.

명령의 `vc`는 다음 실행 접두부를 뜻한다(실제로는 전체 경로로 실행).

```text
node --use-system-ca --require ./scratch/vercel_ascii_hostname.cjs C:/Users/PC/AppData/Roaming/npm/node_modules/vercel/dist/vc.js
```

실행 명령:

```text
vc git disconnect --help
vc api /v9/projects/prj_J4IFbF7lFg3B0nQTyl1pT16AogwR --method GET --scope joon0noh-3339
vc inspect https://history-game-kappa-gilt.vercel.app
vc api /v9/projects/prj_J4IFbF7lFg3B0nQTyl1pT16AogwR/link --method DELETE --scope joon0noh-3339 --dangerously-skip-permissions --silent
vc api /v9/projects/prj_J4IFbF7lFg3B0nQTyl1pT16AogwR --method GET --scope joon0noh-3339
vc inspect https://history-game-kappa-gilt.vercel.app
```

- DELETE는 네트워크 실행 승인을 받아 1회 실행했으며 종료 코드 0이었다. `--dangerously-skip-permissions`는 이미 승인된 Git 연결 해제 요청에 대한 CLI 내부 확인만 생략한다. 대상은 프로젝트 자체가 아닌 `/link`다.
- GET 응답은 PowerShell `ConvertFrom-Json`으로 처리해 이름·ID·Root Directory·Git 연결 필드만 선택 출력했다. 전체 응답 및 환경변수 값은 출력·저장하지 않았다. 환경변수 endpoint는 호출하지 않았다.

## 변경 후 확인

| 확인 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 프로젝트 | `history-game` / 동일 ID | 유지 |
| Git 연결 | GitHub `joonssem/history_game`, branch `main` | `gitLink: null`, `hasGitLink: false` |
| Root Directory | `apps/cooperative-live` | 유지 |
| 운영 주소 상태 | `Ready`, Production | `Ready`, Production |
| 운영 주소의 대상 배포 | `dpl_3qXKyuxRTjAVKTBAJAyPB99hAqRS` / `6u81jjpjn` | 동일 |
| 운영 별칭 | 위 3개 | 3개 모두 동일 배포에 유지 |

확인 (a) Git 연결 정보 비어 있음과 (b) `history-game-kappa-gilt.vercel.app`의 기존 배포 Ready 유지는 통과했다. 이 검증은 Vercel 배포·별칭 상태 확인이며 앱 로그인·학생 입장 동작 테스트는 포함하지 않는다.

확인 (c) **다음 정상 push 이후 새 Git 배포가 생성되지 않는지 관찰 대기**다. 이번에는 push나 빈 커밋을 만들지 않았으므로 실증 완료로 표시하지 않는다. 이후 정상 push 담당자가 Vercel 배포 목록에서 해당 push SHA의 Git 배포가 없는지 확인한다.

## 로컬 검증·커밋 범위

- 시작과 커밋 직전 `git rev-parse --abbrev-ref HEAD`로 `main` 확인.
- `git status --short`, `git diff --cached --name-only`, `git diff --cached --check`로 문서 한 파일만 staged됐는지와 공백 오류 확인.
- `git add -- docs/audits/vercel_unlink_20261019.md` 후 해당 문서만 커밋. `git add -A` 사용 없음.
- 프로젝트 삭제·도메인/별칭 제거·환경변수 변경·재배포·push 없음. 다른 파일과 공용 엔진 수정 없음. 비밀값 기록 없음.
