# 조선 협동 활동 출처 링크 접속 점검

`TASK-20261019-CODEX-JOSEON-SOURCES | 대상: 조선 협동 활동 4편 sources | 담당 역할: audit(Codex) | 상태: DONE — Claude가 결과 반영(농사직설 직접 주소, 동학 출처 교체)`

## 범위와 방법

- 확인일: 2026-10-19, 약 13:23~13:29 KST.
- 기준: `main`, HEAD `15743fc091861dac2cb88f17648709ef4dee932f` (요청 기준 `a0ca3df`의 후손임을 `git merge-base --is-ancestor a0ca3df HEAD`로 확인).
- 요청문에는 8개로 적혀 있으나 실제 sources와 나열된 ID는 총 10개다. founding 2개, sejong 2개, wars 3개, late-change 3개 모두 점검했다.
- 각 scenario.js의 sources에서 URL을 읽어 실제 HTTPS GET을 수행했다. PowerShell `Invoke-WebRequest -UseBasicParsing -TimeoutSec 25`로 최종 HTTP 상태, 최종 URL, HTML `<title>` 및 본문 h2/h3를 추출했다. 웹 열기 도구로도 각 원본 URL의 본문을 대조했다. HTTP 수치는 검색 결과에서 추정하지 않았다.
- 모든 페이지의 HTML `<title>`은 **우리역사넷**이다. label의 주제 일치 여부는 본문 제목과 경로를 기준으로 판단했다. 사이트명 접두어, 절 번호, 한자 병기, 제목 앞뒤의 설명구는 별도로 구분했다.
- scenario.js, index.html, 생성 스크립트는 수정하거나 실행하지 않았다. PDF를 내려받거나 primary_data를 열거나 추가하지 않았다. 이 감사 문서만 작성했다.

## 전체 결과

**10개 모두 PowerShell GET의 최종 응답이 HTTP 200이며 본문을 확인했다. 다른 주제로 연결되는 오연결은 발견하지 못했다.** 다만 농사직설 단축 주소에는 요청 방식에 따른 400 응답이 추가 관찰되었다. 아래 HTTP는 리디렉션 추적 후 상태다.

label은 sources에 저장된 그대로 적었다. 활동명은 `cooperative-mud/<활동>/scenario.js`의 디렉터리명이다.

| 활동 | label | 원본 URL | HTTP | 본문 제목 | 판정 |
|---|---|---|---|---|---|
| joseon-founding | 우리역사넷 · 한양도성 | [eh_r0220_0010](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0220_0010) | 200 | 조선의 수도를 지켜온 한양도성 | 주제 일치, label은 짧은 제목 |
| joseon-founding | 우리역사넷 · 농사직설과 삼강행실도 | [eh_r0272_0010](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0272_0010&code=eh_age_30) | 200 | 조선 세종 때 편찬된 농사직설과 삼강행실도 | 주제 일치, label은 짧은 제목 |
| joseon-sejong | 우리역사넷 · 농사직설 | [mid/kc_r300270](https://contents.history.go.kr/mobile/mid/kc_r300270) | 200 (추적 후) | 농사직설 [農事直說] | 주제 일치, 직접 주소로 이동. 일부 요청에서는 400 |
| joseon-sejong | 우리역사넷 · 훈민정음의 창제와 편찬 사업 | [ta_h41_0050_0020_0020](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_h41_0050_0020_0020) | 200 | (2) 훈민정음의 창제와 편찬 사업 | 절 번호 제외 일치 |
| joseon-wars | 우리역사넷 · 왜란과 호란 | [ta_m61_0090_0030](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_m61_0090_0030) | 200 | 3. 왜란과 호란 | 절 번호 제외 일치 |
| joseon-wars | 우리역사넷 · 정묘·병자호란 | [eh_r0295_0010](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0295_0010&code=eh_age_30) | 200 | 명분과 현실 사이의 전쟁, 정묘·병자호란 | 주제 일치, label은 짧은 제목 |
| joseon-wars | 우리역사넷 · 남한산성과 삼전도비 | [eh_r0300_0010](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0300_0010&code=eh_age_30) | 200 | 병자호란의 아픔을 간직한 남한산성과 삼전도비 | 주제 일치, label은 짧은 제목 |
| joseon-late-change | 우리역사넷 · 실학의 발달 | [ta_h42_0030_0020_0010](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_h42_0030_0020_0010) | 200 | (1) 실학의 발달 | 절 번호 제외 일치 |
| joseon-late-change | 우리역사넷 · 보유론적 천주신앙의 깨우침 | [nh_035_0020_0030_0010_0050](https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_035_0020_0030_0010_0050) | 200 | (5)「보유론적 천주신앙」의 깨우침 | 절 번호·괄호 제외 일치 |
| joseon-late-change | 우리역사넷 · 동학당 | [ta_p42r_0110_0040_0070](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_p42r_0110_0040_0070) | 200 | 동학당(東學黨) | 한자 병기 제외 일치. 일제강점기 교재라는 자료 성격에 주의 |

## 접속 문제·제목 차이 및 후속 검토

주제 불일치는 없지만, 요청한 제목 차이를 빠뜨리지 않도록 설명구가 생략된 4건도 아래에 구분했다. 절 번호·한자 병기·괄호만 다른 항목은 위 표에서 확인할 수 있다.

| 활동 | label | URL | 문제 또는 차이 | 대체 후보 / 제안 |
|---|---|---|---|---|
| joseon-founding | 우리역사넷 · 한양도성 | [원본](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0220_0010) | 실제 제목 앞에 ‘조선의 수도를 지켜온’이 붙음. 접속·주제 문제 없음 | URL 유지 가능. 제목 완전 일치가 필요하면 label만 전체 제목으로 조정 |
| joseon-founding | 우리역사넷 · 농사직설과 삼강행실도 | [원본](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0272_0010&code=eh_age_30) | 실제 제목 앞에 ‘조선 세종 때 편찬된’이 붙음. 접속·주제 문제 없음 | URL 유지 가능 |
| joseon-sejong | 우리역사넷 · 농사직설 | [원본](https://contents.history.go.kr/mobile/mid/kc_r300270) | PowerShell GET은 2회 모두 최종 200, 웹 열기도 동일 직접 주소로 이동. 반면 curl 및 자동 이동을 끈 별도 .NET 요청은 400. 원인은 미확정이며 최초 이동 응답의 3xx 수치는 확정하지 않음 | [직접 주소](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_r300270) 사용 검토. 해당 URL도 GET 200·본문 제목 확인 완료 |
| joseon-wars | 우리역사넷 · 정묘·병자호란 | [원본](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0295_0010&code=eh_age_30) | 실제 제목 앞에 ‘명분과 현실 사이의 전쟁,’이 붙음. 접속·주제 문제 없음 | URL 유지 가능 |
| joseon-wars | 우리역사넷 · 남한산성과 삼전도비 | [원본](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0300_0010&code=eh_age_30) | 실제 제목 앞에 ‘병자호란의 아픔을 간직한’이 붙음. 접속·주제 문제 없음 | URL 유지 가능 |
| joseon-late-change | 우리역사넷 · 동학당 | [원본](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_p42r_0110_0040_0070) | 접속·제목은 정상. 다만 경로가 ‘역대 국사 교과서 → 일제강점기 → 심상소학국사보충교재 교수참고서 - 2’임. 학생용 일반 해설 출처로 쓸지는 별도 콘텐츠 판단 필요 | [최제우, 사람이 한울님임을 알리다](https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_n0630_0010&code=eh_age_30): 재미있는 초등역사 자료. GET 200·동명 본문 제목 확인 완료. 교체한다면 label도 해당 제목에 맞춤 |

‘동학당’ 대체 제안은 접속 장애 판정이 아니라 자료 성격에 대한 감사 의견이다. 후보는 동학의 창시, 사람을 귀하게 여기는 가르침, 평등, 확산과 탄압을 다루므로 현재 활동의 설명용 출처로 더 적절하다고 판단했다. 이는 링크된 본문에 근거한 제안이며 확정된 구현 지시가 아니다.

## 재현 및 변경 범위 검증

핵심 확인 명령(각 sources URL에 대해 반복):

```powershell
$response = Invoke-WebRequest -Uri $sourceUrl -UseBasicParsing -TimeoutSec 25
[int]$response.StatusCode
$response.BaseResponse.ResponseUri.AbsoluteUri
[regex]::Matches($response.Content, '(?is)<(?:title|h[1-6])\b[^>]*>.*?</(?:title|h[1-6])>').Value
```

- DONE 검증 명령: 위 GET을 원본 10개·직접 주소/대체 후보 2개에 수행하고, `git rev-parse --abbrev-ref HEAD`, `git status --short`, `git diff --name-only`로 변경 범위를 확인했다.
- 시작 시 `cooperative-mud/index.html`의 기존 수정과 미추적 `CONVEX_VERCEL_NOTES.md`를 확인했으며 건드리지 않았다. 점검 도중 기존 index.html 수정 표시는 사라졌다. 다른 세션/사용자의 작업 여부는 추정하지 않으며 본 작업에서는 해당 파일에 쓰기·복원·생성을 하지 않았다.
- 본 작업의 산출물은 이 문서 한 개다. 코드 변경·생성·커밋·푸시·배포는 수행하지 않았다. Claude가 이 결과를 받아 수정 및 필요시 `scripts/coop/gen_coop_activity.js` 재생성을 진행할 수 있다.
- HTTP 결과는 확인 시점과 요청 환경의 관찰이다. 학교망·물리 태블릿에서의 접속을 별도로 보장하는 검증은 아니다.
