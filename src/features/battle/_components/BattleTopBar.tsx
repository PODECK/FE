'use client';

// 배틀 화면 상단 바 — 탑 층수, AI 플레이어 정보, 설정 메뉴 표시

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { TOWER_FLOORS } from '@/shared/config/tower-floors';
import { SoundController } from '@/shared/components/SoundController';

const NUNITO = { fontFamily: 'Nunito, sans-serif' } as const;

type AiPokemonStatus = { dexId: number; types: string[]; fainted: boolean };

interface Props {
  currentFloor: number;
  aiPokemon: AiPokemonStatus[];
}

export default function BattleTopBar({ currentFloor, aiPokemon }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const floorConfig = TOWER_FLOORS.find((f) => f.floor === currentFloor) ?? TOWER_FLOORS[0]!;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleGoHome = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('battle:confirm-quit'));
  };

  return (
    <div className="absolute top-0 right-0 left-0 z-20">
      {/* 좌측 상단: 탑 층수 배경 + 동적 층수 표시 */}
      <div className="absolute top-0 left-0" style={{ width: 244, height: 46 }}>
        <Image src="/Top_Floor.svg" alt="top floor" width={244} height={46} />
        {/* 층수 오버레이 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateX(-8px)',
          }}
        >
          <span className="text-[24px] leading-none font-black text-white" style={NUNITO}>
            무한의 탑 {currentFloor}층
          </span>
        </div>
      </div>

      {/* 우측 상단: AI NickName 바 */}
      <div className="absolute top-3 right-[69px] z-[2] h-[46px] w-[244px] overflow-hidden rounded-xl bg-[rgb(8,20,52)]">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-[15px] leading-none font-black text-white" style={NUNITO}>
            {floorConfig.challengerName}
          </span>
        </div>
      </div>

      {/* 설정 버튼 + 드롭다운 */}
      <div ref={menuRef} className="absolute top-3 right-4 z-[3]">
        <button
          className="pointer-events-auto flex h-[46px] w-[40px] cursor-pointer items-center justify-center rounded-xl border-0"
          style={{ background: menuOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)' }}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 20, lineHeight: 1 }}>⚙</span>
        </button>

        {menuOpen && (
          <div
            className="pointer-events-auto absolute top-[50px] right-0 overflow-hidden rounded-xl"
            style={{ width: 200, background: 'rgb(13,16,36)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
          >
            <SoundController />

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px' }} />
            <button
              className="block w-full border-0 bg-transparent px-5 py-4 text-center text-[15px] font-black hover:bg-white/5"
              style={{ ...NUNITO, color: 'rgba(255,100,80,1)' }}
              onClick={handleGoHome}
            >
              홈으로
            </button>
          </div>
        )}
      </div>

      {/* AI 트레이너 카드 — NickName 바 아래 중앙 겹쳐서 배치 */}
      <div className="absolute top-[35px] right-[101px] z-[1] h-[68px] w-[180px] overflow-hidden rounded-xl bg-[rgba(8,20,52,0.36)]">
        <div className="absolute top-[11px] left-[11px] text-[9px] font-black text-white/45" style={NUNITO}>
          {currentFloor}층 도전자
        </div>
        {aiPokemon.length > 0 && (
          <div
            className="absolute top-[33px] left-0 flex w-full items-center justify-center gap-[6px] text-[13px] font-bold text-white/[0.48]"
            style={NUNITO}
          >
            <Image src="/images/home/pokeball.svg" alt="" width={18} height={18} />
            <span>
              포켓몬 {aiPokemon.filter((p) => !p.fainted).length}/{aiPokemon.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
