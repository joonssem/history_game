# 🤖 AI 에이전트 협업 체계 (agents.md)

> 본 프로젝트는 기획/점검 전담 에이전트와 실행/코딩 전담 에이전트가 역할을 분담하는 **듀얼 에이전트 체계**로 개발되었습니다.

---

## 🧠 에이전트 역할 분담

### 기획·점검 에이전트 (Gemini 3.1 Pro / Claude Sonnet)

**역할**: 프로젝트 전체의 리드 사이언티스트 및 기술 오너 (Lead Scientist & Technical Owner)

**담당 업무**:
- 전체 커리큘럼(48차시)과 MUD 시나리오 간 정합성 점검
- 교육적 관점에서의 콘텐츠 품질 기획 및 승인
- 구현 계획서(implementation_plan_*.md) 작성 및 사용자 승인 요청
- 완료된 작업에 대한 전수조사·보고·검증
- 에이전트 전환 기준 명시 및 지시

**판단 기준**:
- 교과서(5학년 2학기 사회) 교육과정과의 연계 타당성
- 초등학생 학습 경험의 흥미도 및 교육적 효과
- 시스템 전체 구조의 완결성 및 확장 가능성

---

### 실행·코딩 에이전트 (Gemini 3.7 Flash)

**역할**: 고속 코드 생성 및 데이터 파이프라인 실행

**담당 업무**:
- MUD 시나리오 JSON 파일 대량 생성 (data/mud/*.json)
- js/app.js, js/mudEngine.js, js/mudSimulators.js, js/encyclopedia.js 코드 수정
- 파이썬 스크립트 작성 및 실행 (데이터 생성·검증·일괄 변환)
- 
ode -c 문법 검사 및 alidate_all_json.py 전수 검증
- GitHub 커밋 및 GitHub Pages 배포

**작업 원칙**:
- 다중 줄 인라인 파이썬 스크립트 금지 → 반드시 .py 파일로 저장 후 실행
- 기존 파일 덮어쓰기 전 반드시 원본 확인
- 매 완료 시점에 walkthrough.md 업데이트

---

## 🔄 에이전트 전환 기준

| 상황 | 전환 방향 |
|---|---|
| 작업 완료 후 점검 필요 | Flash → **Pro** |
| 기획 승인 완료 후 실행 필요 | Pro → **Flash** |
| 대규모 버그 발견 및 전략 수정 필요 | Flash → **Pro** |
| 단순 파일 수정 or 소규모 패치 | 현재 모델 유지 |

---

## 📂 에이전트 관련 산출 파일

| 파일 | 담당 에이전트 | 설명 |
|---|---|---|
| implementation_plan_*.md | Pro | 기획 단계별 구현 계획서 |
| 	asks_*.md | Pro/Flash | 실행 체크리스트 |
| walkthrough.md | Flash | 완료된 작업의 기술적 누적 기록 |
| simulator_audit_report.md | Pro | 전수조사 기반 버그 보고서 |
| scratch/*.py | Flash | 데이터 생성·검증·패치 스크립트 |

---

## 📋 현재까지 진행된 Phase 요약

| Phase | 담당 | 주요 내용 |
|---|---|---|
| Phase 1 | Flash | MUD 엔진 리팩토링 (하드코딩 → JSON 기반) |
| Phase 2 | Flash | 1계층 Regular MUD 13종 초기 구축 |
| Phase 3 | Flash | Deep-dive MUD 4종 (선사/삼국/조선/근현대) |
| Phase 4 | Flash | 핵심 공백 차시 3종 추가 (세종·3·1운동·6·25) |
| Phase 5 | Flash | 수집형 국보 유물 도감 시스템 구축 |
| Phase 6 | Flash | 공백 차시 보충 5종 (고려/조선/개항/의병) |
| Track 1 | Flash | 본문 차시 100% 완결 신규 7종 추가 |
| Track 2 | Flash | 인터랙티브 시뮬레이터 역사 맥락 일치화 |
| Hotfix | Flash | 구형 MUD 시뮬레이터 전수 정상화 (12종) |
