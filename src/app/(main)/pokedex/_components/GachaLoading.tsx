'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkle, PointerIcon } from 'lucide-react';
import Typewriter from 'typewriter-effect';

type Props = {
  onPull: () => Promise<void>;
  onComplete: () => void;
  packCount: number;
};

type Phase = 'idle' | 'shaking' | 'opening';

export default function GachaLoading({ onPull, onComplete, packCount }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
  }, []);

  const handlePull = async () => {
    if (phase !== 'idle') return;
    setPhase('shaking');
    setIsHovered(false);
    setError(null);
    try {
      await Promise.all([
        onPull(),
        new Promise<void>((resolve) => {
          t1.current = setTimeout(() => {
            setPhase('opening');
            t2.current = setTimeout(resolve, 1000);
          }, 2000);
        }),
      ]);
      onComplete();
    } catch {
      if (t1.current) {
        clearTimeout(t1.current);
        t1.current = null;
      }
      if (t2.current) {
        clearTimeout(t2.current);
        t2.current = null;
      }
      setPhase('idle');
      setError('뽑기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const cardAnimate =
    phase === 'idle' && !isHovered
      ? { y: 0, rotate: 0, scale: [1, 1.025, 1, 1.025, 1, 1] }
      : phase === 'idle' && isHovered
        ? { y: 0, rotate: [0, -5, 5, -5, 5, 0, 0], scale: 1 }
        : phase === 'shaking'
          ? { y: 0, rotate: [0, 8, -8, 8, -8, 8, -8, 0], scale: [1, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1] }
          : { y: 0, rotate: 0, scale: 1 };

  const cardTransition =
    phase === 'idle' && !isHovered
      ? { scale: { duration: 3.5, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.42, 1] } }
      : phase === 'idle' && isHovered
        ? {
            rotate: {
              duration: 2.4,
              repeat: Infinity,
              times: [0, 0.12, 0.28, 0.44, 0.6, 0.7, 1],
              ease: 'easeInOut' as const,
            },
          }
        : { duration: 1.2, ease: 'easeInOut' as const };

  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-center gap-5"
      style={phase !== 'idle' ? { marginTop: '-52px' } : undefined}
    >
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-[30px] font-bold" style={{ color: 'var(--color-base-0)' }}>
            카드팩을 열어볼까요?
          </p>
          <p className="text-lg" style={{ color: '#666666' }}>
            새로운 포켓몬이 기다리고 있어요!
          </p>
        </div>
      )}

      {/* 카드팩 버튼 */}
      <button
        type="button"
        onClick={handlePull}
        disabled={phase !== 'idle'}
        className={phase === 'idle' ? 'cursor-pointer' : 'cursor-default'}
        style={{ background: 'none', border: 'none', padding: 0 }}
        aria-label="카드팩 열기"
      >
        <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
          {/* 회전 광선 */}
          <div
            className="pointer-events-none absolute"
            style={{
              width: 320,
              height: 320,
              background:
                'repeating-conic-gradient(rgba(255, 235, 170, 0.22) 0deg, transparent 6deg, transparent 18deg, rgba(255, 235, 170, 0.22) 18deg)',
              animation: 'spin-slow 10s linear infinite',
              borderRadius: '50%',
              maskImage:
                'radial-gradient(circle, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.35) 72%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(circle, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.35) 72%, transparent 100%)',
            }}
          />
          {/* 중앙 글로우 */}
          <motion.div
            className="pointer-events-none absolute"
            animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 210,
              height: 210,
              background:
                'radial-gradient(circle, rgba(255, 248, 210, 1) 0%, rgba(255, 225, 140, 0.6) 35%, rgba(255, 205, 90, 0.18) 65%, transparent 85%)',
              borderRadius: '50%',
              filter: 'blur(24px)',
            }}
          />

          {/* 카드 + 스파클 */}
          <div className="relative" style={{ perspective: 1000, width: 160, height: 224 }}>
            {phase === 'idle' &&
              [
                { top: -10, left: -64, size: 52, delay: 0, duration: 2.0 },
                { top: -28, right: -54, size: 30, delay: 0.8, duration: 2.3 },
                { bottom: -30, left: -44, size: 38, delay: 1.4, duration: 1.9 },
                { bottom: -34, right: -34, size: 22, delay: 0.4, duration: 2.2 },
                { top: 35, left: -115, size: 20, delay: 0.6, duration: 2.1 },
                { top: 15, right: -105, size: 24, delay: 1.2, duration: 2.4 },
                { top: -18, left: -138, size: 14, delay: 0.2, duration: 2.3 },
                { top: -22, right: -125, size: 16, delay: 1.0, duration: 2.0 },
                { bottom: 38, left: -98, size: 12, delay: 1.7, duration: 2.1 },
                { bottom: 18, right: -112, size: 18, delay: 0.9, duration: 1.9 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute"
                  style={{ top: s.top, bottom: s.bottom, left: s.left, right: s.right }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkle size={s.size} fill="#FFF0C0" stroke="none" />
                </motion.div>
              ))}
            <motion.div
              animate={cardAnimate}
              transition={cardTransition}
              onHoverStart={() => {
                if (phase === 'idle') setIsHovered(true);
              }}
              onHoverEnd={() => setIsHovered(false)}
              className="relative flex items-center justify-center rounded-xl"
              style={{
                width: 160,
                height: 224,
                backgroundImage: 'linear-gradient(125deg, #ffc0e8, #ffd4a0, #a8f0e8, #d4a8f0, #ffc0e8)',
                backgroundSize: '300% 300%',
                animation: 'hologram 3s ease infinite',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                outline: '5px solid #EBEBEB',
              }}
            >
              <span className="text-6xl font-black text-white/80 select-none">?</span>
            </motion.div>
          </div>
        </div>
      </button>

      {/* 보유 카드팩 수 */}
      {phase === 'idle' && (
        <div className="flex items-center gap-2 rounded-full px-5 py-2.5" style={{ backgroundColor: '#F5F5F5' }}>
          <span className="text-sm" style={{ color: '#666' }}>
            보유 카드팩
          </span>
          <span className="font-bold" style={{ color: 'var(--color-base-0)' }}>
            {packCount}개
          </span>
        </div>
      )}

      {phase === 'idle' && (
        <motion.div
          className="flex items-center gap-1.5"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#aaa' }}
        >
          <PointerIcon size={15} />
          <span className="text-sm">카드팩을 클릭해보세요!</span>
        </motion.div>
      )}

      {error && phase === 'idle' && <p className="text-sm text-red-400">{error}</p>}

      {phase !== 'idle' && (
        <div className="text-2xl font-bold" style={{ color: 'var(--color-base-0)' }}>
          <Typewriter
            options={{ loop: false, delay: 150 }}
            onInit={(typewriter) => {
              typewriter.typeString('카드팩을 여는 중...').start();
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes hologram {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
