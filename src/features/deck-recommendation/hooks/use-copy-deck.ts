'use client';

import { useTransition } from 'react';

import { toast } from 'sonner';

import { copyCounterDeckToUser } from '@/features/chat/actions';

type UseCopyDeckResult = {
  copyDeck: (dexIds: number[]) => void;
  isPending: boolean;
};

// 추천 덱(dex_id 배열)을 유저 덱으로 복사하고 결과를 토스트로 알린다.
// 챗봇·오늘의 추천 덱 양쪽에서 공용으로 사용한다.
export function useCopyDeck(): UseCopyDeckResult {
  const [isPending, startTransition] = useTransition();

  function copyDeck(dexIds: number[]) {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await copyCounterDeckToUser(dexIds);
        if (res.success) {
          toast.success(res.message ?? '덱이 복사되었습니다.');
        } else {
          toast.error(res.error ?? '덱 복사에 실패했습니다.');
        }
      } catch (error) {
        console.error(error);
        toast.error('덱 복사 중 알 수 없는 오류가 발생했습니다. 관리자에게 문의하세요.');
      }
    });
  }

  return { copyDeck, isPending };
}
