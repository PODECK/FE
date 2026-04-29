'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TrainerData } from '../_types/trainer';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Typewriter from 'typewriter-effect';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { storageKeys } from '../_constants/key';
import { nicknameSchema } from '../_schemas/nicknameSchema';
import DialogBox from '@/shared/components/DialogBox';
import TextField from '@/shared/components/TextField';
import { landingMessages } from '../_constants/messages';

export default function NicknameStep() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const { setItem: setTrainerData } = useLocalStorage<TrainerData>(storageKeys.TRINER_DATA);

  const handleSubmit = () => {
    const result = nicknameSchema.safeParse(nickname);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const trainerData: TrainerData = {
      nickname: result.data,
      createdAt: new Date().toISOString(),
    };

    setTrainerData(trainerData);
    setError('');
    router.push('/loading');
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
        <div className="h-10 w-full max-w-[547px] pt-3 text-center font-['Roboto'] text-xl leading-8 font-medium tracking-[15px] text-neutral-500">
          Battle Ascent TCG
        </div>
      </div>

      {/* 카드 뒤 뿌연 효과 & 간단한 소개 글*/}
      <DialogBox className="mb-5" contentClassName="min-h-24 pr-14 text-center leading-8 whitespace-pre-line font-bold">
        <Typewriter
          options={{
            strings: [landingMessages.nicknameGuide],
            autoStart: true,
            loop: true,
            delay: 50,
            deleteSpeed: 50,
            cursor: '|',
          }}
        />
      </DialogBox>

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
            <TextField
              label="닉네임"
              type="text"
              autoFocus
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);

                if (error) {
                  setError('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder="트레이너 이름을 입력하세요"
              maxLength={12}
              error={error}
            />

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
