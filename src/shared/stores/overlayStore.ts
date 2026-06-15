import { create } from 'zustand';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type OverlayState = {
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  currentFloor?: number;

  isGachaOpen: boolean;
};

type OverlayActions = {
  // 챗봇 관련 액션
  openChat: (floor?: number) => void;
  closeChat: () => void;
  toggleChat: (floor?: number) => void;
  setChatMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  updateLastAssistantMessage: (textDelta: string) => void;
  clearChat: () => void;

  // 카드 가챠 관련 액션
  openGacha: () => void;
  closeGacha: () => void;
};

type OverlayStore = OverlayState & {
  actions: OverlayActions;
};

export const useOverlayStore = create<OverlayStore>((set) => ({
  isChatOpen: false,
  chatMessages: [],
  currentFloor: 1,
  isGachaOpen: false,

  actions: {
    openChat: (floor) =>
      set((state) => {
        const targetFloor = floor ?? state.currentFloor ?? 1;
        return {
          isChatOpen: true,
          currentFloor: targetFloor,
          chatMessages:
            state.chatMessages.length === 0
              ? [
                  {
                    role: 'assistant',
                    content: `안녕하세요! PODECK 마스터님. 현재 도전 중이신 무한의 탑 [${targetFloor}층]의 배치 카드를 분석 중입니다. 저격 카운터 전략이 필요하시면 편하게 물어보세요!`,
                  },
                ]
              : state.chatMessages,
        };
      }),

    closeChat: () => set({ isChatOpen: false }),

    toggleChat: (floor) =>
      set((state) => {
        const nextOpen = !state.isChatOpen;
        const targetFloor = floor ?? state.currentFloor ?? 1;
        let nextMessages = state.chatMessages;

        if (nextOpen && nextMessages.length === 0) {
          nextMessages = [
            {
              role: 'assistant',
              content: `안녕하세요! PODECK 마스터님. 현재 도전 중이신 무한의 탑 [${targetFloor}층]의 배치 카드를 분석 중입니다. 저격 카운터 전략이 필요하시면 편하게 물어보세요!`,
            },
          ];
        }

        return {
          isChatOpen: nextOpen,
          currentFloor: targetFloor,
          chatMessages: nextMessages,
        };
      }),

    setChatMessages: (updater) =>
      set((state) => ({
        chatMessages: typeof updater === 'function' ? updater(state.chatMessages) : updater,
      })),

    updateLastAssistantMessage: (textDelta) =>
      set((state) => {
        const copy = [...state.chatMessages];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          last.content += textDelta;
        }
        return { chatMessages: copy };
      }),

    clearChat: () => set({ chatMessages: [] }),

    openGacha: () => set({ isGachaOpen: true }),
    closeGacha: () => set({ isGachaOpen: false }),
  },
}));
