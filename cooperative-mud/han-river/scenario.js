window.HanRiverScenario = {
  id: 'han-river-v01',
  storageKey: 'history_cooperative_han_river_v01',
  title: '왜 모두 이 땅을 원했을까: 한강 유역 쟁탈',
  teamCount: 5,
  teamSizeOptions: [3, 4, 5],
  labels: {
    roleStep: '내 조사 자료',
    shareStep: '자료 나누기',
    secondStep: '깨진 약속 다시 보기',
    privateLabel: '내가 조사한 것',
    interestLabel: '이 자료가 말해 주는 것:',
    roleStatus: '내 조사 자료를 혼자 읽어 보세요. 아직 친구에게 설명하지 않습니다.',
    secondStatus: '함께 되찾은 땅에서 벌어진 일을 읽고 모둠에서 토론하세요.',
    summary: {
      role: '내가 맡은 조사',
      afterEvidence: '친구 자료와 새 자료 뒤',
      statement: '우리 모둠 설명 문장'
    }
  },
  roles: [
    {
      id: 'land',
      icon: '🌾',
      name: '땅 조사관',
      figure: '들과 사람',
      privateInfo: '한강 둘레에는 한반도에서 손꼽히게 넓은 들이 펼쳐져 있습니다. 물을 대기 좋아 농사가 잘되었고, 곡식이 넉넉한 곳에는 사람이 모여 살았습니다. 사람이 많으면 거둘 수 있는 곡식도, 모을 수 있는 군사도 많아집니다.',
      interest: '이 땅을 가지면 먹을 것과 사람을 함께 얻습니다.',
      shareText: '내가 조사한 건 땅이야. 한강 둘레에 아주 넓은 들이 있어서 농사가 잘됐고, 그래서 사람이 많이 모여 살았대.'
    },
    {
      id: 'river',
      icon: '🚤',
      name: '물길 조사관',
      figure: '강을 따라 오가는 길',
      privateInfo: '옛날에는 무거운 짐을 수레로 옮기기가 몹시 어려웠습니다. 그런데 강이 있으면 배에 실어 훨씬 쉽게 옮길 수 있었습니다. 한강은 내륙 깊은 곳에서 서쪽 바다까지 이어져, 사람과 물자가 오가는 큰길 노릇을 했습니다.',
      interest: '강 하나가 지금의 큰 도로 여러 개 몫을 했습니다.',
      shareText: '내가 조사한 건 물길이야. 옛날엔 짐을 육지로 옮기기 어려웠는데, 한강으로는 배를 타고 안쪽까지 쉽게 오갈 수 있었대.'
    },
    {
      id: 'sea',
      icon: '⛵',
      name: '바닷길 조사관',
      figure: '서해 건너 중국',
      privateInfo: '한강은 서쪽 바다로 흘러 들어갑니다. 한강 하류를 가진 나라는 배를 띄워 중국과 곧바로 오갈 수 있었습니다. 앞선 문물과 물건을 들여오고, 사신을 보내 도움을 청할 수도 있었습니다. 이 길이 막히면 다른 나라를 거쳐야 했습니다.',
      interest: '이 땅은 바깥 세상으로 나가는 문이었습니다.',
      shareText: '내가 조사한 건 바닷길이야. 한강은 서해로 이어져서, 여길 가지면 중국이랑 직접 오갈 수 있었대. 없으면 남의 나라를 거쳐야 했고.'
    },
    {
      id: 'record',
      icon: '📜',
      name: '기록 조사관',
      figure: '누가 언제 가졌나',
      privateInfo: '기록에 따르면 한강 유역의 주인은 세 번 바뀌었습니다. 4세기에는 백제가, 5세기에는 고구려가, 6세기에는 신라가 이 땅을 차지했습니다. 세 나라 모두 한 번씩 가져 본 셈입니다.',
      interest: '한 나라가 계속 가진 것이 아니라 주인이 바뀌었습니다.',
      shareText: '내가 조사한 건 연표야. 4세기는 백제, 5세기는 고구려, 6세기는 신라가 이 땅을 가졌대. 세 나라가 돌아가면서 차지한 거야.'
    },
    {
      id: 'weigher',
      icon: '🧭',
      name: '견주는 사람',
      figure: '근거를 저울에 올리는 사람',
      privateInfo: '친구들이 가져온 자료는 저마다 다른 까닭을 말합니다. 어느 하나만 옳다고 하기 전에, 서로 어떻게 이어지는지 살펴야 합니다. 예를 들어 넓은 들과 바닷길은 따로 있는 것이 아니라 함께 있을 때 더 큰 힘이 됩니다.',
      interest: '까닭이 하나라고 서둘러 정하지 않는 것이 내 일입니다.',
      shareText: '나는 저울 역할이야. 모둠이 문장을 정하기 전에, 서로 다른 조사에서 나온 근거를 두 가지 이상 말해 줘.'
    }
  ],
  firstChoices: [
    { id: 'farm', label: 'A', text: '넓은 들에서 농사를 지을 수 있어서' },
    { id: 'transport', label: 'B', text: '강을 따라 물자를 옮기기 쉬워서' },
    { id: 'china', label: 'C', text: '바다로 나가 중국과 직접 만날 수 있어서' },
    { id: 'center', label: 'D', text: '한반도 가운데라 어디로든 갈 수 있어서' }
  ],
  smallTeamClue: {
    title: '3인 모둠 공통 자료 — 주인이 바뀐 순서',
    text: '기록에 따르면 한강 유역의 주인은 세 번 바뀌었습니다. 4세기에는 백제가, 5세기에는 고구려가, 6세기에는 신라가 이 땅을 차지했습니다. 세 나라 모두 한 번씩 가져 본 셈입니다.'
  },
  pacing: {
    order: ['role', 'first', 'share', 'reveal', 'second', 'statement', 'history'],
    budgets: {
      '5':  { role: 35, first: 25, share: 95,  reveal: 50, statement: 65,  history: 40 },
      '10': { role: 50, first: 40, share: 160, reveal: 80, second: 80, statement: 110, history: 80 }
    },
    prompts: {
      role: {
        slow: '내 자료에서 모둠에 꼭 말해야 할 것은 무엇인가요? 한 가지만 정해도 됩니다.',
        fast: '내 자료만으로는 설명하기 어려운 점은 없나요? 그것도 함께 말해 보세요.'
      },
      first: {
        slow: '정답을 찾는 것이 아닙니다. 내가 조사한 것만 보고 든 생각을 골라도 괜찮아요.',
        fast: '왜 그렇게 골랐는지 한 문장으로 말할 수 있나요? 뒤에서 다시 물어봅니다.'
      },
      share: {
        slow: '아직 말하지 않은 친구가 있나요? 그 친구 자료부터 들어 볼까요?',
        fast: '친구들의 까닭 중에 서로 이어지는 것이 있었나요?'
      },
      reveal: {
        slow: '한강을 차지한 때와 전성기가 겹친다는 점은 내 생각과 어떻게 이어지나요?',
        fast: '생각을 바꾸지 않았다면, 그 까닭을 친구에게 설명해 볼까요?'
      },
      second: {
        slow: '신라가 무엇을 얻으려고 약속을 깼는지 다시 떠올려 볼까요?',
        fast: '우리가 고른 까닭으로 이 일까지 설명할 수 있나요?'
      },
      statement: {
        slow: '친구들이 말한 근거 중 두 가지만 다시 떠올려 볼까요?',
        fast: '우리 문장이 “주인이 세 번 바뀐 것”까지 설명하나요?'
      },
      history: {
        slow: '내가 고른 생각과 학자들이 보는 방향은 어디가 같고 어디가 다른가요?',
        fast: '땅 하나로 나라의 힘을 다 설명할 수 있을까요?'
      }
    }
  },
  statement: {
    headings: {
      '5': {
        heading: '세 나라가 이 땅을 원한 까닭 설명하기',
        description: '친구들이 조사한 자료와 새 자료를 반영해, 왜 모두 이 땅을 가지려 했는지 한 문장으로 모둠에서 합의합니다.'
      },
      '10': {
        heading: '약속이 깨진 일까지 넣어 설명하기',
        description: '신라가 함께 되찾은 땅을 혼자 차지한 일까지 설명할 수 있는 문장으로, 모둠에서 합의합니다.'
      }
    },
    fields: [
      {
        key: 'reason',
        label: '가장 큰 까닭은',
        options: [
          { value: 'farm', text: '넓은 들에서 농사를 지을 수 있어서', sentence: '넓은 들에서 농사를 지을 수 있었기 때문이다' },
          { value: 'route', text: '강과 바다로 오갈 수 있어서', sentence: '강과 바다로 사람과 물자가 오갈 수 있었기 때문이다' },
          { value: 'china', text: '중국과 직접 만날 수 있어서', sentence: '중국과 직접 오갈 수 있었기 때문이다' },
          { value: 'several', text: '한 가지가 아니라 여러 까닭이 겹쳐서', sentence: '한 가지가 아니라 여러 까닭이 함께 있었기 때문이다' }
        ]
      },
      {
        key: 'evidence',
        label: '그 증거는',
        options: [
          { value: 'plain', text: '한강 둘레에 넓은 들이 있다', sentence: '한강 둘레에 넓은 들이 있다는 점' },
          { value: 'seaway', text: '한강이 서해로 이어진다', sentence: '한강이 서해로 이어진다는 점' },
          { value: 'peak', text: '차지한 나라가 그때마다 전성기를 맞았다', sentence: '이 땅을 차지한 나라가 그때마다 가장 강했다는 점' },
          { value: 'stele', text: '진흥왕이 그 땅에 비석을 세웠다', sentence: '진흥왕이 이 땅에 비석을 세워 남겼다는 점' }
        ]
      },
      {
        key: 'limit',
        label: '다만',
        options: [
          { value: 'strong', text: '그래서 이 땅을 가진 나라가 강했다', sentence: '그래서 이 땅을 가진 나라가 한동안 가장 강했다' },
          { value: 'notonly', text: '땅 하나로 나라의 힘을 다 설명할 수는 없다', sentence: '다만 땅 하나만으로 나라의 힘을 다 설명할 수는 없다' },
          { value: 'changed', text: '주인이 바뀐 까닭은 더 살펴봐야 한다', sentence: '다만 주인이 세 번이나 바뀐 까닭은 더 살펴봐야 한다' }
        ]
      }
    ],
    compose: function (parts) {
      return '세 나라가 한강 유역을 두고 다툰 것은 ' + parts[0] + '. 그 증거는 ' + parts[1] + '이다. ' + parts[2] + '.';
    }
  },
  compare: {
    unverifiableChoiceId: 'center',
    none: '내가 고른 생각과 학자들의 관점을 나란히 놓고, 어디가 같고 어디가 다른지 이야기해 봅시다.',
    unverifiable: '네 생각은 “{answer}”였구나. 위치가 가운데인 것도 맞습니다. 다만 학자들은 가운데라는 점 하나보다, 넓은 들과 바다로 나가는 길이 함께 있었다는 점을 더 크게 봅니다. 우리 모둠 자료 중 어떤 것이 그 설명과 이어지나요?',
    aligned: '네 생각은 “{answer}”였구나. 학자들이 보는 방향과 가깝습니다. 그런데 까닭이 하나뿐일까요? 우리 모둠이 조사한 것 중 그 생각을 뒷받침하는 자료를 두 가지만 말해 봅시다.'
  },
  sources: [
    {
      label: '국사편찬위원회 우리역사넷 · 교과서 용어 해설',
      url: 'https://contents.history.go.kr/front/tg/main.do'
    }
  ],
  documents: [
    { name: '4세기 · 백제', note: '근초고왕 때 한강 유역을 중심으로 가장 크게 뻗어 나갔습니다.' },
    { name: '5세기 · 고구려', note: '광개토대왕과 장수왕 때 남쪽으로 내려와 한강 유역을 차지했고, 백제는 도읍을 웅진(오늘날 공주)으로 옮겼습니다.' },
    { name: '6세기 · 신라', note: '진흥왕 때 한강 유역을 차지하고, 그곳에 비석을 세워 자기 땅임을 남겼습니다. 북한산 진흥왕 순수비가 그중 하나입니다.' }
  ]
};

window.CoopScenario = window.HanRiverScenario;
