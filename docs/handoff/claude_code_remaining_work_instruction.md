# Claude Code 후속 작업 지시서 — 남은 장면·브라우저 점검

## 현재까지 완료된 사항

- Phase 38 근현대 scene 15개 구현·회귀 검증 완료
- `regular_japanese_rule_2` 1~3단계 민감 역사 내용 교차 검증 완료
- 유물 아이콘 7종 및 MUD 보상 토스트 수정 완료
- IF 스테이지 6개 사용자 승인 완료
- `regular_sejong` 2·3단계 중복 simulator 키 정리 완료

## 이번 작업 범위

구현보다 **장면·브라우저 최종 점검과 보고**를 수행한다.

### 1. Phase 38 장면 최종 회귀

다음 15개 scene을 모바일 세로형 viewport에서 확인한다.

- `independence` 1~3
- `japanese_rule_1` 1~3
- `japanese_rule_2` 1~3
- `modern_open` 1~3
- `post_war` 1~3

확인 항목:

- 캔버스가 비어 있지 않은가
- 상단 UI·핫스팟·라벨이 겹치지 않는가
- 글자·버튼·진행 카운터가 잘리지 않는가
- 장면의 역사 맥락과 학습 문구가 일치하는가
- 민감 주제에서 군인·무기·전투·피해 재현이 없는가
- 터치 대체 버튼과 캔버스 단서 상태가 동기화되는가

### 2. 대표 기존 장면 회귀

다음 장면을 최소 1회씩 확인한다.

- `gaya-ironware`
- `goryeo-tripitaka-carving`
- `sejong-evidence`
- `joseon-founding-evidence`
- `korean-war-armistice`
- `unified-silla-seokguram`

### 3. 브라우저 오류 확인

- 콘솔 오류 0건
- 서버 오류 0건
- 빈 캔버스 0건
- `setLineDash` 상태 복원
- scene JSON↔JS 누락·중복 0건

## 변경 제한

- 이번 점검에서는 JSON·JS·scene·hotspots·interaction·completion을 수정하지 않는다.
- IF 문구, 민감 역사 glossary, 유물 아이콘, 세종 simulator 문구를 수정하지 않는다.
- 문제가 발견되면 임의 수정하지 말고 파일명·단계·화면·원인·수정 제안만 보고한다.
- 브라우저 확인이 불가능하면 환경과 미실행 항목을 명시한다.

## 결과 보고 형식

| 대상 | 화면 확인 | 상호작용 | 콘텐츠 적합성 | 문제 | 조치 |
|---|---|---|---|---|---|

보고서에는 viewport, URL, 확인한 scene 수, 콘솔·서버 결과, 스크린샷 여부를 포함한다.

커밋·push는 하지 않고 결과만 Codex에 전달한다.
