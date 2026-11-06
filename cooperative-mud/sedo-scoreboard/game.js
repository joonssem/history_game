/*
 * 세도 정치와 홍경래의 난 인생 게임 — 점수 규칙과 장면 데이터
 *
 * 원본: 「세도정치 인생게임.pptx」(74장, EPISODE 1~21). 점수는 슬라이드의 선택지 열 좌표로 대응을 확정했다.
 * 학생이 누른 기록(log)만 저장하고, 점수·신분·플래그는 매번 처음부터 다시 계산(derive)한다.
 * 그래서 되돌리기·수정이 언제나 일관된다. 화면 코드는 app.js에 있다.
 *
 * 역할(role): yang 양반 / min 평민 / gwan 관군 / bonggi 봉기군
 *   - 홍경래의 난(EPISODE 14~20) 동안에는 side(관군·봉기군)가 base(양반·평민)보다 우선한다.
 */
(function (root) {
  'use strict';

  var ROLE_NAME = { yang: '양반', min: '평민', gwan: '관군', bonggi: '봉기군' };
  var START_POINTS = { yang: 7000, min: 4000 };
  var STORAGE_KEY = 'sedoScoreboard.v1';

  // 에피소드 21 양반 최종 벌(슬라이드 72)
  var FINAL_PENALTIES = [
    { id: 'office', label: '나는 돈을 주고 벼슬을 산 적이 있다.', delta: -1000 },
    { id: 'bribe', label: '나는 뇌물을 바친 적이 있다.', delta: -1000 },
    { id: 'tax', label: '나는 평민들에게 비싼 세금을 거둔 적이 있다.', delta: -1000 },
    { id: 'sand', label: '나는 평민들에게 빌려줄 쌀에 모래를 섞어서 속인 적이 있다.', delta: -1000 },
    { id: 'think', label: '나는 내가 인생을 살면서 불쌍한 농민들을 괴롭혔다고 생각한다.', delta: -10000 }
  ];
  var FINAL_MIN_BONUS = 5000;

  // kind: choice(선택) | situation(상황 발생, 선택 없음) | final(에피소드 21)
  // who: all | war(관군·봉기군) | yang | min | gwan | bonggi
  // choice.delta: 숫자이거나 { gwan, bonggi } 처럼 역할별 값
  var STEPS = [
    {
      id: 'e1', ep: 1, who: 'all', kind: 'choice', tag: '모두의 선택', title: '주막의 두 어르신',
      cue: '주막에 지체 높은 어르신으로 보이는 두 남자가 서 있어요. 누구에게 먼저 인사를 할까요?',
      choices: [
        { id: 'c1', no: 1, label: '김씨 어르신', result: '진짜 어르신은 김씨였습니다.', delta: 30 },
        { id: 'c2', no: 2, label: '최씨 어르신', result: '진짜 어르신은 김씨였습니다.', delta: -10 }
      ]
    },
    {
      id: 'e2', ep: 2, who: 'all', kind: 'situation', tag: '상황 발생', title: '풍년',
      cue: '올해는 농사가 잘되어 수확량이 작년의 2배로 늘었어요.',
      delta: { yang: 500, min: 200 }
    },
    {
      id: 'e3y', ep: 3, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '벼슬 값 20000냥',
      cue: '안동 김씨 어르신이 말해요. “돈 20000냥을 주면 좋은 벼슬자리 하나 주겠네.”',
      choices: [
        { id: 'c1', no: 1, label: '돈을 드린다', result: '돈 20000냥을 바쳐 이 고을의 새로운 원님이 되었습니다.', delta: -1000, flag: 'office' },
        { id: 'c2', no: 2, label: '돈을 드리지 않는다', result: '안동 김씨 가문에게 찍혀 억울한 누명을 쓰게 되었습니다. 당신의 신분은 지금부터 ‘평민’입니다.', delta: -3000, base: 'min', flag: 'demoted' }
      ]
    },
    {
      id: 'e3r', ep: 3, who: 'min', kind: 'choice', tag: '양반의 선택 · 패자부활전', title: '양반 신분 되찾기',
      cue: '뇌물을 바치지 않아 평민이 되었어요. 500포인트를 쓰고 양반 신분을 되찾겠습니까?',
      when: function (d) { return !!d.flags.demoted; },
      choices: [
        { id: 'c1', no: 1, label: '500포인트 사용', result: '양반 신분을 되찾았습니다.', delta: -500, base: 'yang', flag: 'recovered' },
        { id: 'c2', no: 2, label: '사용 안 함', result: '평민 신분으로 살아갑니다.', delta: 0 }
      ]
    },
    {
      id: 'e3m', ep: 3, who: 'min', kind: 'choice', tag: '평민의 선택', title: '가뭄과 저수지 물',
      cue: '올해는 가뭄이 들어 물이 부족해요. 관청에 찾아가 저수지 물을 빌려 쓰겠다고 요청할까요?',
      choices: [
        { id: 'c1', no: 1, label: '관청에 찾아간다', result: '관청에 찾아갔으나 매만 맞고 쫓겨났습니다.', delta: -100 },
        { id: 'c2', no: 2, label: '관청에 찾아가지 않는다', result: '가뭄으로 농사가 여전히 어렵습니다.', delta: -30 }
      ]
    },
    {
      id: 'e4', ep: 4, who: 'all', kind: 'situation', tag: '상황 발생', title: '세금 내는 날',
      cue: '오늘은 세금을 내는 날이에요. 평민들은 양반들에게 세금을 냅니다.',
      delta: { yang: 200, min: -200 }
    },
    {
      id: 'e5y', ep: 5, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '환곡 쌀에 모래?',
      cue: '흉년이라 환곡으로 평민에게 쌀을 빌려주려 해요. 쌀에 모래를 섞어 속여 볼까요?',
      choices: [
        { id: 'c1', no: 1, label: '조금만 섞는다', result: '쌀에 모래를 조금 섞어 빌려주었습니다.', delta: -100, flag: 'sand' },
        { id: 'c2', no: 2, label: '많이 섞는다', result: '쌀에 모래를 많이 섞어 빌려주었습니다.', delta: -50, flag: 'sand' },
        { id: 'c3', no: 3, label: '섞지 않는다', result: '쌀에 모래를 섞지 않고 빌려주었습니다.', delta: -200 }
      ]
    },
    {
      id: 'e5m', ep: 5, who: 'min', kind: 'choice', tag: '평민의 선택', title: '환곡 쌀 빌리기',
      cue: '관청에서 쌀을 빌려준다는 사람이 찾아왔어요. 모래를 섞는다는 소문도 있어요. 쌀을 빌릴까요?',
      choices: [
        { id: 'c1', no: 1, label: '쌀을 빌린다', result: '쌀을 빌렸습니다.', delta: 100 },
        { id: 'c2', no: 2, label: '쌀을 빌리지 않는다', result: '관리에게 매를 맞고 억지로 빌리게 되었습니다.', delta: 50 }
      ]
    },
    {
      id: 'e6', ep: 6, who: 'all', kind: 'situation', tag: '상황 발생', title: '안동 김씨 가문의 잔치',
      cue: '안동 김씨 가문의 잔치에 찾아가 공짜로 맛있는 밥을 얻어먹었어요.',
      delta: { yang: 100, min: 30 }
    },
    {
      id: 'e7y', ep: 7, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '다시 찾아온 김씨 어르신',
      cue: '몇 개월 뒤 김씨 어르신이 고을에 다시 찾아왔어요. 어르신을 찾아가 인사를 드릴까요?',
      choices: [
        { id: 'c1', no: 1, label: '인사만 드린다', result: '김씨 어르신이 화를 내며 가버리셨고, 다음 날 더 안 좋은 벼슬자리로 쫓겨났습니다.', delta: -700 },
        { id: 'c2', no: 2, label: '인사와 함께 뇌물을 드린다', result: '김씨 어르신이 무척 좋아하셨고, 더 높은 벼슬자리를 얻게 되었습니다.', delta: -200, flag: 'bribe' },
        { id: 'c3', no: 3, label: '모른척 무시한다', result: '안동 김씨 가문에게 찍혀 재산을 빼앗겼습니다.', delta: -1500 }
      ]
    },
    {
      id: 'e7m', ep: 7, who: 'min', kind: 'choice', tag: '평민의 선택', title: '배고픈 날 김씨 어르신',
      cue: '흉년이라 배가 고파요. 마침 김씨 어르신이 고을에 왔어요. 인사를 드리며 먹을 것을 구해 볼까요?',
      choices: [
        { id: 'c1', no: 1, label: '인사만 드린다', result: '어르신께 칭찬을 받으며 먹을 것을 좀 구했습니다.', delta: 30 },
        { id: 'c2', no: 2, label: '인사와 함께 뇌물을 드린다', result: '산에서 구한 버섯을 드렸더니 “이것도 뇌물이냐?!” 하며 호되게 혼났습니다.', delta: -50 },
        { id: 'c3', no: 3, label: '모른척 무시한다', result: '인사를 안 했다고 어르신께 두들겨 맞았습니다.', delta: -100 }
      ]
    },
    {
      id: 'e8', ep: 8, who: 'all', kind: 'situation', tag: '상황 발생', title: '세금 내는 날',
      cue: '오늘은 세금을 내는 날이에요. 평민들은 양반들에게 세금을 냅니다.',
      delta: { yang: 200, min: -200 }
    },
    {
      id: 'e9y', ep: 9, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '봄에 빌려준 쌀 돌려받기',
      cue: '가을이 되어 봄에 빌려준 쌀을 돌려받을 때예요. 우리는 모래를 아주 조금만 섞었어요.',
      choices: [
        { id: 'c1', no: 1, label: '100% 온전히 쌀로 다 돌려받는다', result: '쌀을 온전히 돌려받았습니다.', delta: 200 },
        { id: 'c2', no: 2, label: '모래를 섞은 만큼 조금은 빼고 돌려받는다', result: '모래를 섞은 만큼은 빼고 돌려받았습니다.', delta: 50 }
      ]
    },
    {
      id: 'e9m', ep: 9, who: 'min', kind: 'choice', tag: '평민의 선택', title: '빌린 쌀 갚기',
      cue: '가을이 되어 빌린 쌀을 돌려줘야 해요. 올해도 흉년이라 쌀이 거의 없고, 빌린 쌀에는 모래가 섞여 있었어요.',
      choices: [
        { id: 'c1', no: 1, label: '모래를 섞은 양만큼은 빼고 돌려준다', result: '관청 관리에게 매를 맞고 쌀을 다 뺏겼습니다.', delta: -250 },
        { id: 'c2', no: 2, label: '먹을 것은 없지만 빌린 만큼 100% 다 쌀로 갚는다', result: '빌린 만큼 쌀로 다 갚았습니다.', delta: -200 }
      ]
    },
    {
      id: 'e10', ep: 10, who: 'all', kind: 'situation', tag: '상황 발생', title: '환곡의 이자',
      cue: '아~ 깜빡했네요. 환곡은 이자까지 쳐서 쌀을 갚는 제도예요. 평민들은 양반들에게 이자를 더 냅니다.',
      delta: { yang: 50, min: -50 }
    },
    {
      id: 'e11', ep: 11, who: 'all', kind: 'situation', tag: '상황 발생', title: '과거시험 특별 심사위원',
      cue: '1년이 지났어요. 김씨 어르신이 추천한 양반들이 과거시험 특별 심사위원으로 뽑혔어요. 올해도 흉년이에요.',
      delta: { yang: 200, min: -100 }
    },
    {
      id: 'e12m', ep: 12, who: 'min', kind: 'choice', tag: '평민의 선택', title: '노잣돈이 모자란 청년',
      cue: '과거시험을 보러 한양에 가는 청년이 노잣돈이 부족하다며 돈을 빌려 달라고 해요.',
      choices: [
        { id: 'c1', no: 1, label: '돈을 빌려준다', result: '청년이 고마워하며 말했어요. “제 이름은 <홍경래>라고 합니다. 인연이 되면 다시 만나겠죠.”', delta: -50, flag: 'lent' },
        { id: 'c2', no: 2, label: '돈을 빌려주지 않는다', result: '돈을 빌려주지 않았습니다.', delta: 0 }
      ]
    },
    {
      id: 'e12y', ep: 12, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '과거시험 심사',
      cue: '과거시험 특별 심사위원이 되었어요. 시험의 주제는 <봄>입니다. 누구를 뽑겠습니까?',
      choices: [
        { id: 'c1', no: 1, label: '홍경래 (평안도 출신)', result: '평안도 사람을 뽑아 김씨 어르신의 미움을 받게 되었습니다.', delta: -200 },
        { id: 'c2', no: 2, label: '이말세 (한양 출신)', result: '“아주 훌륭한 심사야.” 하고 김씨 어르신이 칭찬했습니다.', delta: 100 }
      ]
    },
    {
      id: 'e13', ep: 13, who: 'all', kind: 'situation', tag: '상황 발생', title: '탐관오리의 횡포',
      cue: '탐관오리들의 횡포가 날로 커져요. 세금 내는 날이 아닌데도 평민들은 계속 돈을 강제로 빼앗겼어요. (그로부터 10년 뒤…)',
      delta: { yang: 200, min: -100 }
    },
    {
      id: 'e14m', ep: 14, who: 'min', kind: 'choice', tag: '평민의 선택', title: '홍경래의 난 — 어느 편?',
      cue: '평안도에서 홍경래가 반란을 일으켰어요. 관군이 되어 싸울까요, 봉기군이 되어 홍경래의 편이 될까요?',
      choices: [
        { id: 'c1', no: 1, label: '홍경래와 싸운다', result: '당신의 신분은 지금부터 ‘관군’입니다. 나라로부터 월급을 받았습니다.', delta: 30, side: 'gwan' },
        { id: 'c2', no: 2, label: '홍경래와 같은 편이 된다', result: '당신의 신분은 지금부터 ‘봉기군’입니다. 홍경래 군대로부터 식량을 받았습니다.', delta: 20, side: 'bonggi' }
      ]
    },
    {
      id: 'e14y', ep: 14, who: 'yang', kind: 'choice', tag: '양반의 선택', title: '청천강 북쪽의 전투',
      cue: '당신은 관군이 되어 홍경래의 난을 막아야 해요. 청천강 북쪽에서 벌어지는 전투에서 어느 장군을 도울까요?',
      choices: [
        { id: 'c1', no: 1, label: '김익순 장군', result: '김익순 장군이 전투에서 패배하고 항복했습니다. 죽을 뻔한 위기를 넘기고 가까스로 도망쳤습니다.', delta: -1000, side: 'gwan' },
        { id: 'c2', no: 2, label: '이영식 장군', result: '홍경래의 소규모 군대를 제압했습니다.', delta: 100, side: 'gwan' }
      ]
    },
    {
      id: 'e15', ep: 15, who: 'war', kind: 'situation', tag: '상황 발생', title: '평안도 대부분 점령',
      cue: '홍경래의 난이 일어난 지 10일 만에 홍경래의 군대가 평안도 지역 대부분을 점령했어요.',
      delta: { gwan: -1500, bonggi: 1500 }
    },
    {
      id: 'e16b', ep: 16, who: 'bonggi', kind: 'choice', tag: '봉기군의 선택', title: '영변과 안주',
      cue: '다음 공격할 곳을 정해야 해요. 우군칙은 영변을, 김대린은 안주를 먼저 공격하자고 해요.',
      choices: [
        { id: 'c1', no: 1, label: '영변을 먼저 공격', result: '영변을 먼저 치자고 했지만, 홍경래 장군은 결국 안주를 먼저 공격하기로 마음먹었습니다.', delta: -50 },
        { id: 'c2', no: 2, label: '안주를 먼저 공격', result: '홍경래 장군은 결국 안주를 먼저 공격하기로 마음먹었습니다.', delta: 50 }
      ]
    },
    {
      id: 'e16m', ep: 16, who: 'bonggi', kind: 'choice', tag: '봉기군의 선택', title: '10년 전의 그 청년',
      cue: '회의가 끝나고 홍경래 장군이 나를 찾아와 물어요. “혹시 10년 전에 저에게 돈을 빌려준 적이 있지 않습니까?”',
      choices: [
        { id: 'c1', no: 1, label: '홍경래에게 돈을 빌려준 적이 있다', result: '10년 전 돈을 빌려준 일로 포인트를 얻었습니다.', delta: 1000, hint: 'lent' },
        { id: 'c2', no: 2, label: '홍경래에게 돈을 빌려준 적이 없다', result: '포인트 변화가 없습니다.', delta: 0, hint: 'notLent' }
      ]
    },
    {
      id: 'e16g', ep: 16, who: 'gwan', kind: 'choice', tag: '관군의 선택', title: '지원병을 부를까?',
      cue: '홍경래 군대의 기세가 좋아요. 시간이 걸려도 한양에 지원병을 요청할까요, 가진 군대로 빨리 진압할까요?',
      choices: [
        { id: 'c1', no: 1, label: '지원병을 요청한다', result: '홍경래 군대가 움직이지 않아, 지원병을 요청할 시간을 벌었습니다.', delta: 50 },
        { id: 'c2', no: 2, label: '지원병을 요청하지 않는다', result: '지원병을 요청하지 않고 우리 군대로 진압하기로 했습니다.', delta: -50 }
      ]
    },
    {
      id: 'e17', ep: 17, who: 'war', kind: 'situation', tag: '상황 발생', title: '홍경래 암살 시도',
      cue: '홍경래의 결정에 불만을 품은 부하들이 홍경래를 암살하려 했어요. 홍경래는 크게 다쳤고, 군대의 진격이 4일 동안 멈췄어요.',
      delta: { gwan: 100, bonggi: -100 }
    },
    {
      id: 'e18', ep: 18, who: 'war', kind: 'choice', tag: '모두의 선택', title: '송림 전투와 박천 전투',
      cue: '지원병이 도착해 대규모 전투가 벌어져요. 어느 전투에 참여하겠습니까?',
      choices: [
        { id: 'c1', no: 1, label: '송림 전투', result: '송림 전투에서 홍경래의 군대가 크게 패배하고 정주성으로 도망갔습니다.', delta: { gwan: 400, bonggi: -600 } },
        { id: 'c2', no: 2, label: '박천 전투', result: '박천에서는 큰 전투가 일어나지 않았습니다.', delta: { gwan: 0, bonggi: 0 } }
      ]
    },
    {
      id: 'e19b', ep: 19, who: 'bonggi', kind: 'choice', tag: '봉기군의 선택', title: '정주성에 갇히다',
      cue: '정주성이 포위되어 식량이 떨어져 가요. 당신이라면 어떻게 하시겠습니까?',
      choices: [
        { id: 'c1', no: 1, label: '식량이 부족해도 계속 참는다', result: '병사들이 불만을 가져 도망갔습니다.', delta: -200 },
        { id: 'c2', no: 2, label: '말을 잡아서 말고기라도 먹는다', result: '당분간은 말고기로 버틸 수 있을 것 같습니다.', delta: -50 }
      ]
    },
    {
      id: 'e19g', ep: 19, who: 'gwan', kind: 'choice', tag: '관군의 선택', title: '정주성 공격 방법',
      cue: '홍경래의 군대가 정주성에서 오랫동안 버티고 있어요. 정주성을 공격할 새로운 방법을 골라야 해요.',
      choices: [
        { id: 'c1', no: 1, label: '땅굴을 판다', result: '성벽 밑에 땅굴을 파서 화약을 터뜨리자 성벽이 무너졌습니다. 이제 정주성 안을 공격할 수 있습니다.', delta: 100 },
        { id: 'c2', no: 2, label: '밤중에 몰래 공격한다', result: '밤중에 몰래 공격하는 작전은 실패했습니다.', delta: -300 }
      ]
    },
    {
      id: 'e20', ep: 20, who: 'war', kind: 'situation', tag: '상황 발생', title: '홍경래의 난이 끝나다',
      cue: '관군이 정주성 안으로 들어가고, 홍경래 군대는 최선을 다했으나 싸움에서 지고 말았어요. 이제 원래 신분(양반/평민)으로 돌아갑니다.',
      delta: { gwan: 1000, bonggi: -1000 },
      after: 'endWar'
    },
    {
      id: 'e21', ep: 21, who: 'all', kind: 'final', tag: '상황 발생', title: '농민 봉기가 일어나다',
      cue: '(약 50년 뒤) 우리 고을에도 농민 봉기가 일어났어요. 농민들이 관청을 습격하여 부패한 양반들을 잡아 심판을 내리고 있어요.'
    }
  ];

  function roleOf(d) { return d.side || d.base; }

  function resolveDelta(spec, role) {
    if (typeof spec === 'number') return spec;
    if (spec && typeof spec === 'object' && typeof spec[role] === 'number') return spec[role];
    return 0;
  }

  function stepById(id) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return STEPS[i];
    return null;
  }
  function stepIndex(id) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i;
    return -1;
  }
  function choiceById(step, id) {
    for (var i = 0; i < step.choices.length; i++) if (step.choices[i].id === id) return step.choices[i];
    return null;
  }

  // 이 장면이 지금 신분에 해당하는가
  function applies(step, d) {
    var role = roleOf(d);
    if (!role) return false;
    var okWho = step.who === 'all' || (step.who === 'war' ? (role === 'gwan' || role === 'bonggi') : step.who === role);
    if (!okWho) return false;
    return step.when ? !!step.when(d) : true;
  }

  function finalDelta(base, checks) {
    if (base === 'min') return FINAL_MIN_BONUS;
    var sum = 0;
    FINAL_PENALTIES.forEach(function (p) { if (checks.indexOf(p.id) !== -1) sum += p.delta; });
    return sum;
  }

  function emptyDerived() {
    return { base: null, side: null, points: 0, flags: {}, rows: [], cursor: -1, finished: false };
  }

  // log → 현재 상태. 잘못된 항목은 건너뛴다(저장소 손상 대비).
  function derive(log) {
    var d = emptyDerived();
    (log || []).forEach(function (e, n) {
      if (!e || typeof e !== 'object') return;
      var role = roleOf(d);
      var row = { n: n, s: e.s, c: e.c, role: role, delta: 0, total: 0, label: '', choiceLabel: '', result: '', ep: null, tag: '' };
      if (e.s === 'start') {
        if (d.base || !START_POINTS.hasOwnProperty(e.c)) return;
        d.base = e.c; // 시작 포인트는 아래 공통 합산(row.delta)으로 한 번만 더한다
        row.role = e.c; row.delta = START_POINTS[e.c]; row.label = '게임 시작'; row.choiceLabel = ROLE_NAME[e.c] + ' 신분';
        row.result = '처음 포인트를 받았습니다.';
      } else if (e.s === 'manual') {
        if (!d.base || typeof e.delta !== 'number' || !isFinite(e.delta)) return;
        row.delta = Math.round(e.delta); row.label = '점수 가감'; row.choiceLabel = String(e.memo || '선생님이 알려 준 점수');
      } else {
        var step = stepById(e.s);
        if (!step || !d.base) return;
        row.ep = step.ep; row.label = step.title; row.tag = step.tag;
        if (step.kind === 'situation') {
          row.delta = resolveDelta(step.delta, role); row.choiceLabel = '선택 없음'; row.result = step.cue;
          if (step.after === 'endWar') d.side = null;
        } else if (step.kind === 'final') {
          var checks = Array.isArray(e.checks) ? e.checks : [];
          row.delta = finalDelta(d.base, checks);
          row.choiceLabel = d.base === 'min' ? '농민의 승리' : (checks.length ? '해당 ' + checks.length + '개' : '해당 없음');
          d.finished = true;
        } else {
          var ch = choiceById(step, e.c);
          if (!ch) return;
          row.delta = resolveDelta(ch.delta, role); row.choiceLabel = ch.label; row.result = ch.result;
          if (ch.flag) d.flags[ch.flag] = true;
          if (ch.base) d.base = ch.base;
          if (ch.side) d.side = ch.side;
        }
        d.cursor = Math.max(d.cursor, stepIndex(step.id));
      }
      d.points += row.delta;
      row.total = d.points;
      d.rows.push(row);
    });
    return d;
  }

  // 다음에 보여 줄 장면(없으면 null)
  function nextStep(d) {
    if (!d.base || d.finished) return null;
    for (var i = d.cursor + 1; i < STEPS.length; i++) if (applies(STEPS[i], d)) return STEPS[i];
    return null;
  }

  var api = {
    STEPS: STEPS, ROLE_NAME: ROLE_NAME, START_POINTS: START_POINTS, STORAGE_KEY: STORAGE_KEY,
    FINAL_PENALTIES: FINAL_PENALTIES, FINAL_MIN_BONUS: FINAL_MIN_BONUS,
    roleOf: roleOf, resolveDelta: resolveDelta, stepById: stepById, applies: applies,
    derive: derive, nextStep: nextStep, finalDelta: finalDelta
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SedoBoard = api;
})(typeof window !== 'undefined' ? window : this);
