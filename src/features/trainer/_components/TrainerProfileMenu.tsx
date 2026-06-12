'use client';

import {
  signOutTrainer,
  updateTrainerProfile,
  deleteTrainerAccount,
} from '@/features/trainer/actions/trainerProfileActions';
import { ChevronDown, X, Camera, CheckCircle2, Trash2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { nicknameSchema } from '@/app/(main)/(start)/_schemas/nicknameSchema';

interface TrainerProfileMenuProps {
  nickname: string;
  avatarUrl?: string | null;
}

export default function TrainerProfileMenu({ nickname, avatarUrl }: TrainerProfileMenuProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [nextNickname, setNextNickname] = useState(nickname);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isPending, startTransition] = useTransition();

  const nicknameResult = nicknameSchema.safeParse(nextNickname);
  const hasProfileChange = nextNickname.trim() !== nickname || selectedAvatarFile !== null;
  const canSave = hasProfileChange && nicknameResult.success && !isPending;

  const inputStateClassName = message
    ? isSuccessMessage
      ? 'border-[var(--color-primary)]'
      : 'border-[#FF4D2E]'
    : !nicknameResult.success && nextNickname.trim().length > 0
      ? 'border-[#FF4D2E]'
      : 'border-[#E5E5E5]';

  const saveButtonClassName = canSave
    ? 'bg-[var(--color-primary)] text-[var(--color-base-3)]'
    : 'bg-[#FFD98A] text-[var(--color-base-3)] cursor-not-allowed';

  const avatarPreviewUrl = useMemo(() => {
    if (!selectedAvatarFile) return null;

    return URL.createObjectURL(selectedAvatarFile);
  }, [selectedAvatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const profileImageSrc = avatarPreviewUrl ?? avatarUrl ?? '/images/home/status/base_profile.svg';

  const handleSave = () => {
    if (!canSave) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('nickname', nextNickname);

      if (selectedAvatarFile) {
        formData.append('avatar', selectedAvatarFile);
      }

      const result = await updateTrainerProfile(formData);

      setMessage(result.message);
      setIsSuccessMessage(result.ok);

      if (result.ok) {
        toast.success('프로필이 수정되었어요!');
        setSelectedAvatarFile(null);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  const handleDeleteAccount = () => {
    const isConfirmed = window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.');

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteTrainerAccount();

      if (!result?.ok) {
        const errorMessage = result?.message ?? '회원 탈퇴에 실패했습니다.';

        setMessage(errorMessage);
        setIsSuccessMessage(false);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-[#F7F7F7] ring-3 ring-[#F4F4F4]">
          <Image src={profileImageSrc} alt="" fill className="object-cover" />
        </span>

        <span className="text-left">
          <span className="block max-w-[120px] truncate text-base font-extrabold text-[var(--color-base-0)]">
            {nickname}
          </span>
          <span className="block text-xs font-semibold text-[var(--color-primary)]">트레이너</span>
        </span>

        <ChevronDown aria-hidden="true" className="text-[#BDBDBD]" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] right-[-15px] z-50 w-[300px] rounded-[16px] bg-[var(--color-base-3)] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[var(--color-base-0)]">프로필 설정</h2>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="프로필 메뉴 닫기"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#999999] transition hover:bg-[#F1F1F1] hover:text-[var(--color-base-0)]"
            >
              <X aria-hidden="true" size={18} strokeWidth={2.3} />
            </button>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="relative h-[60px] w-[60px] overflow-hidden rounded-full bg-[#F7F7F7] ring-4 ring-[#F4F4F4]">
                <Image src={profileImageSrc} alt={`${nickname} 프로필 이미지`} fill className="object-cover" />
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute right-[-4px] bottom-[-2px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--color-base-3)] text-[var(--color-base-1)] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition hover:text-[var(--color-primary)]"
              >
                <Camera aria-hidden="true" size={15} strokeWidth={2.5} />
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  setSelectedAvatarFile(event.target.files?.[0] ?? null);

                  if (message) {
                    setMessage('');
                    setIsSuccessMessage(false);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          <label className="mt-3 block text-sm font-extrabold text-[var(--color-base-0)]">
            닉네임
            <input
              value={nextNickname}
              onChange={(event) => {
                setNextNickname(event.target.value);

                if (message) {
                  setMessage('');
                  setIsSuccessMessage(false);
                }
              }}
              className={cn(
                'mt-2 h-10 w-full rounded-[10px] border px-3 text-sm text-[var(--color-base-0)] transition outline-none focus:border-[var(--color-primary)]',
                inputStateClassName,
              )}
            />
          </label>

          {message ? (
            <p
              className={cn(
                'mt-1.5 flex items-center gap-1.5 text-xs font-bold',
                isSuccessMessage ? 'text-[#31A24C]' : 'text-[#FF4D2E]',
              )}
            >
              {isSuccessMessage ? (
                <CheckCircle2 aria-hidden="true" size={15} strokeWidth={2.5} />
              ) : (
                <XCircle aria-hidden="true" size={15} strokeWidth={2.5} />
              )}
              {message}
            </p>
          ) : !nicknameResult.success && nextNickname.trim().length > 0 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#FF4D2E]">
              <XCircle aria-hidden="true" size={15} strokeWidth={2.5} />
              {nicknameResult.error.issues[0]?.message ?? '닉네임을 확인해주세요'}
            </p>
          ) : (
            <p className="mt-1.5 text-xs font-semibold text-[#999999]">닉네임은 2자 이상이어야 합니다.</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'mt-3 h-9 w-full rounded-[8px] text-sm font-extrabold transition disabled:opacity-80',
              saveButtonClassName,
            )}
          >
            {isPending ? '저장 중...' : '저장하기'}
          </button>

          <button
            type="button"
            onClick={() => startTransition(() => signOutTrainer())}
            disabled={isPending}
            className="mt-2 h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white text-sm font-extrabold text-[#777777] transition hover:bg-[#F7F7F7] disabled:opacity-60"
          >
            로그아웃
          </button>

          <div className="mt-3 border-t border-[#EAEAEA] pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-[var(--color-base-0)]">회원 탈퇴</p>
                <p className="mt-0.5 text-xs font-semibold text-[#999999]">계정 삭제 시 복구할 수 없어요.</p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isPending}
                className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-[#FF4D2E] px-3 text-sm font-extrabold text-[#FF4D2E] transition hover:bg-[#FFF0EC]"
              >
                <Trash2 aria-hidden="true" size={15} strokeWidth={2.4} />
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
