'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';
import Typewriter from 'typewriter-effect';

type Props = {
  onPull: () => void;
  onComplete: () => void;
};

type Phase = 'idle' | 'shaking' | 'opening';

export default function GachaLoading({ onPull, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
  }, []);

  const handlePull = () => {
    onPull();
    setPhase('shaking');
    t1.current = setTimeout(() => {
      setPhase('opening');
      t2.current = setTimeout(() => {
        onComplete();
      }, 1000);
    }, 2000);
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-12">
        {phase === 'idle' && (
          <p className="text-2xl font-bold" style={{ color: 'var(--color-base-0)' }}>
            카드팩을 열어볼까요?
          </p>
        )}

        <div className="relative" style={{ perspective: 1000, width: 160, height: 224 }}>
          {phase === 'idle' &&
            [
              { top: -10, left: -64, size: 56, delay: 0, duration: 2.0 },
              { top: -28, right: -54, size: 32, delay: 0.8, duration: 2.3 },
              { bottom: -30, left: -44, size: 40, delay: 1.4, duration: 1.9 },
              { bottom: -34, right: -34, size: 24, delay: 0.4, duration: 2.2 },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                style={{ top: s.top, bottom: s.bottom, left: s.left, right: s.right }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkle size={s.size} fill="#eee" stroke="none" />
              </motion.div>
            ))}
          <motion.div
            animate={
              phase === 'idle'
                ? { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }
                : phase === 'shaking'
                  ? { rotate: [0, 8, -8, 8, -8, 8, -8, 0], scale: [1, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1] }
                  : { rotate: 0, scale: 1 }
            }
            transition={
              phase === 'idle' ? { duration: 1.5, repeat: 1, ease: 'easeInOut' } : { duration: 1.2, ease: 'easeInOut' }
            }
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

        {phase !== 'idle' && (
          <div className="text-2xl font-bold" style={{ color: 'var(--color-base-0)' }}>
            <Typewriter
              options={{ loop: true, delay: 150, deleteSpeed: 80 }}
              onInit={(typewriter) => {
                typewriter
                  .typeString('카드팩을 여는 중')
                  .typeString('.')
                  .typeString('.')
                  .typeString('.')
                  .pauseFor(400)
                  .deleteChars(3)
                  .start();
              }}
            />
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <div className="flex justify-center py-[40px]">
          <button
            onClick={handlePull}
            className="rounded-xl text-lg font-bold"
            style={{ width: 180, height: 65, backgroundColor: 'var(--color-primary)', color: 'var(--color-base-3)' }}
          >
            뽑기
          </button>
        </div>
      )}

      <style>{`
        @keyframes hologram {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
