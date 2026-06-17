'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { typeLabelMap } from '@/app/(main)/(start)/build-deck/_constants/pokemon-type';
import {
  analyzeEntryDeck,
  copyCounterDeckToUser,
  loadEntryDeck,
  recommendCounterDeck,
  recommendTypeDeck,
  streamChatResponse,
} from '@/features/chat/actions';
import type { DeckSuggestion } from '@/features/chat/actions';
import AiDeckCard from '@/features/deck-recommendation/_components/AiDeckCard';
import { cn } from '@/shared/lib/cn';
import { useOverlayStore } from '@/shared/stores/overlay-store';
import { PokemonType } from '@/shared/types/pokemon';

import type { ChatDeckSlot, ChatMessage } from '@/shared/stores/overlay-store';

const TYPE_OPTIONS = PokemonType.options.map((type) => ({ type, label: typeLabelMap[type] ?? type }));

export default function ChatbotModal() {
  const { chatMessages } = useOverlayStore((state) => state);
  const currentFloor = useOverlayStore((state) => state.currentFloor ?? 1);
  const { closeChat, setChatMessages, updateLastAssistantMessage } = useOverlayStore((state) => state.actions);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deckLoading, setDeckLoading] = useState(true);
  const [entryReady, setEntryReady] = useState(false);
  const [entryHint, setEntryHint] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 챗봇이 열리면 등록 덱(pokedex_entries)을 미리 읽어 분석 칩 활성화 여부를 결정한다
  useEffect(() => {
    let active = true;
    loadEntryDeck().then((res) => {
      if (!active) return;
      setEntryReady(res.ok);
      if (!res.ok) setEntryHint(res.message);
      setDeckLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const busy = isPending || isTyping;

  function runSuggestion(userLabel: string, title: string, action: () => Promise<DeckSuggestion>) {
    if (busy) return;
    setPickerOpen(false);
    setChatMessages((prev) => [...prev, { role: 'user', content: userLabel }]);
    startTransition(async () => {
      const res = await action();
      setChatMessages((prev) =>
        res.ok
          ? [...prev, { role: 'assistant', content: res.explanation, title, deck: res.deck }]
          : [...prev, { role: 'assistant', content: res.message }],
      );
    });
  }

  function handleUseDeck(deck: ChatDeckSlot[]) {
    if (busy) return;
    startTransition(async () => {
      const res = await copyCounterDeckToUser(deck.map((d) => d.dexId));
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.success ? (res.message ?? '덱이 저장되었습니다.') : (res.error ?? '덱 저장에 실패했습니다.'),
        },
      ]);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...chatMessages, userMessage];

    setChatMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const textStream = await streamChatResponse(updatedMessages, currentFloor);

      for await (const textDelta of textStream) {
        updateLastAssistantMessage(textDelta);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '죄송합니다. 통신 오류가 발생했습니다. 다시 시도해 주세요.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className={cn(
        'border-base-2 bg-base-3 animate-fade-in-up fixed right-10 bottom-32 z-35 flex h-130 w-95 flex-col overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
      )}
    >
      {/* 헤더 */}
      <div className="border-base-2 flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-type-grass h-2.5 w-2.5 animate-pulse rounded-full" />
          <h3 className="text-base-0 text-sm font-bold">
            PODECK AI 조력자 <span className="text-primary">{currentFloor}F</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={closeChat}
          className="text-base-1 hover:text-secondary-1 text-xs font-semibold transition-colors"
        >
          접기
        </button>
      </div>

      {/* 메시지창 */}
      <div className="bg-base-2/50 flex-1 space-y-4 overflow-y-auto p-4">
        {chatMessages.map((message, index) => (
          <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            {message.deck ? (
              <div className="flex w-full flex-col gap-2">
                <AiDeckCard
                  badge="추천"
                  title={message.title ?? '추천 덱'}
                  description=""
                  deck={message.deck}
                  onUseDeck={() => handleUseDeck(message.deck ?? [])}
                  disabled={busy}
                />
                {message.content && (
                  <p className="text-base-0 px-1 text-sm leading-relaxed whitespace-pre-line">
                    {message.content.replace(/\*\*/g, '')}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-base-3 rounded-tr-none'
                    : 'border-base-2 bg-base-3 text-base-0 rounded-tl-none border',
                )}
              >
                {message.content.replace(/\*\*/g, '') || (
                  // 로딩 애니메이션
                  <div className="flex items-center justify-center gap-1 py-1">
                    <span className="bg-base-1 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-base-1 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                    <span className="bg-base-1 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 객관식 칩 영역 */}
      <div className="border-base-2 bg-base-3 border-t px-3 py-3">
        {deckLoading ? (
          <p className="text-base-1 text-center text-sm">현재 덱을 읽는 중입니다...</p>
        ) : pickerOpen ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-base-1 text-xs font-semibold">타입을 선택하세요</span>
              <button type="button" onClick={() => setPickerOpen(false)} className="text-base-1 text-xs font-semibold">
                뒤로
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {TYPE_OPTIONS.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    runSuggestion(`${label} 타입 덱 추천해줘`, `${label} 타입 덱`, () => recommendTypeDeck(type))
                  }
                  className="bg-base-2 text-base-0 hover:bg-primary hover:text-base-3 rounded-md py-1.5 text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-base-1 text-xs font-semibold">어떤 덱을 추천해드릴까요?</span>
            <div className="flex flex-wrap gap-1.5">
              <ChipButton
                disabled={busy}
                onClick={() =>
                  runSuggestion('이 층 카운터 덱 추천해줘', `${currentFloor}층 카운터 덱`, () =>
                    recommendCounterDeck(currentFloor),
                  )
                }
              >
                이 층 카운터 덱
              </ChipButton>
              <ChipButton disabled={busy} onClick={() => setPickerOpen(true)}>
                특정 타입 덱
              </ChipButton>
              <ChipButton
                disabled={busy || !entryReady}
                title={!entryReady ? entryHint : undefined}
                onClick={() =>
                  runSuggestion('내 등록 덱 분석해줘', '내 등록 덱 분석', () => analyzeEntryDeck(currentFloor))
                }
              >
                내 등록 덱 분석
              </ChipButton>
            </div>
          </div>
        )}
      </div>

      {/* 풋터 입력 바 (직접 입력) */}
      <form onSubmit={handleSubmit} className="border-base-2 bg-base-3 flex items-center gap-2 border-t p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'AI가 생각하는 중입니다...' : '직접 입력해 물어보기'}
          disabled={busy}
          className="bg-base-2 text-base-0 placeholder:text-base-1 focus:border-primary focus:bg-base-3 flex-1 rounded-xl border border-transparent px-4 py-2.5 text-sm transition-all focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="bg-primary text-base-3 h-10 w-11 shrink-0 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}

function ChipButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="border-base-2 text-base-0 hover:bg-primary hover:text-base-3 hover:border-primary rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
