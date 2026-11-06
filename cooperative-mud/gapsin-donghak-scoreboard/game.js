/*
 * 갑신정변과 동학농민운동 인생 게임 — 점수 규칙과 장면 데이터
 *
 * 원본: 「인생게임(임오군란,갑신정변,동학농민운동)」 PPT(159장, EPISODE 1~38)와 종이 점수표.
 * 점수·국력 대응은 슬라이드 도형의 열 좌표와 그림 개체(해골)로 확정했다. 계획: docs/plans/implementation_plan_gapsin_donghak_scoreboard.md
 * 학생이 누른 기록(log)만 저장하고 점수·신분·플래그·국력은 매번 처음부터 다시 계산(derive)한다. 화면 코드는 app.js에 있다.
 *
 * 신분(role): zh/ja 능력자 → ys 영선사 / ss 수신사 → mg 명성황후파 / hs 흥선대원군파 → on 온건 / gj 급진 개화파
 *            → nm 농민 / jb 지방 관리 → dh 동학농민군 / gg 관군   (단방향, 복귀 없음)
 * 제비뽑기 장면(draw: true): 학생이 누른 카드(기록의 p)와 실제 결과(기록의 c)가 따로 저장된다. 결과는 앱이 무작위로 정한다(?ab=ppt는 PPT 대응으로 고정).
 * ability: 처음 고른 능력(zh/ja). 끝까지 남아 일부 선택에 추가 점수(bonus)를 자동으로 붙인다.
 */
(function (root) {
  'use strict';

  var ROLE_NAME = {
    zh: '중국어 능력자', ja: '일본어 능력자', ys: '영선사', ss: '수신사', mg: '명성황후파', hs: '흥선대원군파',
    on: '온건개화파', gj: '급진개화파', nm: '농민', jb: '지방 관리', dh: '동학농민군', gg: '관군'
  };
  var ABILITY_NAME = { zh: '중국어', ja: '일본어' };
  var START_POINTS = 3000;
  var POWER_MAX = 5;
  var STORAGE_KEY = 'gapsinDonghakScoreboard.v1';
  var CHAPTERS = [
    { n: 1, from: 1, to: 6, year: '1881년' },
    { n: 2, from: 7, to: 15, year: '1882년' },
    { n: 3, from: 16, to: 21, year: '1884년' },
    { n: 4, from: 22, to: 38, year: '1894년' }
  ];
  var TOTAL_EP = 38;
  var TROPHIES = [
    { min: 3000, name: '골드 트로피', text: '인생게임의 진정한 승리자. 평생 먹고 살 수 있는 풍족한 돈이 제공됩니다.' },
    { min: 2000, name: '실버 트로피', text: '‘중간 이상’이면 잘한 것. 걱정 없는 풍족한 삶을 살고 있습니다.' },
    { min: 1000, name: '브론즈 트로피', text: '평범하지만 이 정도면 충분히 잘 살았습니다.' }
  ];

  // choice: {id,no,label,result,delta(숫자|{role:값}),bonus({ability:값}),skull,heart,role,flag,hint}
  function C(id, no, label, result, delta, extra) {
    var c = { id: id, no: no, label: label, result: result, delta: delta };
    for (var k in (extra || {})) c[k] = extra[k];
    return c;
  }

  var STEPS = [
    { id: 'e1', ep: 1, who: 'all', kind: 'choice', tag: '모두의 선택', title: '역관과 신식 군인 모집',
      cue: '길거리 방에 역관(통역, 월급 쌀 1가마니)과 신식 군인(월급 쌀 3가마니) 모집 글이 붙었어요. 어느 분야에 지원할까요?',
      choices: [C('c1', 1, '역관', '역관에 지원했습니다.', 30), C('c2', 2, '군인', '군인에 지원하려 했으나 저질 체력으로 체력검사에서 탈락했습니다. 역관이나 지원해야겠습니다.', -30)] },

    { id: 'e2zh', ep: 2, who: 'zh', kind: 'choice', tag: '중국어 능력자의 선택', title: '중국어 역관 시험',
      cue: '설명하는 인물이 누구인지 맞히는 주관식 문제예요. 정답을 적어 보고, 선생님이 정답을 알려 주면 눌러 주세요.',
      choices: [C('c1', 1, '정답', '시험에 1등으로 합격했습니다. 당신의 신분은 지금부터 <영선사>입니다.', 50, { role: 'ys' }),
        C('c2', 2, '오답', '시험에 꼴등으로 합격했습니다. 당신의 신분은 지금부터 <영선사>입니다.', 1, { role: 'ys' })] },
    { id: 'e2ja', ep: 2, who: 'ja', kind: 'choice', tag: '일본어 능력자의 선택', title: '일본어 역관 시험',
      cue: '설명하는 인물이 누구인지 맞히는 주관식 문제예요. 정답을 적어 보고, 선생님이 정답을 알려 주면 눌러 주세요.',
      choices: [C('c1', 1, '정답', '시험에 1등으로 합격했습니다. 당신의 신분은 지금부터 <수신사>입니다.', 50, { role: 'ss' }),
        C('c2', 2, '오답', '시험에 꼴등으로 합격했습니다. 당신의 신분은 지금부터 <수신사>입니다.', 1, { role: 'ss' })] },

    { id: 'e3y', ep: 3, who: 'ys', kind: 'choice', tag: '영선사의 선택', title: '청나라에서 농업기술 배우기',
      cue: '청나라 외교관이 말해요. “나한테 50point 주고 농업기술 배우겠느냐?”',
      choices: [C('c1', 1, '50point를 주고 농업기술을 배운다.', '농업기술을 획득하였습니다.', -50, { flag: 'agri' }),
        C('c2', 2, '지금 시대에는 농업기술을 배울 필요가 없다.', '농업기술을 배우지 않았습니다.', 0)] },
    { id: 'e3s', ep: 3, who: 'ss', kind: 'choice', tag: '수신사의 선택', title: '일본에서 사격기술 배우기',
      cue: '일본 외교관이 말해요. “나한테 50point 주면 사격기술을 알려준다. 어떻게 하겠는가?”',
      choices: [C('c1', 1, '50point를 주고 사격기술을 배운다.', '사격기술을 획득하였습니다.', -50, { flag: 'shoot' }),
        C('c2', 2, '군인도 아닌데 배울 필요가 없다.', '사격기술을 배우지 않았습니다.', 0)] },
    { id: 'e4', ep: 4, who: 'all', kind: 'situation', tag: '상황 발생', title: '임무를 잘 수행해 칭찬받다',
      cue: '사신의 임무 중 사정이 생겨 일찍 돌아왔지만 임무를 잘 수행해 칭찬을 받았어요. 외국에서 배운 기술과 제도를 잘 적용하면 나라가 발전할 것 같아요.',
      delta: { ys: 30, ss: 30 }, heart: 2 },
    { id: 'e5', ep: 5, who: 'all', kind: 'choice', tag: '모두의 선택', title: '상인과 농민의 부탁',
      cue: '상인 김덕팔은 외국 상인과의 거래 통역을 도우면 200point를 주겠다고 해요. 농민 전창혁은 쌀값이 올라 고통받으니 외국 상인들이 장사를 안 하고 돌아가게 도와 달라고 해요. 누구의 말을 들어줄까요?',
      choices: [C('c1', 1, '상인 김덕팔', '거래를 도와준 대가로 2000냥을 받았습니다. 하지만 쌀값이 크게 올라 농민들의 생활이 어려워졌습니다.', 200, { skull: 1 }),
        C('c2', 2, '농민 전창혁', '거래를 도와주지 않아 관리자에게 큰 벌을 받았습니다. 아직 쌀값은 오르지 않았습니다.', -200, { flag: 'helped' })] },
    { id: 'e6', ep: 6, who: 'all', kind: 'situation', tag: '상황 발생', title: '쌀값이 오르다',
      cue: '개항 이후 일본이 가져가는 쌀이 늘어 쌀값이 크게 오르고 쌀이 귀해져, 시골 가족들의 삶이 어려워졌어요.',
      delta: { ys: -30, ss: -30 }, skull: 1 },

    { id: 'e7', ep: 7, who: 'all', kind: 'choice', draw: true, tag: '모두의 선택', title: '두 사람의 제안(제비뽑기)',
      cue: '민겸호(명성황후 사촌 오빠)와 허욱(흥선대원군의 부하)이 따로 찾아와 자기 편에서 일하라고 해요. 도저히 정할 수 없어 제비뽑기로 정합니다. C와 D 중 뽑은 것을 눌러 주세요.',
      choices: [C('c1', 'C', 'C', '당신의 신분은 지금부터 <흥선대원군파>입니다. 역관 벼슬을 그만두고 실업자가 되었습니다.', -100, { role: 'hs' }),
        C('c2', 'D', 'D', '당신의 신분은 지금부터 <명성황후파>입니다. 명성황후로부터 높은 벼슬을 받았습니다.', 100, { role: 'mg' })] },
    { id: 'e8mg', ep: 8, who: 'mg', kind: 'choice', tag: '명성황후파의 선택', title: '별기군 월급 담당',
      cue: '민겸호가 별기군(일본인 교관이 훈련하는 신식 군대)의 월급을 주는 일을 맡기며 묻습니다. “일본어는 당연히 할 줄 알겠지?” 처음 캐릭터 선택에서 받은 능력으로 고르세요.',
      hint: 'ability',
      choices: [C('c1', 1, '저는 원래 일본어 능력자입니다.', '“저는 원래 일본어 능력자입니다.” 하고 대답했습니다.', 100),
        C('c2', 2, '저는 원래 중국어 능력자입니다.', '“저는 원래 중국어 능력자입니다.” 하고 대답했습니다.', -50)] },
    { id: 'e8hs', ep: 8, who: 'hs', kind: 'choice', tag: '흥선대원군파의 선택', title: '구식 군인이 되다',
      cue: '허욱이 말해요. “일단 구식 군인 임무를 맡고 있게. 통역 말고 자네가 가진 능력은 뭔가?”',
      hint: 'skills',
      choices: [C('c1', 1, '청나라에서 농업기술을 배웠다.', '농업기술이 있다고 대답했습니다.', 50),
        C('c2', 2, '일본에서 사격기술을 배웠다.', '사격기술이 있다고 대답했습니다.', 150),
        C('c3', 3, '아무런 기술이 없다.', '아무런 기술이 없다고 대답했습니다.', -100)] },
    { id: 'e9mg', ep: 9, who: 'mg', kind: 'choice', tag: '명성황후파의 선택', title: '구식 군인 쌀에 모래?',
      cue: '별기군 월급 쌀이 조금 부족해요. 민겸호 하인: “구식 군인들 쌀에 모래를 조금 섞으면 별기군에게 더 줄 수 있고, 당신에게도 쌀과 point를 더 주겠소.”',
      choices: [C('c1', 1, '구식 군인 쌀에 모래를 섞는다.', '모래를 섞고 남은 쌀을 챙겨왔습니다.', 100),
        C('c2', 2, '구식 군인 쌀에 모래를 섞지 않는다.', '민겸호 대감에게 혼이 났습니다.', -50)] },
    { id: 'e9hs', ep: 9, who: 'hs', kind: 'choice', tag: '흥선대원군파의 선택', title: '모래 섞인 쌀',
      cue: '구식 군인들에게 나눠줄 쌀에 모래가 섞여 있어요. 10개월 넘게 월급도 못 받았는데 별기군과 차별한다며 군인들이 화가 났어요. 어떻게 할까요?',
      choices: [C('c1', 1, '민겸호 대감을 찾아가 항의를 한다.', '민겸호 일당에게 매를 맞고 쫓겨났습니다.', -30),
        C('c2', 2, '민겸호 대감에게 항의하지 않고 참는다.', '화가 난 구식 군인들에게 매를 맞았습니다. 곧 폭동이 일어날 것 같습니다.', -50)] },
    { id: 'e10mg', ep: 10, who: 'mg', kind: 'choice', tag: '명성황후파의 선택', title: '돌을 던진 구식 군인들',
      cue: '화가 난 구식 군인들이 월급 담당자들에게 찾아와 돌을 던졌어요. 민겸호 대감께 뭐라고 말씀드릴까요?',
      choices: [C('c1', 1, '항의한 자들을 체포해야 합니다.', '민겸호가 체포를 명령했습니다.', 20),
        C('c2', 2, '항의한 자들을 용서하시지요.', '민겸호: “나에게 저항한 것들은 단 한 놈도 용서할 수 없다!”', -20)] },
    { id: 'e10hs', ep: 10, who: 'hs', kind: 'choice', tag: '흥선대원군파의 선택', title: '폭동, 누구에게 도움을?',
      cue: '구식 군인들이 민겸호 집에 쳐들어갔지만 대감은 도망갔어요. 궁궐까지 가려면 힘을 더 모아야 해요. 누구에게 도움을 요청할까요?',
      choices: [C('c1', 1, '흥선대원군', '대원군의 협조를 받았습니다.', 40),
        C('c2', 2, '도시 빈민들', '도시 빈민들이 합세했습니다.', 20)] },
    { id: 'e11', ep: 11, who: 'all', kind: 'choice', tag: '모두의 선택', title: '별기군 vs 구식 군인',
      cue: '구식 군인들이 관청을 습격해 무기를 빼앗고 별기군이 있는 일본 공사관에 쳐들어갔어요. 이 싸움에 참여하겠습니까?',
      choices: [C('c1', 1, '싸움에 참여한다.', '별기군이 싸움에서 졌습니다. 일본 군인들도 죽었습니다.', { hs: 100, mg: -100 }),
        C('c2', 2, '싸움에 참여하지 않는다.', '별기군이 싸움에서 졌습니다. 일본 군인들도 죽었습니다.', { hs: 50, mg: -50 })] },
    { id: 'e12', ep: 12, who: 'all', kind: 'situation', tag: '상황 발생', title: '궁궐 점령',
      cue: '구식 군인들이 궁궐을 점령했어요. 민겸호는 살해당하고 명성황후는 변장해 도망갔으며, 흥선대원군이 권력을 다시 잡았어요.',
      delta: { mg: -400, hs: 400 } },
    { id: 'e13mg', ep: 13, who: 'mg', kind: 'choice', tag: '명성황후파의 선택', title: '청나라 군대를 부를까?',
      cue: '민응식: “명성황후가 다시 권력을 잡으려면 청나라 군대에 도움을 요청해야 하네. 불러 준다면 300point를 내리겠네.” (외국 군대가 개입하면 국력이 약해질 수 있어요)',
      choices: [C('c1', 1, '청나라 군대를 요청한다.', '청나라 군대가 조선에 도착했습니다. 청나라가 앞으로 조선에 간섭하겠다고 했습니다.', 300, { skull: 1, bonus: { zh: 50 } }),
        C('c2', 2, '청나라 군대를 요청하지 않는다.', '청나라 군대를 요청하지 않았습니다.', -50)] },
    { id: 'e13hs', ep: 13, who: 'hs', kind: 'choice', tag: '흥선대원군파의 선택', title: '청나라 장군 오장경',
      cue: '청나라 장군 오장경이 흥선대원군을 만나고 싶어 해요. 흥선대원군: “청나라로 돌아가 달라고 설득해야겠네. 자네가 예전에 역관이었으니 나를 좀 도와주겠나?”',
      choices: [C('c1', 1, '흥선대원군과 함께 나간다.', '청나라 군인들이 흥선대원군을 납치해 청나라로 끌고 갔습니다.', -100),
        C('c2', 2, '위험하니 함께 나가지 않는다.', '함께 나가지 않았습니다.', -30)] },
    { id: 'e14', ep: 14, who: 'all', kind: 'situation', tag: '상황 발생', title: '임오군란 진압',
      cue: '청나라 군인들이 임오군란을 진압했어요. 흥선대원군은 청나라로 끌려가고 명성황후가 다시 권력을 잡았어요.',
      delta: { mg: 300, hs: -300 } },
    { id: 'e15', ep: 15, who: 'all', kind: 'situation', tag: '상황 발생', title: '청나라의 간섭과 배상금',
      cue: '임오군란 이후 청나라의 간섭이 심해졌어요. 일본 공사관이 피해를 입어 일본에 막대한 배상금도 지급해야 해요.',
      delta: { mg: -50, hs: -50 }, skull: 2 },

    { id: 'e16hs', ep: 16, who: 'hs', kind: 'choice', tag: '흥선대원군파의 선택', title: '인천에서 만난 두 남자',
      cue: '흥선대원군이 청나라로 잡혀가 당신은 도망자예요. 인천까지 도망왔는데 도와주겠다는 두 남자가 있어요. 누구에게 다가갈까요?',
      choices: [C('c1', 1, '왼쪽의 남자', '왼쪽의 남자(김윤식): “내가 너를 살려줄 테니 내가 시키는 대로 해야 하네.” 당신의 신분은 지금부터 <온건개화파>입니다.', 20, { role: 'on' }),
        C('c2', 2, '오른쪽의 남자', '오른쪽의 남자(김옥균): “내가 자네를 도와주겠네. 하지만 자네도 나를 도와줘야 한다네.” 당신의 신분은 지금부터 <급진개화파>입니다.', 20, { role: 'gj' })] },
    { id: 'e16mg', ep: 16, who: 'mg', kind: 'choice', draw: true, tag: '명성황후파의 선택', title: '개화 방법(제비뽑기)',
      cue: '김윤식은 “청나라의 도움을 받아 차근차근 개화”, 김옥균은 “일본처럼 빠르게 개화, 청나라 간섭에서 벗어나자”고 해요. 고종이 묻지만 누구 편인지 몰라 제비뽑기로 정합니다. E와 F 중 뽑은 것을 눌러 주세요.',
      choices: [C('c1', 'E', 'E', '당신의 신분은 지금부터 <온건개화파>입니다.', 20, { role: 'on' }),
        C('c2', 'F', 'F', '당신의 신분은 지금부터 <급진개화파>입니다.', 20, { role: 'gj' })] },
    { id: 'e17', ep: 17, who: 'all', kind: 'situation', tag: '상황 발생', title: '급진개화파가 설 자리를 잃다',
      cue: '명성황후가 청나라와 좋은 관계를 유지한 채 개화하려 해서 온건개화파의 힘이 강해지고 급진개화파는 설 자리를 잃었어요.',
      delta: { on: 50, gj: -50 } },
    { id: 'e18gj', ep: 18, who: 'gj', kind: 'choice', tag: '급진개화파의 선택', title: '일본 군인의 도움',
      cue: '김옥균: “반란을 일으켜 청나라를 따르는 무리를 몰아내려 하네. 성공하려면 일본 군인의 도움이 필요하지.” (외국 군대가 개입하면 국력이 약해질 수 있어요)',
      choices: [C('c1', 1, '일본 군인에게 도움을 요청한다.', '일본 군인이 반란을 도와주기로 약속했습니다.', 200, { skull: 1, bonus: { ja: 50 } }),
        C('c2', 2, '일본 군인에게 도움을 요청하지 않는다.', '일본 군인에게 도움을 요청하지 않았습니다.', -50)] },
    { id: 'e18on', ep: 18, who: 'on', kind: 'choice', tag: '온건개화파의 선택', title: '우정국 축하 자리',
      cue: '김윤식: “내일 조선 최초의 우체국인 우정국이 문을 연다네. 외국어 능력자인 자네도 당연히 참석해야지?”',
      choices: [C('c1', 1, '우정국 축하자리에 참석한다.', '다음날 우정국 축하자리에 가던 도중 괴한의 습격을 받고 쓰러졌습니다.', -50),
        C('c2', 2, '우정국 축하자리에 참석하지 않는다.', '우정국 축하자리에 참석하지 않았습니다.', 0)] },
    { id: 'e19', ep: 19, who: 'all', kind: 'situation', tag: '상황 발생', title: '갑신정변이 일어나다',
      cue: '우정국 개국 축하 자리에 불이 나고 온건개화파 사람들이 쓰러졌어요. 급진개화파가 일본의 힘을 빌려 정변을 일으킨 거예요. 정변은 손쉽게 성공했어요.',
      delta: { on: -300, gj: 300 } },
    { id: 'e20on', ep: 20, who: 'on', kind: 'choice', tag: '온건개화파의 선택', title: '다시 청나라 군대를?',
      cue: '고종과 명성황후는 경우궁에 피신했어요. 명성황후: “저 역적들을 잡으려면 다시 청나라 군대에 도움을 요청해야겠어. 성공하면 보답을 하겠네.” (외국 군대가 개입하면 국력이 약해질 수 있어요)',
      choices: [C('c1', 1, '청나라 군대를 요청한다.', '청나라 군대가 조선에 도착했습니다. 청나라의 간섭이 시작되었습니다.', 200, { skull: 1, bonus: { zh: 50 } }),
        C('c2', 2, '청나라 군대를 요청하지 않는다.', '청나라 군대를 요청하지 않았습니다.', -50)] },
    { id: 'e20gj', ep: 20, who: 'gj', kind: 'choice', tag: '급진개화파의 선택', title: '청나라 군대 1500명',
      cue: '정변 3일째, 1500명의 청나라 군대가 궁궐로 쳐들어왔어요. 최후 방어를 위해 도움을 요청해야 해요. 김옥균: “일본군의 도움을 약속받았었지.”',
      choices: [C('c1', 1, '일본 군인에게 도움을 요청한다.', '약속했던 일본 군인들이 배신하고 도망갔습니다. 백성들도 도와주지 않았습니다.', -100),
        C('c2', 2, '주변 백성들에게 도움을 요청한다.', '백성들은 일본과 짜고 나라를 팔아먹은 놈들 아니냐며 도와주지 않았습니다. 일본 군인들도 도망갔습니다.', -50)] },
    { id: 'e21', ep: 21, who: 'all', kind: 'situation', tag: '상황 발생', title: '3일천하',
      cue: '청나라 군대에 의해 급진개화파 정권이 3일 만에 무너졌어요. 김옥균 등 주동자들은 도망가고 명성황후와 민씨 세력이 다시 권력을 잡았어요. 갑신정변의 실패로 청나라와 일본의 간섭이 더 심해졌어요.',
      delta: { on: 300, gj: -400 }, skull: 1 },

    { id: 'e22gj', ep: 22, who: 'gj', kind: 'choice', tag: '급진개화파의 선택', title: '고부의 농사꾼(전창혁)',
      cue: '갑신정변 실패 뒤 전라북도 고부까지 도망가 농사꾼이 되었어요. 지금부터 신분은 <농민>이에요. 전창혁이 묻습니다. “얼굴이 낯이 익은데 혹시 예전에 나를 도와준 적이 있지 않소?”',
      hint: 'helped',
      choices: [C('c1', 1, '전창혁을 도와준 적이 있다.', '전창혁: “그 때의 도움은 아직도 잊지 않고 있소. 당신이 여기에 숨어살 수 있도록 도와주겠소.” (신분: 농민)', 100, { role: 'nm' }),
        C('c2', 2, '전창혁을 도와준 적이 없다.', '전창혁을 도와준 적이 없습니다. (신분: 농민)', -30, { role: 'nm' })] },
    { id: 'e22on', ep: 22, who: 'on', kind: 'choice', tag: '온건개화파의 선택', title: '조병갑을 도우러 고부로',
      cue: '정치 생활이 지긋지긋해 농촌에서 조용히 살고 싶은데, 김덕팔이 찾아와요. “조병갑이 고부 군수로 발령났는데 인재를 찾고 있소. 도와주면 200point를 주겠소.”',
      choices: [C('c1', 1, '뇌물을 받고 고부로 같이 내려간다.', '고부로 내려가 조병갑 군수를 도와주기로 했습니다. 당신의 신분은 지금부터 <지방 관리>입니다.', 200, { role: 'jb' }),
        C('c2', 2, '뇌물을 받지 않고 고부로 같이 내려간다.', '고부로 내려가 조병갑 군수를 도와주기로 했습니다. 당신의 신분은 지금부터 <지방 관리>입니다.', 0, { role: 'jb' })] },
    { id: 'e23', ep: 23, who: 'all', kind: 'situation', tag: '상황 발생', title: '새 군수에게 세금',
      cue: '조병갑 군수님이 고부 마을에 새로 오셨어요. 농민들은 군수님께 세금 100point를 납부하세요.',
      delta: { nm: -100, jb: 30 } },
    { id: 'e24jb', ep: 24, who: 'jb', kind: 'choice', tag: '지방 관리의 선택', title: '저수지를 만드는 기술',
      cue: '조병갑: “요즘 가뭄이 들어 마을에 큰 저수지를 만들려고 하오. 저수지를 만드는 농업 기술을 알고 있소?”',
      hint: 'agri',
      choices: [C('c1', 1, '청나라에서 농업기술을 배운 적이 있다.', '저수지 만드는 기술이 쓰였습니다.', 100),
        C('c2', 2, '청나라에서 농업기술을 배운 적이 없다.', '농업기술을 배운 적이 없습니다.', -20)] },
    { id: 'e24nm', ep: 24, who: 'nm', kind: 'choice', tag: '농민의 선택', title: '전봉준과 동학',
      cue: '전창혁이 아들 전봉준을 소개해요. “‘사람이 곧 하늘’이며 곧 새로운 세상이 열릴 거라 믿소. 당신도 동학을 믿어 보지 않겠소?”',
      choices: [C('c1', 1, '동학을 믿는다', '동학신도가 된 뒤 전봉준과 더 좋은 관계를 맺게 되었습니다.', 50),
        C('c2', 2, '동학을 믿지 않는다', '동학을 믿지 않았습니다.', 0)] },
    { id: 'e25', ep: 25, who: 'all', kind: 'situation', tag: '상황 발생', title: '저수지 완성, 또 세금',
      cue: '마을 사람들이 힘을 합친 끝에 새로운 저수지가 만들어졌어요. 농민들은 군수님께 세금 100point를 납부하세요.',
      delta: { nm: -100, jb: 30 } },
    { id: 'e26jb', ep: 26, who: 'jb', kind: 'choice', tag: '지방 관리의 선택', title: '만석보 물 사용료',
      cue: '저수지 이름은 ‘만석보’. 조병갑: “농민들이 쓸 때마다 물 사용료 300point씩 걷겠소.” 이방은 월급도 안 주고 사용료까지 걷으면 불만이 가득할 거라고 말려요. 조병갑에게 뭐라고 조언할까요?',
      choices: [C('c1', 1, '물 사용료를 걷으려는 조병갑을 말린다.', '조병갑: “당신도 좀 닥쳐줄래? 물 사용료는 무조건 걷을거임.”', -50),
        C('c2', 2, '조병갑을 도와 물 사용료를 걷는다.', '조병갑을 도와 물 사용료를 걷었습니다.', 50)] },
    { id: 'e26nm', ep: 26, who: 'nm', kind: 'choice', tag: '농민의 선택', title: '세금을 없애 달라는 항의',
      cue: '세금도 많은데 저수지 물 사용료까지 내라니 어이가 없어요. 전창혁이 군수님께 세금을 없애 달라고 말하러 가려 해요. (지금까지 인생경험으로 봤을 때 항의해봤자 매만 맞을 텐데…)',
      choices: [C('c1', 1, '전창혁 어르신과 함께 가서 항의한다.', '조병갑에게 매를 맞고 쫓겨났습니다.', -50),
        C('c2', 2, '전창혁 어르신을 말린다.', '농민들이 어쩔 수 없이 물 사용료를 내고 있습니다.', -30)] },
    { id: 'e27', ep: 27, who: 'all', kind: 'situation', tag: '상황 발생', title: '물 사용료',
      cue: '농민들은 어서어서 군수님께 물 사용료를 내세요.',
      delta: { nm: -300, jb: 30 } },
    { id: 'e28', ep: 28, who: 'all', kind: 'situation', tag: '상황 발생', title: '군수님 아버지의 비석 세금',
      cue: '군수님의 아버지를 기리는 비석을 세우려고 농민들에게 세금 200point를 걷어요.',
      delta: { nm: -200, jb: 30 } },
    { id: 'e29jb', ep: 29, who: 'jb', kind: 'choice', tag: '지방 관리의 선택', title: '전창혁에게 곤장',
      cue: '전창혁이 세금을 없애 달라고 다시 찾아왔어요. 조병갑: “저 사람이 다시는 못 오게 크게 혼내 주시오. 그럼 내 point를 많이 나눠 주겠소.”',
      choices: [C('c1', 1, '전창혁씨에게 곤장을 쎄게! 때린다.', '전창혁씨가 곤장을 계속 맞다가 결국 사망하였습니다.', 100),
        C('c2', 2, '전창혁씨에게 곤장을 살짝! 때린다.', '전창혁씨에게 곤장을 살짝 때렸습니다.', 10)] },
    { id: 'e29nm', ep: 29, who: 'nm', kind: 'choice', tag: '농민의 선택', title: '고부 관아로!',
      cue: '전창혁이 사망하자 농민들이 분노해요. 전봉준: “탐관오리 조병갑의 횡포를 더 이상 참을 수 없다. 고부 관아로 쳐들어가자!”',
      choices: [C('c1', 1, '농민 봉기에 참여한다.', '고부 관아를 습격하는 데 성공했습니다. 관아의 쌀을 농민들에게 나누어 주었지만 조병갑은 이미 도망간 뒤였습니다.', 100),
        C('c2', 2, '농민 봉기에 참여하지 않는다.', '농민 봉기에 참여하지 않았습니다.', 0)] },
    { id: 'e30jb', ep: 30, who: 'jb', kind: 'choice', tag: '지방 관리의 선택', title: '이용태에게 보고',
      cue: '농민들의 불만을 잠재우려고 한양에서 ‘이용태’가 고부에 내려왔어요. 이용태에게 뭐라고 말씀드릴까요?',
      choices: [C('c1', 1, '힘들어하는 농민들을 달래주십시오.', '이용태: “무슨 소리야? 이놈들은 다 반란군이야~ 동학과 관련된 놈들은 모조리 잡아들여라!”', -50),
        C('c2', 2, '관아를 습격한 농민들을 혼내줘야 합니다.', '이용태가 동학과 관련된 사람들을 모조리 잡아들이라고 했습니다.', 50)] },
    { id: 'e30nm', ep: 30, who: 'nm', kind: 'choice', tag: '농민의 선택', title: '총을 쓸 줄 아는 사람?',
      cue: '전봉준이 전국의 동학 농민을 모아 봉기를 일으키려 해요. 김개남: “무기를 다룰 수 있어야 하는데 우리는 총을 써본 적이 없소. 누구 총을 쓸 줄 아는 사람 없는가?”',
      hint: 'shoot',
      choices: [C('c1', 1, '일본에서 사격기술을 배운 적이 있다.', '총 쓰는 법을 알려 주었습니다.', 100),
        C('c2', 2, '일본에서 사격기술을 배운 적이 없다.', '사격기술이 없습니다.', 0)] },
    { id: 'e31', ep: 31, who: 'all', kind: 'situation', tag: '상황 발생', title: '백산 봉기, 전주까지',
      cue: '전라도 백산에서 수천 명의 농민이 봉기했어요. 동학농민군은 고부에서 관군을 무찌르고 전주까지 진격해요. 농민은 <동학농민군>이, 지방 관리는 <관군>이 되어요.',
      delta: { nm: 300, jb: -400 }, setRole: { nm: 'dh', jb: 'gg' } },
    { id: 'e32gg', ep: 32, who: 'gg', kind: 'choice', tag: '관군의 선택', title: '또 청나라 군대를?',
      cue: '한양까지 도망온 당신은 관군이 되어 동학농민군을 막아야 해요. 명성황후 부하: “역관 출신이라며? 청나라 군대에 도움을 요청해 주시오. 성공하면 500point를 주겠소.” (외국 군대가 개입하면 국력이 약해질 수 있어요)',
      choices: [C('c1', 1, '청나라 군을 요청한다.', '청나라 군대가 조선에 도착했습니다. 청나라의 간섭이 시작되었습니다.', 500, { skull: 1, bonus: { zh: 50 } }),
        C('c2', 2, '청나라 군을 요청하지 않는다.', '청나라 군을 요청하지 않았습니다.', -100)] },
    { id: 'e32dh', ep: 32, who: 'dh', kind: 'choice', tag: '동학농민군의 선택', title: '전주성을 점령하고',
      cue: '동학농민군이 전주성을 점령했는데, 조정이 청나라에 도움을 요청했다는 소식이에요. 청나라가 오면 일본도 들어올 거예요. 전봉준에게 어떻게 조언하겠습니까?',
      choices: [C('c1', 1, '여기서 싸움을 멈춰야 합니다.', '전봉준: “우리가 원하는 건 백성을 구하는 것이지 외국세력을 끌어들이는 것이 아니오. 싸움을 여기서 멈춥시다.”', 50),
        C('c2', 2, '여기서 싸움을 멈출 수는 없습니다.', '싸움을 멈출 수 없다고 조언했습니다.', -50)] },
    { id: 'e33', ep: 33, who: 'all', kind: 'situation', tag: '상황 발생', title: '전주화약',
      cue: '조선 조정과 동학농민군이 싸움을 멈추고 화목하게 지내자는 약속(화약)을 맺었어요. 더 이상 백성들이 전쟁으로 희생되는 일이 없을 것 같아요.',
      delta: { gg: 50, dh: 50 }, heart: 1 },
    { id: 'e34', ep: 34, who: 'all', kind: 'choice', tag: '모두의 선택', title: '군대를 돌려보내 달라고',
      cue: '동학농민군과 화해했으니 조선에 들어온 청나라와 일본 군대에게 돌아가 달라고 요구해야 해요. 어느 나라를 먼저 설득할까요?',
      choices: [C('c1', 1, '청나라', '두 나라 모두 거부했습니다.', -50, { bonus: { zh: -50 } }),
        C('c2', 2, '일본', '두 나라 모두 거부했습니다.', -50, { bonus: { ja: -50 } })] },
    { id: 'e35', ep: 35, who: 'all', kind: 'situation', tag: '상황 발생', title: '청일전쟁',
      cue: '일본이 경복궁을 점령하고 조선 땅에서 청나라와 전쟁을 벌였어요(청일전쟁). 일본이 승리해 조선의 정치에 간섭하기 시작했고 백성들이 많은 피해를 입었어요.',
      delta: { gg: -50, dh: -50 }, skull: 1 },
    { id: 'e36dh', ep: 36, who: 'dh', kind: 'choice', tag: '동학농민군의 선택', title: '다시 봉기할까?',
      cue: '전봉준 부하: “일본이 조선을 침략하려 합니다. 일본을 몰아내려면 다시 봉기를 일으켜야 합니다!” 전봉준에게 어떻게 조언하겠습니까?',
      choices: [C('c1', 1, '일본에 맞서 다시 봉기를 일으켜야 합니다.', '전봉준: “일본의 국권 침탈 행위를 용서할 수 없네. 다시 한번 힘을 모아보세!” 동학농민군의 봉기가 다시 시작되었습니다.', 30),
        C('c2', 2, '여기서 다시 싸움을 일으킬 수는 없습니다.', '다시 싸움을 일으킬 수 없다고 조언했습니다.', -30)] },
    { id: 'e36gg', ep: 36, who: 'gg', kind: 'choice', tag: '관군의 선택', title: '다시 진압할까?',
      cue: '명성황후 신하: “동학농민군이 일본군을 물리친다는 핑계로 다시 봉기한다고 합니다. 일본군과 힘을 합쳐 진압하도록 허락해 주십시오.” 명성황후에게 어떻게 조언하겠습니까?',
      choices: [C('c1', 1, '동학농민군과 다시 싸워야 합니다.', '관군의 진압이 다시 시작되었습니다.', 30),
        C('c2', 2, '여기서 다시 싸움을 일으킬 수는 없습니다.', '다시 싸움을 일으킬 수 없다고 조언했습니다.', -30)] },
    { id: 'e37', ep: 37, who: 'all', kind: 'situation', tag: '상황 발생', title: '우금치 전투',
      cue: '동학농민군 vs 관군+일본군 전투가 벌어졌어요. 숫자가 많은 동학농민군이지만 최신식 무기를 가진 일본군의 상대가 되지 않아, 우금치 전투에서 크게 패배하고 뿔뿔이 흩어졌어요. 동학농민운동은 결국 실패했어요.',
      delta: { gg: 300, dh: -300 } },
    { id: 'e38dh', ep: 38, who: 'dh', kind: 'choice', final: true, tag: '동학농민군의 마지막 선택', title: '일본군에게 잡히다',
      cue: '전투에서 패배해 전봉준과 함께 일본군의 포로가 되었어요. 일본 군인 대장: “일본에 협조하면 목숨을 살려주고 새로운 생활을 하도록 2000point를 주겠다.” 협조하지 않으면 가진 인생 포인트를 잃을 수 있고, 협조하면 조선의 기밀을 일본에 빼앗겨요.',
      choices: [C('c1', 1, '일본에 협조한다.', '일본에 협조하여 목숨을 구할 수 있었습니다.', 2000, { skull: 2 }),
        C('c2', 2, '일본에 협조하지 않는다.', '당신과 전봉준의 희생 정신을 보고 많은 청년들의 애국심이 불타올랐습니다. “우리는 반드시 의병을 만들어 일본에 저항하겠습니다!”', -3000, { heart: 3 })] },
    { id: 'e38gg', ep: 38, who: 'gg', kind: 'choice', final: true, tag: '관군의 마지막 선택', title: '황해도의 19살 대장',
      cue: '동학농민군을 거의 다 진압했어요. 황해도 관찰사: “붙잡은 동학농민군을 모두 사형시키라는 어명이오. 대장부터 잡아 가두시오.” 대장은 19살 청년이에요. 안태훈 진사는 살려 주고 싶어 해요. 명령을 어기면 큰 벌을 받을 수 있어요.',
      choices: [C('c1', 1, '대장 청년을 체포한다.', '나라의 아까운 인재가 사라졌습니다.', 500, { skull: 2 }),
        C('c2', 2, '대장 청년을 몰래 풀어준다.', '명령을 어겨 미움을 받게 되었습니다. 풀려난 청년은 김창수(훗날 김구), 안태훈의 아들은 안중근이었습니다.', -1500, { heart: 3 })] }
  ];

  function resolveDelta(spec, role) {
    if (typeof spec === 'number') return spec;
    if (spec && typeof spec === 'object' && typeof spec[role] === 'number') return spec[role];
    return 0;
  }
  function stepById(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return STEPS[i]; return null; }
  function stepIndex(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i; return -1; }
  function cardOf(step, p) {
    for (var i = 0; i < step.choices.length; i++) if (String(step.choices[i].no) === String(p)) return String(step.choices[i].no);
    return null;
  }
  function choiceById(step, id) { for (var i = 0; i < step.choices.length; i++) if (step.choices[i].id === id) return step.choices[i]; return null; }

  function applies(step, d) {
    if (!d.role) return false;
    if (step.who === 'all') return true;
    return Array.isArray(step.who) ? step.who.indexOf(d.role) !== -1 : step.who === d.role;
  }

  function empty() { return { role: null, ability: null, points: 0, flags: {}, skull: 0, heart: 0, rows: [], cursor: -1, finished: false }; }

  // log → 현재 상태. 잘못된 항목은 건너뛴다(저장소 손상 대비).
  function derive(log) {
    var d = empty();
    (log || []).forEach(function (e, n) {
      if (!e || typeof e !== 'object') return;
      var row = { n: n, s: e.s, c: e.c, role: d.role, delta: 0, bonus: 0, bonusNote: '', skull: 0, heart: 0, total: 0, label: '', choiceLabel: '', no: null, result: '', ep: null, tag: '', roleAfter: null };
      if (e.s === 'start') {
        if (d.role || !ABILITY_NAME[e.c]) return;
        d.role = e.c; d.ability = e.c; row.role = e.c;
        row.delta = START_POINTS; row.label = '게임 시작'; row.choiceLabel = ROLE_NAME[e.c]; row.result = '처음 포인트를 받았습니다.';
      } else if (e.s === 'manual') {
        if (!d.role || typeof e.delta !== 'number' || !isFinite(e.delta)) return;
        row.delta = Math.round(e.delta); row.label = '점수 가감'; row.choiceLabel = String(e.memo || '선생님이 알려 준 점수');
      } else {
        var step = stepById(e.s);
        if (!step || !d.role) return;
        row.ep = step.ep; row.label = step.title; row.tag = step.tag;
        var spec;
        if (step.kind === 'situation') {
          row.delta = resolveDelta(step.delta, d.role); row.choiceLabel = '선택 없음'; row.result = step.cue;
          row.skull = step.skull || 0; row.heart = step.heart || 0;
          if (step.setRole && step.setRole[d.role]) d.role = step.setRole[d.role];
        } else {
          var ch = choiceById(step, e.c);
          if (!ch) return;
          row.delta = resolveDelta(ch.delta, d.role); row.choiceLabel = ch.label; row.no = ch.no; row.result = ch.result;
          var pickedCard = step.draw && e.p != null ? cardOf(step, e.p) : null;   // 제비뽑기: 누른 카드는 점수표의 '나의 선택'에 남긴다
          if (pickedCard) { row.no = pickedCard; row.choiceLabel = pickedCard + ' 카드'; row.picked = pickedCard; }
          row.skull = ch.skull || 0; row.heart = ch.heart || 0;
          if (ch.bonus && typeof ch.bonus[d.ability] === 'number') {
            row.bonus = ch.bonus[d.ability];
            row.bonusNote = '원래 ' + ABILITY_NAME[d.ability] + ' 능력자 추가 ' + (row.bonus > 0 ? '+' : '−') + Math.abs(row.bonus);
          }
          if (ch.flag) d.flags[ch.flag] = true;
          if (ch.role) d.role = ch.role;
          if (step.final) d.finished = true;
        }
        row.roleAfter = d.role;
        d.cursor = Math.max(d.cursor, stepIndex(step.id));
      }
      row.delta += row.bonus;
      d.points += row.delta; d.skull += row.skull; d.heart += row.heart;
      row.total = d.points;
      d.rows.push(row);
    });
    return d;
  }

  function nextStep(d) {
    if (!d.role || d.finished) return null;
    for (var i = d.cursor + 1; i < STEPS.length; i++) if (applies(STEPS[i], d)) return STEPS[i];
    return null;
  }

  function trophy(points) {
    for (var i = 0; i < TROPHIES.length; i++) if (points >= TROPHIES[i].min) return TROPHIES[i];
    return null;
  }

  var api = {
    STEPS: STEPS, ROLE_NAME: ROLE_NAME, ABILITY_NAME: ABILITY_NAME, START_POINTS: START_POINTS, POWER_MAX: POWER_MAX,
    STORAGE_KEY: STORAGE_KEY, CHAPTERS: CHAPTERS, TOTAL_EP: TOTAL_EP, TROPHIES: TROPHIES,
    resolveDelta: resolveDelta, stepById: stepById, applies: applies, derive: derive, nextStep: nextStep, trophy: trophy
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GapsinBoard = api;
})(typeof window !== 'undefined' ? window : this);
