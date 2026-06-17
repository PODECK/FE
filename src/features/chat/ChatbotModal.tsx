'use client';

import { useEffect, useRef, useState } from 'react';

import { streamChatResponse } from '@/features/chat/actions';
import { cn } from '@/shared/lib/cn';
import { useOverlayStore } from '@/shared/stores/overlay-store';

import type { ChatMessage } from '@/shared/stores/overlay-store';

export default function ChatbotModal() {
  const { chatMessages } = useOverlayStore((state) => state);
  const currentFloor = useOverlayStore((state) => state.currentFloor ?? 1);
  const { closeChat, setChatMessages, updateLastAssistantMessage } = useOverlayStore((state) => state.actions);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

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
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 풋터 입력 바 */}
      <form onSubmit={handleSubmit} className="border-base-2 bg-base-3 flex items-center gap-2 border-t p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isTyping ? 'AI가 생각하는 중입니다...' : '카운터 카드 조합 물어보기'}
          disabled={isTyping}
          className="bg-base-2 text-base-0 placeholder:text-base-1 focus:border-primary focus:bg-base-3 flex-1 rounded-xl border border-transparent px-4 py-2.5 text-sm transition-all focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-primary text-base-3 h-10 w-11 shrink-0 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}
