# Claude Code 전달 메시지

다음 중간 점검 묶음을 진행해 주세요.

1. `regular_korean_war:3-1`, `regular_joseon_diplomacy:1-1/2-1/3-1`, `regular_independence_army:3-1`, `regular_goryeo_culture:1-1`의 IF 스테이지를 최종 검토해 주세요. 문구는 수정하지 말고, 자료 비교 연결·사실성·초등학생 적합성·정서 안전성·출처 범위를 단계별로 판정해 주세요.

2. `data/mud/regular_sejong.json`의 2단계 simulator에 있는 중복 `instruction`·`feedback` 키를 재확인해 주세요. 현재 파서가 사용하는 값, 유지할 값, 삭제할 중복, 영향 범위를 표로 제시해 주세요. 2-1·3·3-1에 같은 문제가 없는지도 확인해 주세요. 사용자 승인 전에는 수정하지 마세요.

3. `BACKLOG.md`, `project_context.md`, 관련 implementation plan, `DECISIONS.md`, `walkthrough.md`를 실제 코드·데이터·최근 커밋과 대조해 완료/진행/검토 대기 상태의 불일치를 정리해 주세요. 문서 내용은 직접 수정하지 말고, 파일명·현재 문장·실제 상태·권장 수정안을 보고해 주세요.

결과는 지시서 `claude_code_next_review_instruction.md`의 A/B/C 표 형식으로 작성해 주세요. 이번 작업에서는 JSON·JS·Codex 소유 문서를 수정하지 말고, 커밋·push 없이 보고서만 제출해 주세요.
