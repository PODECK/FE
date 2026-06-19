'use client';

import Image from 'next/image';
import Typewriter from 'typewriter-effect';
import DialogBox from '@/shared/components/DialogBox';
import { landingMessages } from '../_constants/messages';
import GoogleLoginButton from '@/app/(auth)/login/_components/GoogleLoginButton';

export default function LoginStep() {
  return (
    <section className="flex w-full max-w-md flex-col items-center">
      <div className="mb-10 text-center">
        <div className="flex w-full justify-center">
          <Image
            src="/images/shared/podeck-logo.svg"
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

      <DialogBox className="mb-5" contentClassName="min-h-24 text-center leading-6 whitespace-pre-line font-bold">
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

      <div className="relative mt-3 mb-5 w-full">
        <div className="relative z-10">
          <GoogleLoginButton />
        </div>
      </div>
    </section>
  );
}
