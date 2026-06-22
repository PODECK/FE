export type NewsCategory = 'notice' | 'maintenance' | 'event';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: string;
  date: string;
  publishedAt: string;
  thumbnailSrc: string;
  content: {
    intro: string[];
    summaryTitle: string;
    summaryItems: string[];
    closing: string[];
  };
  hasNewBadge?: boolean;
}

export const newsCategoryLabels: Record<NewsCategory, string> = {
  notice: '공지',
  maintenance: '점검',
  event: '이벤트',
};

export const newsCategoryStyles: Record<NewsCategory, { text: string; background: string }> = {
  notice: {
    text: '#787878',
    background: '#F0F0F0',
  },
  maintenance: {
    text: '#F27B11',
    background: '#FFF4E5',
  },
  event: {
    text: '#1F9254',
    background: '#EBF9F1',
  },
};

export const newsItems: NewsItem[] = [
  {
    id: 'season-2-patch-note',
    category: 'notice',
    title: '포덱 시즌 2 업데이트 패치노트',
    date: '26-05-29',
    publishedAt: '2026-05-29T10:00:00+09:00',
    thumbnailSrc: '/images/home/news/news1.svg',
    content: {
      intro: [
        '안녕하세요. PODECK 입니다.',
        '포덱 시즌 2 업데이트가 적용되어 신규 카드풀과 홈 화면 편의 기능이 확장되었습니다.',
        '주요 변경 사항은 아래 내용을 참고해 주시기 바랍니다.',
      ],
      summaryTitle: '포덱 시즌 2 업데이트 주요 내용',
      summaryItems: [
        '1세대부터 7세대까지 확장된 포켓몬 데이터 적용',
        'AI 추천 덱과 일일 미션 카드 보상 UI 개선',
        '홈 배너 자동 전환 및 새소식 게시판 추가',
      ],
      closing: ['앞으로도 더 안정적인 배틀 환경을 제공할 수 있도록 개선해 나가겠습니다.', '감사합니다.'],
    },
    hasNewBadge: true,
  },
  {
    id: 'hotfix-complete',
    category: 'maintenance',
    title: 'Hot-fix 점검 완료 안내',
    date: '26-05-29',
    publishedAt: '2026-05-29T09:30:00+09:00',
    thumbnailSrc: '/images/home/news/news2.svg',
    content: {
      intro: [
        '안녕하세요. PODECK 입니다.',
        '확인된 일부 오류 현상 수정을 위한 Hot-fix 패치가 완료되었습니다.',
        '자세한 사항은 아래 내용을 참고해 주시기 바랍니다.',
      ],
      summaryTitle: 'Hot-fix 패치 완료 안내',
      summaryItems: [
        '일시: 2026년 5월 29일(금) 09:00 ~ 10:30',
        '내용: 시즌 2 업데이트 이후 확인된 화면 정렬 및 서비스 안정화',
      ],
      closing: [
        'PODECK은 보다 쾌적한 배틀 환경을 제공하기 위해 지속적으로 서비스를 개선해 나가겠습니다.',
        '감사합니다.',
      ],
    },
    hasNewBadge: true,
  },
  {
    id: 'generation-expansion-event',
    category: 'event',
    title: '포켓몬 세대 확장 기념 이벤트',
    date: '26-05-27',
    publishedAt: '2026-05-27T14:00:00+09:00',
    thumbnailSrc: '/images/home/news/news1.svg',
    content: {
      intro: [
        '포켓몬 세대 확장을 기념하여 특별 이벤트가 진행됩니다.',
        '이벤트 기간 동안 미션을 완료하면 추가 카드팩 보상을 받을 수 있습니다.',
      ],
      summaryTitle: '이벤트 안내',
      summaryItems: ['기간: 2026년 5월 27일 ~ 2026년 6월 9일', '보상: 일일 미션 완료 시 카드팩 추가 지급'],
      closing: ['새롭게 확장된 포켓몬들과 함께 더 다양한 덱을 완성해 보세요.'],
    },
  },
  {
    id: 'deck-recommend-open',
    category: 'notice',
    title: 'AI 추천 덱 베타 기능 오픈 안내',
    date: '26-05-24',
    publishedAt: '2026-05-24T11:00:00+09:00',
    thumbnailSrc: '/images/home/news/news2.svg',
    content: {
      intro: [
        'AI 추천 덱 베타 기능이 홈 화면에 추가되었습니다.',
        '보유한 포켓몬과 전략 유형에 맞춰 추천 덱을 확인할 수 있습니다.',
      ],
      summaryTitle: 'AI 추천 덱 베타 안내',
      summaryItems: ['최적 추천덱과 상태이상 추천덱 제공', '추천 결과 새로고침 쿨다운 적용'],
      closing: ['베타 기간 동안 추천 품질은 계속 조정될 예정입니다.'],
    },
  },
  {
    id: 'battle-balance-maintenance',
    category: 'maintenance',
    title: '배틀 밸런스 조정 점검 안내',
    date: '26-05-21',
    publishedAt: '2026-05-21T08:00:00+09:00',
    thumbnailSrc: '/images/home/news/news1.svg',
    content: {
      intro: ['배틀 밸런스 조정을 위한 점검이 진행됩니다.', '점검 시간 동안 일부 배틀 기능 이용이 제한될 수 있습니다.'],
      summaryTitle: '점검 안내',
      summaryItems: ['일시: 2026년 5월 21일(목) 08:00 ~ 09:00', '내용: 타입별 기술 계수 및 보상 밸런스 조정'],
      closing: ['점검 완료 후 더 안정적인 환경으로 찾아뵙겠습니다.'],
    },
  },
  {
    id: 'daily-mission-event',
    category: 'event',
    title: '일일 미션 보상 강화 이벤트',
    date: '26-05-18',
    publishedAt: '2026-05-18T12:00:00+09:00',
    thumbnailSrc: '/images/home/news/news2.svg',
    content: {
      intro: ['일일 미션 보상 강화 이벤트가 시작됩니다.', '기간 내 미션을 완료하고 더 많은 카드팩을 획득해 보세요.'],
      summaryTitle: '보상 강화 안내',
      summaryItems: ['출석 체크 완료 시 상자팩 지급', '배틀 승리 미션 완료 시 카드팩 지급량 증가'],
      closing: ['매일 새로운 미션으로 덱 성장의 기회를 놓치지 마세요.'],
    },
  },
];

export const getNewsItemById = (id: string): NewsItem | undefined => {
  return newsItems.find((item) => item.id === id);
};

export const latestHomeNewsItems = newsItems.slice(0, 2);

export const newsTabs = [
  { label: '전체', value: 'all' },
  { label: '공지', value: 'notice' },
  { label: '점검', value: 'maintenance' },
  { label: '이벤트', value: 'event' },
] as const;

export type NewsTabValue = (typeof newsTabs)[number]['value'];

export const isNewsTabValue = (value: string | undefined): value is NewsTabValue => {
  return newsTabs.some((tab) => tab.value === value);
};
