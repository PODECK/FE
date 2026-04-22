'use client';

import { hasTrainer } from '@/utils/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';

// zod schema
const nicknameSchema = z
  .string()
  .trim()
  .min(1, '닉네임을 입력해주세요')
  .min(2, '닉네임은 2자 이상이어야 합니다')
  .max(12, '닉네임은 12자 이하여야 합니다')
  .regex(/^[가-힣a-zA-Z0-9]+$/, '한글, 영문, 숫자만 사용할 수 있습니다.');

export default function NicknameStep() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 이미 트레이너가 있다면
    if (hasTrainer()) {
      router.push('/home');
    }
  }, [router]);

  const handleSubmit = () => {
    const result = nicknameSchema.safeParse(nickname);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError('');
    console.log('유효한 닉네임 ', result.data);
  };

  return (
    <section className="flex w-full max-w-md flex-col items-center">
      {/* 타이틀 */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-[0.18em] text-yellow-300 drop-shadow-[0_0_18px_rgba(253,224,71,0.35)] sm:text-6xl">
          PODECK
        </h1>
        <p className="mt-2 text-sm tracking-[0.35em] text-blue-200 uppercase">choose your starter</p>

        {/* 스타터 색 힌트 */}
        <div className="mt-4 flex justify-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
          <div className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
          <div className="h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
        </div>
      </div>

      {/* 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full overflow-hidden rounded-[28px] rounded-tr-[65px] rounded-bl-[65px] border border-blue-300/30 bg-[#11193f]/70 p-6 shadow-[0_0_40px_rgba(0,180,255,0.12)] backdrop-blur-md"
      >
        {/* CRT 라인 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.12) 2px, rgba(34,211,238,0.12) 4px)',
          }}
        />

        {/* 포켓볼 장식 */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
          <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-white/15" />
          <div className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30 bg-white/10" />
        </div>

        {/* 스캔 바 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="scan-sweep absolute right-0 left-0 h-16" />
        </div>

        <div className="relative z-10">
          <p className="mb-4 text-sm leading-6 text-slate-300">
            트레이너 이름을 등록하고 <br />
            당신만의 스타팅 포켓몬과 모험을 시작하세요!
          </p>

          <label className="mb-2 block text-sm font-medium text-slate-200">닉네임</label>

          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="트레이너 이름을 입력하세요"
            maxLength={12}
            className="h-12 w-full rounded-xl border border-slate-500/40 bg-slate-100 px-4 text-sm text-slate-900 transition outline-none focus:border-yellow-300"
          />
          {/* 에러 */}
          <div className="mt-2 h-5">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-rose-400"
              >
                {error}
              </motion.p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={handleSubmit}
            disabled={!nickname.trim()}
            className="mt-4 h-12 w-full rounded-xl bg-linear-to-r from-yellow-300 via-amber-300 to-orange-300 text-sm font-bold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            모험 시작하기
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 mt-8 flex justify-center gap-2"
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.35, 1, 0.35],
              scale: [0.8, 1.35, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeInOut',
            }}
            className="h-2.5 w-2.5 rounded-full bg-linear-to-r from-yellow-200 to-red-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]"
          />
        ))}
      </motion.div>
    </section>
  );
}
