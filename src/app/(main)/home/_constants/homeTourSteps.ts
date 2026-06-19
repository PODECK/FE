export const HOME_TOUR_STORAGE_KEY = 'podeck.home-tour.v1';

export type HomeTourPlacement = 'top' | 'bottom' | 'left' | 'right';

export const homeTourSteps = [
  {
    id: 'mission',
    targetId: 'home-mission',
    title: '오늘의 미션',
    description: '매일 갱신되는 미션을 완료하고 보상을 받을 수 있어요.',
    placement: 'right',
  },
  {
    id: 'history',
    targetId: 'home-history',
    title: '배틀 히스토리',
    description: '최근 배틀 기록과 승패를 빠르게 확인할 수 있어요.',
    placement: 'top',
  },
  {
    id: 'trainer',
    targetId: 'home-trainer-status',
    title: '트레이너 정보',
    description: '카드팩, 탑 진행도, 배틀 전적을 확인할 수 있어요.',
    placement: 'left',
  },
  {
    id: 'recommend',
    targetId: 'home-ai-recommend',
    title: '오늘의 추천덱',
    description: 'AI가 추천하는 덱을 바로 사용해볼 수 있어요.',
    placement: 'left',
  },
  {
    id: 'actions',
    targetId: 'home-action-cards',
    title: '도감 & 배틀',
    description: '포켓몬 도감을 보거나 배틀을 시작할 수 있어요.',
    placement: 'top',
  },
  {
    id: 'nav',
    targetId: 'home-navigation',
    title: '네비게이션',
    description: '홈, 새소식, 도감, 배틀 페이지로 이동할 수 있어요.',
    placement: 'bottom',
  },
  {
    id: 'profile',
    targetId: 'trainer-profile-menu',
    title: '프로필 설정',
    description: '닉네임, 프로필 이미지, 로그아웃을 관리할 수 있어요.',
    placement: 'bottom',
  },
  {
    id: 'news',
    targetId: 'home-news',
    title: '새소식',
    description: '새로운 소식들을 확인해볼 수 있어요',
    placement: 'top',
  },
  {
    id: 'chat',
    targetId: 'ai-chat',
    title: 'AI 챗봇',
    description: 'AI 챗봇과 대화하며 덱을 구성해보세요.',
    placement: 'top',
  },
] as const;

export type HomeTourStep = (typeof homeTourSteps)[number];
