'use client';

import { hasTrainer } from '@/utils/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Image from 'next/image';
import Typewriter from 'typewriter-effect';
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
        <div className="flex w-full justify-center">
          <Image
            src="/images/podeck-logo.svg"
            alt="logo"
            width={493}
            height={96}
            className="h-auto w-[320px] sm:w-[493px]"
            priority
          />
        </div>
        <div className="h-10 w-[547px] pt-3 text-center font-['Pixelify_Sans'] text-xl leading-8 font-medium tracking-[15px] text-neutral-500">
          Battle Ascent TCG
        </div>
      </div>

      {/* 카드 뒤 뿌연 효과 & 간단한 소개 글*/}
      <div className="relative mb-5 w-full">
        <div className="absolute -inset-2 rounded-[20px] bg-white opacity-30" />
        <div className="relative overflow-hidden rounded-[13px] border border-white bg-white p-6">
          <div className="text-center text-lg leading-relaxed font-semibold whitespace-pre-line text-black">
            <Typewriter
              options={{
                strings: ['트레이너가 되어 당신만의\n포켓몬과 모험을 시작해보세요!'],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 50,
                cursor: '|',
              }}
            />
          </div>
          {/* 우측 하단 깜빡이는 삼각형 */}
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="pointer-events-none absolute right-5 bottom-4 h-0 w-0 border-x-[8px] border-t-[13px] border-x-transparent border-t-[#FBBF24]"
          />
        </div>
      </div>

      {/* 카드 */}
      <div className="relative mt-3 mb-5 w-full">
        <div className="absolute -inset-2 rounded-[20px] bg-white opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full overflow-hidden rounded-[13px] border border-white bg-white p-6 backdrop-blur-md"
        >
          <div className="relative z-10">
            <label className="mb-2 block text-sm font-bold text-black">닉네임</label>

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
              className="text-l mt-4 h-12 w-full rounded-xl bg-[#FFB41D] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              모험 시작하기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
