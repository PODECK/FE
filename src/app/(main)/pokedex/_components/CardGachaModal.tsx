'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import { pullGachaAction } from '@/app/(main)/pokedex/_lib/gachaActions';
import GachaLoading from './GachaLoading';
import GachaReveal from './GachaReveal';
import GachaResult from './GachaResult';
import { useOverlayStore } from '@/shared/stores/overlay-store';

type Props = {
  packCount: number;
  ownedCount: number;
  totalCount: number;
};

type Step = 1 | 2 | 3;

export default function CardGachaModal({ packCount, ownedCount, totalCount }: Props) {
  const router = useRouter();
  const { isGachaOpen } = useOverlayStore((state) => state);
  const { closeGacha } = useOverlayStore((state) => state.actions);

  const [step, setStep] = useState<Step>(1);
  const [cards, setCards] = useState<GachaCard[]>([]);
  const [localPackCount, setLocalPackCount] = useState(packCount);
  const [runningOwnedCount, setRunningOwnedCount] = useState(ownedCount);
  const [ownedCountBefore, setOwnedCountBefore] = useState(ownedCount);

  const handleClose = useCallback(() => {
    setCards([]);
    setStep(1);
    closeGacha();
    router.refresh();
  }, [closeGacha, router]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isGachaOpen) {
      setLocalPackCount(packCount);
      setRunningOwnedCount(ownedCount);
      setOwnedCountBefore(ownedCount);
      setStep(1);
      setCards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGachaOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isGachaOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGachaOpen, handleClose]);

  const isEmptyPackState = localPackCount === 0 && step === 1 && cards.length === 0;

  if (!isGachaOpen) return null;

  const handlePull = async () => {
    setOwnedCountBefore(runningOwnedCount);
    const result = await pullGachaAction();
    if (!result.ok) {
      throw new Error(result.message);
    }
    setCards(result.cards);
    const newCount = result.cards.filter((c) => c.isNew).length;
    setRunningOwnedCount((prev) => prev + newCount);
    setLocalPackCount((prev) => Math.max(0, prev - 1));
  };

  const handlePullAgain = () => {
    setCards([]);
    setStep(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-gacha-modal-title"
      style={{ backgroundColor: 'var(--color-dimmed)' }}
      onClick={handleClose}
    >
      <div
        className="relative flex flex-col rounded-[20px] border-4 border-[var(--color-base-1)] bg-white p-8"
        style={{ width: 720, height: 650 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-6">
          <h2
            id="card-gacha-modal-title"
            className="text-lg leading-none font-bold"
            style={{ color: 'var(--color-base-0)' }}
          >
            카드 뽑기
          </h2>
        </div>

        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="absolute top-6 right-6 cursor-pointer text-[var(--color-base-1)] transition-opacity duration-200 hover:opacity-70"
        >
          <X size={36} strokeWidth={1.8} />
        </button>

        {/* 보유 카드팩 없을 때 */}
        {isEmptyPackState ? (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <AlertCircle size={52} style={{ color: '#ccc' }} className="mb-2" />
              <p className="text-3xl font-bold" style={{ color: 'var(--color-base-0)' }}>
                보유한 카드팩이 없어요
              </p>
              <p className="text-lg" style={{ color: '#666666' }}>
                배틀에서 승리해 카드팩을 획득해보세요!
              </p>
            </div>
            <div className="flex justify-center py-[40px]">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 hover:opacity-70"
                style={{ width: 180, height: 65, backgroundColor: 'var(--color-base-2)', color: 'var(--color-base-0)' }}
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            {step === 1 && (
              <GachaLoading onPull={handlePull} onComplete={() => setStep(2)} packCount={localPackCount} />
            )}
            {step === 2 && <GachaReveal cards={cards} onComplete={() => setStep(3)} />}
            {step === 3 && (
              <GachaResult
                cards={cards}
                packCount={localPackCount}
                ownedCountBefore={ownedCountBefore}
                ownedCountAfter={ownedCountBefore + cards.filter((c) => c.isNew).length}
                totalCount={totalCount}
                onPullAgain={handlePullAgain}
                onClose={handleClose}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
