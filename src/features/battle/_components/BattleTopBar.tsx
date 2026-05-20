'use client';

// 배틀 화면 상단 바 — 탑 층수, AI 플레이어 정보, 설정 메뉴 표시

import Image from 'next/image';
import { TOWER_FLOORS } from '@/shared/config/tower-floors';
import { SoundSettingsDropdown } from '@/shared/components/SoundSettingsDropdown';

type AiPokemonStatus = { dexId: number; types: string[]; fainted: boolean };

interface Props {
  currentFloor: number;
  aiPokemon: AiPokemonStatus[];
}

export default function BattleTopBar({ currentFloor, aiPokemon }: Props) {
  const floorConfig = TOWER_FLOORS.find((f) => f.floor === currentFloor) ?? TOWER_FLOORS[0]!;

  const handleGoHome = () => {
    window.dispatchEvent(new CustomEvent('battle:confirm-quit'));
  };

  return (
    <div className="absolute top-0 right-0 left-0 z-20">
      {/* 좌측 상단: 탑 층수 배경 + 동적 층수 표시 */}
      <div className="absolute top-0 left-0 h-[46px] w-[244px]">
        <Image src="/Top_Floor.svg" alt="top floor" width={244} height={46} />

        {/* 층수 오버레이 */}
        <div className="absolute inset-0 flex -translate-x-2 items-center justify-center">
          <span className="text-[24px] leading-none font-black text-[var(--color-base-3)]">
            무한의 탑 {currentFloor}층
          </span>
        </div>
      </div>

      {/* 우측 상단: AI NickName 바 */}
      <div className="absolute top-3 right-[69px] z-[2] h-[46px] w-[244px] overflow-hidden rounded-xl bg-[rgb(8,20,52)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] leading-none font-black text-[var(--color-base-3)]">
            {floorConfig.challengerName}
          </span>
        </div>
      </div>

      {/* 설정 버튼 + 드롭다운 (배틀 전용: 홈으로) */}
      <SoundSettingsDropdown
        theme="dark"
        className="absolute top-3 right-4 z-[3]"
        menuFooter={({ closeMenu }) => (
          <>
            <div className="mx-4 h-px bg-[var(--color-base-3)]/8" />

            <button
              type="button"
              className="block w-full cursor-pointer border-0 bg-transparent px-5 py-4 text-center text-[15px] font-black text-[rgba(255,100,80,1)] hover:bg-[var(--color-base-3)]/5"
              onClick={() => {
                closeMenu();
                handleGoHome();
              }}
            >
              홈으로
            </button>
          </>
        )}
      />

      {/* AI 트레이너 카드 — NickName 바 아래 중앙 겹쳐서 배치 */}
      <div className="absolute top-[35px] right-[101px] z-[1] h-[68px] w-[180px] overflow-hidden rounded-xl bg-[rgba(8,20,52,0.36)]">
        <div className="absolute top-[11px] left-[11px] text-[9px] font-black text-[var(--color-base-3)]/45">
          {currentFloor}층 도전자
        </div>

        {aiPokemon.length > 0 && (
          <div className="absolute top-[33px] left-0 flex w-full items-center justify-center gap-[6px] text-[13px] font-bold text-[var(--color-base-3)]/48">
            <Image src="/images/home/pokeball.svg" alt="" width={18} height={18} />
            <span>
              포켓몬 {aiPokemon.filter((pokemon) => !pokemon.fainted).length}/{aiPokemon.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
