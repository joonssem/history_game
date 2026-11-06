/*
 * 인생 게임 외전 「암살 — 나라를 되찾기 위한 노력」 — 독립자금 규칙과 장면 데이터
 *
 * 원본: 「인생게임 외전 -암살.pptx」(104장, EPISODE 1~33)와 종이 점수표. 계획: docs/plans/implementation_plan_assassination_scoreboard.md
 * 점수 대응은 슬라이드 도형의 열·행 좌표로 확정했다. 학생이 입력한 기록(log)만 저장하고 자금·위치·장비는 매번 처음부터 다시 계산(derive)한다.
 *
 * 장면 종류: choice(객관식) · situation(상황 발생) · move(지역 이동, 비용) · quiz(주관식: numbers/texts/text/boxes) · final(에피소드 33)
 * 신분은 없다(모두 같은 신분). 장비 4종(권총·소총·콧수염·망원경)은 플래그로 두고 일부 퍼즐의 입력 상한에 쓴다.
 */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'assassinationScoreboard.v1';
  var START_CITY = '경성';
  var TOTAL_EP = 33;
  var CHAPTERS = [
    { n: 1, from: 1, to: 12, year: '1910년대' },
    { n: 2, from: 13, to: 21, year: '1920년대' },
    { n: 3, from: 22, to: 33, year: '1930년대' }
  ];
  var WEAPONS = [
    { id: 'pistol', name: '마우저 권총' },
    { id: 'rifle', name: 'M1 개런드 소총' },
    { id: 'mustache', name: '일본인 콧수염' },
    { id: 'telescope', name: '나시카 망원경' }
  ];
  // 에피소드 33 종이표의 독립운동가 명언 빈칸
  var QUOTES = [
    { id: 'q1', who: '이회영', text: '삶과 (　)은 다같이 인생의 일면인데 (　)을 두려워해 가지고 무슨 일을 하겠는가', answer: '죽음' },
    { id: 'q2', who: '김좌진', text: '삼천리 금수강산에 (　)이 웬 말인가. 아픈 마음 쓸어버릴 길이 없구나.', answer: '왜놈' },
    { id: 'q3', who: '신채호', text: '(　)를 잊은 민족은 다시 살아날 수 없다.', answer: '역사' },
    { id: 'q4', who: '윤봉길', text: '(　)은 머지않아 꼭 실현되리라 믿어 의심치 않으며 대한 남아로서 할 일을 하고 미련 없이 떠나가오.', answer: '독립' }
  ];
  var EVALS = [
    { id: 'c1', label: '진지하게 의미를 담아 멋진 명언을 작성했다.', result: '독립운동 유공 표창 수여' },
    { id: 'c2', label: '조금 밋밋하지만 나름 잘 작성했다.', result: '독립운동 상장 수여' },
    { id: 'c3', label: '아무런 고민 없이 대충 작성했다.', result: '독립운동 명단 탈락' }
  ];

  function C(id, no, label, result, delta, extra) {
    var c = { id: id, no: no, label: label, result: result, delta: delta };
    for (var k in (extra || {})) c[k] = extra[k];
    return c;
  }

  var STEPS = [
    { id: 'e1', ep: 1, kind: 'choice', tag: '객관식 선택', title: '독립운동에 참여할까?',
      cue: '일제에 나라를 빼앗긴 뒤 많은 사람들이 절망과 분노에 차 있어요. 나라를 되찾기 위해 독립운동에 참여하겠습니까? 아니면 포기하고 일제에 협력하며 살겠습니까?',
      choices: [C('c1', 1, '독립운동에 참여한다.', '독립운동에 참여하기로 했습니다.', 30),
        C('c2', 2, '일제에 협력하며 살아간다.', '“눼눼~ 잘 먹고 잘 사세요.” GAME OVER (게임 참여 불가)', 10000, { end: true })] },
    { id: 'e2', ep: 2, kind: 'situation', tag: '상황 발생', title: '이회영 선생님을 만나라',
      cue: '독립운동가 염선생님이 말해요. “조선 최고의 부자 이회영 선생님이 독립운동을 위해 전 재산을 처분하고 만주로 갔다고 하네. 만주로 가서 이회영 선생님을 만나게.”', delta: 10 },
    { id: 'e3', ep: 3, kind: 'move', tag: '지역 이동', title: '경성에서 만주로', cue: '경성에서 만주까지 이동했습니다. 독립자금 8원을 지불하였습니다.', from: '경성', to: '만주', cost: 8 },
    { id: 'e4', ep: 4, kind: 'choice', tag: '객관식 선택', title: '진짜 이회영 선생님은?',
      cue: '만주 신흥무관학교에서 이동녕이 말해요. “이회영 선생님을 만나고 싶다고? 그렇다면 이 중 진짜 이회영 선생님이 누구인지 맞춰보게.” (TV의 사진 4장을 보고 고르세요)',
      choices: [C('c1', 1, '1번 사진', '오답입니다. (홍범도)', -5), C('c2', 2, '2번 사진', '오답입니다. (김좌진)', -5),
        C('c3', 3, '3번 사진', '오답입니다. (안중근)', -5), C('c4', 4, '4번 사진', '정답입니다. (이회영)', 5)] },
    { id: 'e5', ep: 5, kind: 'choice', tag: '객관식 선택', title: '신흥무관학교 사격 TEST',
      cue: '이회영: “사격 테스트에 통과하면 신흥무관학교 입학을 허락해 주겠네.” 과녁이 있어요. 어느 방향으로 총을 쏘시겠습니까? (TV의 식을 계산해 보세요)',
      choices: [C('c1', 1, '4시 방향', '명중! 신흥무관학교에 입학했습니다.', 5), C('c2', 2, '7시 방향', '명중! 신흥무관학교에 입학했습니다.', 2),
        C('c3', 3, '5시 방향', '명중! 신흥무관학교에 입학했습니다.', 3), C('c4', 4, '3시 방향', '명중! 신흥무관학교에 입학했습니다.', 1)] },
    { id: 'e6', ep: 6, kind: 'situation', tag: '상황 발생', title: '친일파 암살요원 임명', flag: 'pistol',
      cue: '이회영: “자네는 사격실력이 아주 뛰어나구만. 자네를 <친일파 암살요원>으로 임명하겠네. 여기 돈과 권총을 받게나.” (마우저 권총 획득)', delta: 50 },
    { id: 'e7', ep: 7, kind: 'move', tag: '지역 이동', title: '만주에서 경성으로',
      cue: '하시모토를 암살하기 위해 만주에서 경성으로 다시 이동했습니다. 교통비 5원이 들었습니다.', from: '만주', to: '경성', cost: 5 },
    { id: 'e8', ep: 8, kind: 'choice', tag: '객관식 선택', title: '일본어로 된 토지 문서',
      cue: '농부 김규민: “일본인들이 토지조사사업을 한다고 이런 문서를 줬는데 일본어라서 무슨 뜻인지 모르겠습니다. 무엇을 선택해야 하나요?” 일본어를 모르기 때문에 찍어야 해요.',
      choices: [C('c1', 1, '1번', '땅을 뺏겼습니다.', -20), C('c2', 2, '2번', '땅을 뺏겼습니다.', -20), C('c3', 3, '3번', '땅을 뺏겼습니다.', -20)] },
    { id: 'e9', ep: 9, kind: 'choice', tag: '객관식 선택', title: '곤장 맞는 김규민',
      cue: '땅을 뺏긴 김규민씨가 항의하다가 잡혀가 일본 헌병에게 곤장을 맞고 있어요. “조센징 놈아!!! 곤장이나 쳐 맞아라!!!”',
      choices: [C('c1', 1, '모른체 한다.', '마음은 아프지만 매맞는 것을 지켜볼 수밖에… (−0원)', 0),
        C('c2', 2, '권총으로 헌병들을 제압한다.', '총을 쏘자 헌병 경찰들이 나를 붙잡고 감옥에 가두었습니다. (−30원) 김규민씨가 감사의 뜻으로 보답했습니다. (+20원)', -10),
        C('c3', 3, '헌병에게 돈을 주며 풀어달라고 한다.', '10원을 주자 일본 경찰이 김규민씨를 풀어주었습니다. (−10원) 김규민씨가 감사의 뜻으로 보답했습니다. (+20원)', 10)] },
    { id: 'e10', ep: 10, kind: 'choice', tag: '객관식 선택', title: '이민수 선생을 찾아라',
      cue: '이민수 선생을 찾아 경성 백화점에 들어왔어요. 저 사람들 중 누가 이민수 선생일까요? (힌트: 이민수 선생님은 보통학교 교사입니다. TV의 4명 중 고르세요)',
      choices: [C('c1', 1, '1번', '오답입니다.', -10), C('c2', 2, '2번', '오답입니다.', -10),
        C('c3', 3, '3번', '정답입니다. (1910년대 교사들은 겁을 주기 위해 제복을 입고 칼을 차고 다녔습니다.)', 10), C('c4', 4, '4번', '오답입니다.', -10)] },
    { id: 'e11', ep: 11, kind: 'choice', tag: '주관식 선택', title: '하시모토의 기차 객실 암호',
      cue: '이민수: “하시모토가 내일 기차를 타고 인천으로 가오. 객실의 암호를 먼저 풀고 하시모토를 암살하시오.” TV에서 본 숫자 9개를 종이에 적은 뒤, 선생님이 정답을 알려 주면 눌러 주세요.',
      choices: [C('c1', '정답', '정답', '객실에 들어가 암살에 성공했습니다.', 30), C('c2', '오답', '오답', '하시모토가 인천으로 떠났습니다. 암살에 실패했습니다.', -20)] },
    { id: 'e12', ep: 12, kind: 'situation', tag: '상황 발생', title: '풀려난 염선생님',
      cue: '하시모토 암살 임무를 수행하고 돌아왔는데 조선 총독부 앞에서 염선생님을 만났어요. “조선총독부에서 나를 잡아갔지만 혐의가 없으니 금세 풀어주었다네. 너무 걱정할 것 없네~”', delta: 5 },

    { id: 'e13', ep: 13, kind: 'move', tag: '지역 이동', title: '경성에서 다시 만주로',
      cue: '3.1운동 1년 후, 이회영 선생님이 염선생과 함께 만주로 와서 청산리 전투를 도와 달라고 해요. 경성에서 다시 만주로 이동했습니다. 교통비 8원이 들었습니다.', from: '경성', to: '만주', cost: 8 },
    { id: 'e14', ep: 14, kind: 'choice', tag: '객관식 선택', title: '무기상점의 소총',
      cue: '만주로 이동하던 도중 무기상점에 들렀어요. 주인장: “이 소총은 300m 멀리 있는 적도 제압할 수 있는 최신 무기입니다. 50원을 주고 소총을 구입하시겠소?”',
      choices: [C('c1', 1, '소총을 구입한다.', '소총을 샀습니다. (소총 획득 성공)', -50, { flag: 'rifle' }),
        C('c2', 2, '구입하지 않는다.', '소총을 사지 않았습니다. (소총 획득 실패)', 0)] },
    { id: 'e15', ep: 15, kind: 'quiz', tag: '주관식 선택', title: '청산리, 밤의 일본군 위치',
      cue: '김좌진: “밤중에 일본군인들을 몰래 사격해주시오. 조명탄이 10초간 터집니다.” TV에서 본 일본 군인들이 있던 곳의 숫자를 모두 적으세요. 권총만 있으면 최대 4개, 소총이 있으면 최대 7개까지 쓸 수 있어요.',
      quiz: { type: 'numbers', answer: [0, 1, 2, 4, 7, 9], capBase: 4, capRifle: 7, tiers: { 5: 50, 4: 30, 3: 20, 2: 10, 1: -10, 0: -30 },
        resultText: '밤중에 일본 군인을 몰래 공격하여 시간을 벌었습니다. 덕분에 김좌진 장군이 청산리에서 큰 승리를 거두었습니다.' } },
    { id: 'e16', ep: 16, kind: 'choice', tag: '객관식 선택', title: '군산은 어디?',
      cue: '다음 암살 대상 스기야마는 지금 ‘군산’에 있어요. 군산으로 이동하기 위해 군산이 어디에 위치한 도시인지 지도에서 찾아보세요. (TV의 지도에서 1~4번 중 고르세요)',
      choices: [C('c1', 1, '지도의 1번', '정답입니다. (군산)', 20), C('c2', 2, '지도의 2번', '오답입니다. (목포)', -20),
        C('c3', 3, '지도의 3번', '오답입니다. (원산)', -10), C('c4', 4, '지도의 4번', '오답입니다. (부산)', -30)] },
    { id: 'e17', ep: 17, kind: 'move', tag: '지역 이동', title: '만주에서 군산으로', cue: '만주에서 군산으로 이동했습니다. 독립자금 12원을 지불했습니다.', from: '만주', to: '군산', cost: 12 },
    { id: 'e18', ep: 18, kind: 'quiz', tag: '주관식 선택', title: '신채호의 역사 퀴즈',
      cue: '군산항에서 신채호가 말해요. “자네가 이회영 선생님이 보낸 사람이 맞는지 테스트를 하겠네. 내가 내는 역사 퀴즈를 맞춰보게.” 각각의 정답을 적으세요.',
      quiz: { type: 'texts', strip: ['장군'], tiers: { 3: 20, 2: 10, 1: 5, 0: -10 },
        items: [{ label: '문제 1. 임진왜란 때 거북선으로 왜군을 무찌른 장군은?', accept: ['이순신'] },
          { label: '문제 2. 살수대첩에서 수나라를 무찌른 고구려의 장군은?', accept: ['을지문덕'] },
          { label: '문제 3. 고구려의 후손 대조영이 세운 나라의 이름은?', accept: ['발해'] }],
        resultText: '신채호: “일본은 우리나라의 민족정신을 없애기 위해 강제로 일본어와 일본 역사를 가르치고 있지. 이런 때일수록 우리나라의 말과 역사를 지켜야 하네.”' } },
    { id: 'e19', ep: 19, kind: 'quiz', tag: '주관식 선택', title: '쌀의 0.3배는 몇 가마?',
      cue: '농민 김청수: “일본이 산미증식계획을 실시해 우리나라의 쌀을 일본으로 빼돌리고 있습니다. 소작농들은 쌀의 0.3배밖에 가져가지 못합니다. 저기 쌓인 쌀의 0.3배가 몇 가마인지 알려 주십시오.” (TV 그림: 1가마)',
      quiz: { type: 'text', label: '정답', unit: '가마', accept: ['9'], strip: ['가마'], correctDelta: 20, wrongDelta: -20,
        correctResult: '정답입니다! 스기야마를 만나려면 일본인으로 변장해야 한다는 이야기를 들었습니다.', wrongResult: '오답입니다.', answerText: '9가마' } },
    { id: 'e20', ep: 20, kind: 'quiz', tag: '주관식 선택', title: '원리네 가족을 찾아라',
      cue: '변장 전문가 이원리: “일본인으로 변장하고 싶다면 시장에 나가 있는 우리 가족을 모두 찾아서 데려오시오.” 빨간색 줄무늬 옷에 콧수염을 한 원리네 가족은 모두 몇 명인가요?',
      quiz: { type: 'text', label: '정답', unit: '명', accept: ['9'], strip: ['명'], correctDelta: 20, wrongDelta: -20, flag: 'mustache',
        correctResult: '정답입니다! 공짜로 일본인 콧수염을 얻었습니다.', wrongResult: '오답입니다. 돈을 주고 일본인 콧수염을 샀습니다.', answerText: '9명' } },
    { id: 'e21', ep: 21, kind: 'choice', tag: '객관식 선택', title: '농민과 노동자를 데려갈까?',
      cue: '스기야마 암살에 성공했어요. 군산의 농민과 노동자들이 독립군에 참여하겠다며 찾아왔어요. 모두 데려가려면 50원이 필요합니다. 데려가겠습니까?',
      choices: [C('c1', 1, '모두 독립군으로 데려간다.', '농민들: “저희를 데려가주셔서 감사합니다. 보답으로 망원경을 드리겠습니다.” (망원경 획득)', -50, { flag: 'telescope' }),
        C('c2', 2, '데려가지 않는다.', '데려가지 않았습니다. (망원경 획득 실패)', 0)] },

    { id: 'e22', ep: 22, kind: 'quiz', tag: '주관식 선택', title: '전신기 암호 해독',
      cue: '이회영 선생님에게서 만나자는 연락이 암호로 도착했어요. 암호는 45231. 전신기 암호를 해독해서 이회영 선생님이 계신 곳을 알아내세요. (힌트 표: 1ㅐ 2ㅇ 3ㅎ 4ㅅ 5ㅏ 6ㄱ 7ㅓ 8ㅁ 9ㄴ 0ㅗ)',
      quiz: { type: 'text', label: '이회영 선생님이 계신 곳', unit: '', accept: ['상해', '상하이'], strip: [], correctDelta: 10, wrongDelta: -10,
        correctResult: '정답입니다! 전신기로 곧 상해에 가겠다는 답장을 보냈습니다.', wrongResult: '오답입니다.', answerText: '상해' } },
    { id: 'e23', ep: 23, kind: 'choice', tag: '객관식 선택', title: '염선생님과 함께 상해로?',
      cue: '상해로 가기 위해 준비하던 중 염선생님이 자신도 상해에 볼일이 있다고 해요.',
      choices: [C('c1', 1, '염선생님과 함께 상해로 간다.', '염선생님과 함께 상해로 가기로 했습니다.', 10),
        C('c2', 2, '염선생님과 함께 상해로 가지 않는다.', '염선생님과 따로 가기로 했습니다.', 0)] },
    { id: 'e24', ep: 24, kind: 'move', tag: '지역 이동', title: '군산에서 상해로', cue: '군산에서 상해로 이동하였습니다. 독립자금 30원을 지불했습니다.', from: '군산', to: '상해', cost: 30 },
    { id: 'e25', ep: 25, kind: 'situation', tag: '상황 발생', title: '감옥에 잡혀간 이회영 선생님',
      cue: '이회영 선생님이 묵고 계신 호텔로 갔지만 이미 일본인에게 발각되어 감옥에 잡혀간 뒤였어요. 감옥에서 이회영 선생님을 만났어요. “누군가 나를 배신한 것 같네. 배신한 밀정을 알게 되면 바로 암살하게. 당분간은 임시정부의 김구 선생을 찾아가 돕게.”', delta: -10 },
    { id: 'e26', ep: 26, kind: 'choice', tag: '객관식 선택', title: '김구 선생과 독립운동 단체',
      cue: '임시정부에 있는 김구 선생을 찾아갔어요. 김구: “독립운동을 위해 나를 찾아왔는가? 자네는 어떤 독립운동 단체에 관심 있는가?”',
      choices: [C('c1', 1, '신간회', '신간회에 관심을 보였습니다.', 0),
        C('c2', 2, '한인 애국단', '일제의 주요 인물을 처단하는 단체는 <한인 애국단>입니다. 한인 애국단에 가입하여 친일파 암살을 도와주기로 했습니다.', 20),
        C('c3', 3, '자제단', '자제단에 관심을 보였습니다.', -50)] },
    { id: 'e27', ep: 27, kind: 'situation', tag: '상황 발생', title: '윤봉길의 도시락 폭탄',
      cue: '한인 애국단 소속 윤봉길이 상해 홍커우 공원에서 도시락 폭탄을 던져 많은 일본인들을 처단했어요. 독립운동이 다시 활기를 띠게 되었어요.', delta: 30 },
    { id: 'e28', ep: 28, kind: 'move', tag: '지역 이동', title: '폭탄을 싣고 경성으로',
      cue: '김구 선생님의 암살 임무: 히가시를 암살할 폭탄을 상해에서 경성까지 무사히 운반하라. 폭탄을 싣고 상해에서 경성으로 이동하고 있어요. 독립자금 40원을 지불했습니다.', from: '상해', to: '경성', cost: 40 },
    { id: 'e29', ep: 29, kind: 'situation', tag: '상황 발생', title: '이회영 선생님의 죽음',
      cue: '뤼순 감옥에서 고문을 받던 이회영 선생님이 결국 돌아가셨어요. “이회영 선생님과 독립군을 배신한 밀정을 찾아서 반드시 복수하도록 하겠습니다…”', delta: -10 },
    { id: 'e30', ep: 30, kind: 'quiz', tag: '객관식 선택', title: '폭탄이 든 상자는?',
      cue: '히가시를 암살할 폭탄을 배로 운반하고 있어요. 일본군의 감시를 피하려고 상자를 섞었어요. 경성에 도착했습니다. 폭탄이 들어 있는 상자는 몇 번 상자인가요? (망원경이 없으면 1개, 있으면 2개까지 고를 수 있어요)',
      quiz: { type: 'boxes', count: 3, answer: '2', capBase: 1, capTelescope: 2, correctDelta: 50, wrongDelta: 0,
        correctResult: '정답입니다! 폭탄을 들고 히가시의 별장에 찾아갔습니다.', wrongResult: '오답입니다. 히가시의 별장에서 파티가 열리고 있습니다.' } },
    { id: 'e31', ep: 31, kind: 'choice', tag: '객관식 선택', title: '조선 청년 구하기',
      cue: '히가시를 처단하는 데 성공했어요. 이제 전쟁터에 끌려가는 청년들을 구할 차례예요. 청년들을 끌고 가는 트럭 운전수를 암살하세요. 어느 방향으로 총을 쏘시겠습니까? (TV의 식을 계산해 보세요)',
      choices: [C('c1', 1, '3시 방향', '오발했습니다.', -10), C('c2', 2, '12시 방향', '명중! 트럭 운전수를 처단했습니다.', 30),
        C('c3', 3, '4시 방향', '실수로 조선 청년을 공격했습니다.', -50)] },
    { id: 'e32', ep: 32, kind: 'situation', tag: '상황 발생', title: '염선생의 배신',
      cue: '트럭 운전수를 암살하는 데 성공했는데 갑자기 염선생이 일본 군인들을 이끌고 나타났어요. “어이~ 오랜만이군. 나를 믿지 말았어야지. 일본 군인 나으리들~ 저 독립군을 체포하시오.” 배신자 밀정은 염선생이었어요. 일본 감옥으로 끌려가 모든 것을 잃었어요.', delta: -200 },
    { id: 'e33', ep: 33, kind: 'final', tag: '마지막 주관식 선택', title: '나의 독립운동 명언',
      cue: '16년 뒤 해방을 맞아 감옥에서 풀려났어요. 일제 강점기 36년간 독립운동을 하느라 무척 수고 많았습니다. 이제 독립운동가 명단에 당신의 이름이 올라가요. 독립운동가로서 당신이 직접 <독립운동가 명언>을 작성해 보세요. 그리고 옆 짝꿍이 쓴 명언을 평가해 주세요.' }
  ];

  function stepById(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return STEPS[i]; return null; }
  function stepIndex(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i; return -1; }
  function choiceById(step, id) { for (var i = 0; i < step.choices.length; i++) if (step.choices[i].id === id) return step.choices[i]; return null; }

  function norm(text, strip) {
    var t = String(text == null ? '' : text).toLowerCase().replace(/[\s,.·、]/g, '');
    (strip || []).forEach(function (s) { t = t.split(s).join(''); });
    return t;
  }

  // 한 번에 쓸 수 있는 개수 상한(장비에 따라 달라짐)
  function numbersCap(q, flags) { return flags.rifle ? q.capRifle : q.capBase; }
  function boxesCap(q, flags) { return flags.telescope ? q.capTelescope : q.capBase; }
  function parseNumbers(text) {
    var seen = {}, out = [];
    String(text == null ? '' : text).replace(/[0-9]/g, function (c) { if (!seen[c]) { seen[c] = true; out.push(Number(c)); } return c; });
    return out;
  }
  function tierDelta(tiers, count) {
    var best = 0, k;
    for (k in tiers) if (Number(k) <= count && Number(k) >= best) best = Number(k);
    return tiers[best];
  }

  // 퀴즈 채점: 입력(a)과 현재 장비로 delta·결과 문구를 만든다
  function gradeQuiz(step, a, flags) {
    var q = step.quiz, input = Array.isArray(a) ? a : [];
    if (q.type === 'numbers') {
      var cap = numbersCap(q, flags);
      var nums = parseNumbers(input[0]).slice(0, cap);
      var hit = nums.filter(function (n) { return q.answer.indexOf(n) !== -1; }).length;
      return { delta: tierDelta(q.tiers, hit), shown: nums.join(', '), label: hit + '개 정답',
        result: hit + '개 정답. 정답은 (' + q.answer.join(', ') + ')입니다. ' + q.resultText };
    }
    if (q.type === 'texts') {
      var hits = 0;
      var parts = q.items.map(function (it, i) {
        var ok = it.accept.map(function (x) { return norm(x, q.strip); }).indexOf(norm(input[i], q.strip)) !== -1 && norm(input[i], q.strip) !== '';
        if (ok) hits++;
        return (ok ? '○ ' : '✕ ') + it.accept[0];
      });
      return { delta: tierDelta(q.tiers, hits), shown: input.map(function (x) { return String(x || '').trim() || '-'; }).join(' / '), label: hits + '개 정답',
        result: hits + '개 정답. 정답: ' + parts.join(' · ') + '. ' + q.resultText };
    }
    if (q.type === 'text') {
      var typed = String(input[0] == null ? '' : input[0]).trim();
      var okT = typed !== '' && q.accept.map(function (x) { return norm(x, q.strip); }).indexOf(norm(typed, q.strip)) !== -1;
      return { delta: okT ? q.correctDelta : q.wrongDelta, shown: typed + (q.unit || ''), label: okT ? '정답' : '오답', correct: okT,
        result: (okT ? q.correctResult : q.wrongResult) + ' (정답: ' + q.answerText + ')' };
    }
    if (q.type === 'boxes') {
      var cap2 = boxesCap(q, flags);
      var picks = input.map(String).filter(function (x, i, arr) { return /^[1-9]$/.test(x) && arr.indexOf(x) === i; }).slice(0, cap2);
      var okB = picks.indexOf(q.answer) !== -1;
      return { delta: okB ? q.correctDelta : q.wrongDelta, shown: picks.join(', ') + '번 상자', label: okB ? '정답' : '오답', correct: okB,
        result: (okB ? q.correctResult : q.wrongResult) + ' (폭탄은 ' + q.answer + '번 상자)' };
    }
    return { delta: 0, shown: '', label: '', result: '' };
  }

  function empty() { return { started: false, funds: 0, pos: START_CITY, route: [START_CITY], flags: {}, rows: [], cursor: -1, finished: false, gameOver: false, quote: '', evalResult: '' }; }

  function derive(log) {
    var d = empty();
    (log || []).forEach(function (e, n) {
      if (!e || typeof e !== 'object') return;
      var row = { n: n, s: e.s, c: e.c, delta: 0, total: 0, label: '', choiceLabel: '', no: null, result: '', ep: null, tag: '', kind: '', answerShown: '' };
      if (e.s === 'start') {
        if (d.started) return;
        d.started = true; row.label = '게임 시작'; row.choiceLabel = '독립운동가'; row.result = '모두 같은 신분이에요. 독립자금 0원에서 시작합니다.';
      } else if (e.s === 'manual') {
        if (!d.started || typeof e.delta !== 'number' || !isFinite(e.delta)) return;
        row.delta = Math.round(e.delta); row.label = '자금 가감'; row.choiceLabel = String(e.memo || '선생님이 알려 준 자금');
      } else {
        var step = stepById(e.s);
        if (!step || !d.started) return;
        row.ep = step.ep; row.label = step.title; row.tag = step.tag; row.kind = step.kind;
        if (step.kind === 'situation') {
          row.delta = step.delta; row.choiceLabel = '선택 없음'; row.result = step.cue;
          if (step.flag) d.flags[step.flag] = true;
        } else if (step.kind === 'move') {
          row.delta = -step.cost; row.choiceLabel = step.from + ' → ' + step.to; row.result = step.cue;
          d.pos = step.to; d.route.push(step.to);
        } else if (step.kind === 'choice') {
          var ch = choiceById(step, e.c);
          if (!ch) return;
          row.delta = ch.delta; row.choiceLabel = ch.label; row.no = ch.no; row.result = ch.result;
          if (ch.flag) d.flags[ch.flag] = true;
          if (ch.end) { d.finished = true; d.gameOver = true; }
        } else if (step.kind === 'quiz') {
          var g = gradeQuiz(step, e.a, d.flags);
          row.delta = g.delta; row.choiceLabel = g.shown; row.no = g.shown; row.result = g.result; row.grade = g.label;
          if (step.quiz.flag) d.flags[step.quiz.flag] = true;
        } else if (step.kind === 'final') {
          var ev = null;
          for (var i = 0; i < EVALS.length; i++) if (EVALS[i].id === e.c) ev = EVALS[i];
          if (!ev) return;
          d.quote = String(e.q == null ? '' : e.q).trim().slice(0, 200);
          d.evalResult = ev.result;
          row.choiceLabel = d.quote || '(쓰지 않음)'; row.no = ev.label; row.result = ev.result; d.finished = true;
        }
        d.cursor = Math.max(d.cursor, stepIndex(step.id));
      }
      d.funds += row.delta;
      row.total = d.funds;
      d.rows.push(row);
    });
    return d;
  }

  function nextStep(d) {
    if (!d.started || d.finished) return null;
    return d.cursor + 1 < STEPS.length ? STEPS[d.cursor + 1] : null;
  }

  var api = {
    STEPS: STEPS, STORAGE_KEY: STORAGE_KEY, START_CITY: START_CITY, TOTAL_EP: TOTAL_EP, CHAPTERS: CHAPTERS,
    WEAPONS: WEAPONS, QUOTES: QUOTES, EVALS: EVALS,
    stepById: stepById, derive: derive, nextStep: nextStep, gradeQuiz: gradeQuiz, numbersCap: numbersCap, boxesCap: boxesCap, parseNumbers: parseNumbers
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AssassinationBoard = api;
})(typeof window !== 'undefined' ? window : this);
