'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import { pullGacha, saveGachaResult } from '@/app/(main)/pokedex/_lib/cardGacha';
import GachaLoading from './GachaLoading';
import GachaReveal from './GachaReveal';
import GachaResult from './GachaResult';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  packCount: number;
};

type Step = 1 | 2 | 3;

export default function CardGachaModal({ isOpen, onClose, packCount }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [cards, setCards] = useState<GachaCard[]>([]);

  if (!isOpen) return null;

  const handlePull = () => {
    try {
      const result = pullGacha();
      saveGachaResult(result);
      setCards(result);
    } catch {
      setCards([]);
      setStep(1);
    }
  };

  const handlePullAgain = () => {
    setCards([]);
    setStep(1);
  };

  const handleClose = () => {
    setCards([]);
    setStep(1);
    onClose();
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
        style={{ width: 720, height: 640 }}
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
        {packCount === 0 && step === 1 && cards.length === 0 ? (
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
            {step === 1 && <GachaLoading onPull={handlePull} onComplete={() => setStep(2)} />}
            {step === 2 && <GachaReveal cards={cards} onComplete={() => setStep(3)} />}
            {step === 3 && (
              <GachaResult cards={cards} packCount={packCount} onPullAgain={handlePullAgain} onClose={handleClose} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
