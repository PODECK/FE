'use client';

import { saveNickname } from '@/features/trainer/actions/trainerActions';
import { nicknameSchema } from '@/app/(main)/(start)/_schemas/nicknameSchema';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function NicknameForm() {
  const [nickname, setNickname] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const router = useRouter();

  const trimmedNickname = nickname.trim();

  const hasMinLength = trimmedNickname.length >= 2;
  const hasValidCharacters = /^[가-힣a-zA-Z0-9]+$/.test(trimmedNickname);

  const handleSubmit = () => {
    const parsed = nicknameSchema.safeParse(nickname);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '닉네임을 확인해주세요');
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveNickname(parsed.data);

        if (!result.ok) {
          setError(result.message);
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.replace('/build-deck');
      } catch {
        const message = '닉네임 저장 중 오류가 발생했습니다';
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <section className="flex w-full max-w-md flex-col items-center">
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
      <div className="relative mt-3 mb-5 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-[460px] overflow-hidden rounded-[18px] border-[6px] border-[#FFE07A] bg-[var(--color-base-3)] px-10 py-4"
        >
          <div className="flex flex-col items-center">
            <Image
              src="/images/silhouette.svg"
              alt="포켓볼"
              width={50}
              height={50}
              className="mb-3 rotate-45 opacity-20 brightness-0"
              priority
            />

            <h1 className="mb-6 text-center text-xl font-bold text-[var(--color-base-0)]">
              이름을 정하고 모험을 떠나보세요!
            </h1>

            <input
              type="text"
              autoFocus
              value={nickname}
              maxLength={12}
              placeholder="트레이너 이름을 입력하세요"
              onChange={(event) => {
                setNickname(event.target.value);

                if (error) {
                  setError('');
                }
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="h-12 w-full rounded-[8px] border border-[var(--color-primary)] px-4 text-base font-medium text-[var(--color-base-0)] outline-none placeholder:text-[var(--color-base-1)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />

            <div className="mt-4 flex w-full flex-col gap-2 text-[12px] font-semibold">
              <ValidationItem isValid={hasMinLength} text="닉네임은 2자 이상이어야 합니다." />
              <ValidationItem isValid={hasValidCharacters} text="한글, 영문, 숫자만 사용할 수 있어요." />
            </div>

            {error && <p className="mt-3 w-full text-left text-sm font-bold text-red-500">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              disabled={isPending || !trimmedNickname}
              onClick={handleSubmit}
              className="mt-6 mb-4 h-12 w-full rounded-[8px] bg-[var(--color-primary)] text-lg font-bold text-[var(--color-secondary-2)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '모험 시작하기'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type ValidationItemProps = {
  isValid: boolean;
  text: string;
};

function ValidationItem({ isValid, text }: ValidationItemProps) {
  const iconColor = isValid ? 'text-[var(--color-primary)]' : 'text-[#AAAAAA]';
  const borderColor = isValid ? 'border-[var(--color-primary)]' : 'border-[#AAAAAA]';
  const textColor = isValid ? 'text-[#787878]' : 'text-[#AAAAAA]';

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-[2px] ${borderColor} ${iconColor}`}
      >
        <Check size={9} strokeWidth={4.5} className="translate-y-[0.5px]" />
      </span>

      <span className={`text-sm leading-none font-bold ${textColor}`}>{text}</span>
    </div>
  );
}
