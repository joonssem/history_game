window.GojoseonLawScenario = {
  id: 'gojoseon-law-v01',
  title: '고조선 8조법: 우리 마을의 첫 번째 법',
  teamCount: 5,
  teamSizeOptions: [3, 4, 5],
  roles: [
    {
      id: 'farmer',
      icon: '🌾',
      name: '농사짓는 사람',
      privateInfo: '지난달에도 곡식이 사라졌습니다. 겨울 식량이 부족해질 수 있습니다.',
      interest: '재산과 마을의 겨울 식량을 지키고 싶습니다.',
      shareText: '내 정보에는 지난달에도 곡식이 사라졌다는 내용이 있어. 재산과 겨울 식량을 지킬 법이 필요해.'
    },
    {
      id: 'hunter',
      icon: '🏹',
      name: '사냥하는 사람',
      privateInfo: '예전에 잘못된 의심 때문에 억울하게 비난받은 사람이 있었습니다.',
      interest: '확실한 근거 없이 사람을 벌하지 않았으면 합니다.',
      shareText: '내 정보에는 예전에 억울하게 의심받은 사람이 있었다고 나와 있어. 함부로 처벌하면 안 돼.'
    },
    {
      id: 'elder',
      icon: '🪵',
      name: '마을 어른',
      privateInfo: '최근 도둑질뿐 아니라 마을 사람들 사이의 싸움도 늘었습니다.',
      interest: '개인의 사건을 넘어 마을 전체의 질서를 세우고 싶습니다.',
      shareText: '내 정보에는 도둑질과 싸움이 함께 늘었다고 나와 있어. 마을 전체에 적용할 규칙이 필요해.'
    },
    {
      id: 'family-helper',
      icon: '🫶',
      name: '어려운 가족을 아는 사람',
      privateInfo: '붙잡힌 사람의 가족은 며칠째 제대로 먹지 못하고 있습니다.',
      interest: '잘못을 살피되 어려운 사정도 함께 확인하고 싶습니다.',
      shareText: '내 정보에는 붙잡힌 사람의 가족이 며칠째 굶고 있다고 나와 있어. 사정도 함께 살펴야 해.'
    },
    {
      id: 'recorder',
      icon: '🪶',
      name: '마을 기록자',
      privateInfo: '사람마다 마을의 규칙을 다르게 기억해 같은 일이 생겨도 다툼이 반복되었습니다.',
      interest: '누구나 이해하고 다음에도 적용할 수 있는 분명한 문장을 남기고 싶습니다.',
      shareText: '내 정보에는 규칙을 다르게 기억해서 다툼이 반복된 적이 있다고 나와 있어. 누구나 이해할 수 있는 법을 남겨야 해.'
    }
  ],
  firstChoices: [
    { id: 'return', label: 'A', text: '훔친 곡식만 돌려준다' },
    { id: 'repay-more', label: 'B', text: '훔친 것보다 더 많이 갚게 한다' },
    { id: 'expel', label: 'C', text: '마을에서 내쫓는다' },
    { id: 'hearing', label: 'D', text: '피해와 사정을 살핀 뒤 마을 회의에서 결정한다' }
  ],
  smallTeamClue: {
    title: '3인 모둠 추가 단서',
    text: '붙잡힌 사람의 가족은 며칠째 제대로 먹지 못하고 있습니다. 잘못을 살피되 어려운 사정도 함께 확인해야 합니다.'
  },
  lawOptions: {
    target: [
      { value: '곡식', text: '곡식' },
      { value: '물건', text: '물건' }
    ],
    response: [
      { value: 'return', text: '돌려준다', sentence: '훔친 것을 돌려준다' },
      { value: 'repay-more', text: '더 많이 갚게 한다', sentence: '훔친 것보다 더 많이 갚게 한다' },
      { value: 'village-work', text: '마을 일을 하게 한다', sentence: '마을 일을 하게 한다' },
      { value: 'council', text: '마을 회의에서 판단한다', sentence: '마을 회의에서 판단한다' }
    ],
    condition: [
      { value: 'circumstances', text: '단, 피해와 사정을 확인한다', sentence: '단, 피해와 사정을 확인한다' },
      { value: 'repeat', text: '반복한 경우에는 더 무겁게 한다', sentence: '반복한 경우에는 더 무겁게 한다' },
      { value: 'none', text: '특별한 조건을 두지 않는다', sentence: '' }
    ]
  },
  extraMissions: [
    {
      icon: '🔍',
      title: '옆 모둠과 비교하기',
      text: '다른 모둠은 어떤 법을 만들었는지 조용히 물어보고, 우리 모둠 법과 다른 점을 한 가지 찾아보세요.'
    },
    {
      icon: '💬',
      title: '더 깊이 생각해보기',
      text: '실제 8조법에는 남의 물건을 훔치면 노비로 삼는다는 조항이 전해집니다. 우리 모둠이 이 조항에 동의하지 않는다면, 그 이유를 한 문장으로 정리해 보세요.'
    },
    {
      icon: '📜',
      title: '법 2조 상상해보기',
      text: '고조선에는 8개의 법이 있었다고 전해집니다. 도둑질이 아닌 다른 문제(예: 거짓말, 게으름, 다툼)를 다루는 법을 하나 더 상상해서 모둠에 말해 보세요.'
    }
  ],
  sources: [
    {
      label: '국사편찬위원회 사료 자료',
      url: 'https://contents.history.go.kr/front/hm/view.do?levelId=hm_001_0060&treeId=010101'
    },
    {
      label: '우리역사넷 8조법',
      url: 'https://contents.history.go.kr/mobile/tg/view.do?levelId=tg_001_0500&pageUnit=10&subjectCode=tg_age_10'
    },
    {
      label: '단군·홍익인간 자료',
      url: 'https://contents.history.go.kr/eh_kk/teach/notebook/data/04_d02.htm'
    }
  ]
};
