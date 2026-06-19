'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import type { PokemonData, PokemonType } from '@/shared/types/pokemon';
import { toast } from 'sonner';
import { saveDeckAction } from '@/entities/trainer/api/deckActions';

import SearchBar from './SearchBar';
import PokemonGrid from './PokemonGrid';
import Pagination from './Pagination';
import FloatingButton from '@/app/(main)/pokedex/_components/FloatingButton';
import PokemonDetailModal from '@/shared/components/pokemon/PokemonDetailModal';
import HomeHeader from '@/shared/components/HomeHeader';
import DeckSidePanel from './DeckSidePanel';
import PokemonListCard from './PokemonListCard';

const ITEMS_PER_PAGE = 20;
const MAX_DECK_SIZE = 6;

type DexPageProps = {
  pokemons: PokemonData[];
  ownedDexIds: number[];
  packCount: number;
  initialDeckDexIds: number[];
  nickname?: string;
  avatarUrl?: string | null;
};

export default function DexPage({
  pokemons,
  ownedDexIds,
  packCount,
  initialDeckDexIds,
  nickname,
  avatarUrl,
}: DexPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [generations, setGenerations] = useState<string[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([] as PokemonType[]);
  const [page, setPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [isDeckPanelOpen, setIsDeckPanelOpen] = useState(() => searchParams.get('openDeck') === 'true');
  const [deckDexIds, setDeckDexIds] = useState<number[]>(initialDeckDexIds);
  const [dragPokemon, setDragPokemon] = useState<PokemonData | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('openDeck') === 'true') {
      router.replace('/pokedex');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onStart = (e: CustomEvent<PokemonData>) => {
      setDragPokemon(e.detail);
    };

    const onOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('pokemondexid')) return;
      const preview = dragPreviewRef.current;
      if (!preview) return;
      preview.style.left = `${e.clientX}px`;
      preview.style.top = `${e.clientY}px`;
      const overSlot = document.elementsFromPoint(e.clientX, e.clientY).some((el) => el.hasAttribute('data-deck-slot'));
      preview.style.transform = `translate(-50%, -50%) scale(${overSlot ? 0.3 : 0.55})`;
    };

    const onEnd = () => setDragPokemon(null);

    window.addEventListener('pokemon-drag-start', onStart as EventListener);
    window.addEventListener('dragover', onOver);
    document.addEventListener('dragend', onEnd, { capture: true });
    return () => {
      window.removeEventListener('pokemon-drag-start', onStart as EventListener);
      window.removeEventListener('dragover', onOver);
      document.removeEventListener('dragend', onEnd, { capture: true });
    };
  }, []);

  const handleAddToDeck = useCallback(
    (pokemon: PokemonData) => {
      if (deckDexIds.includes(pokemon.dexId) || deckDexIds.length >= MAX_DECK_SIZE) return;
      const next = [...deckDexIds, pokemon.dexId];
      setDeckDexIds(next);
      saveDeckAction(next).catch(() => toast.error('덱 저장에 실패했습니다'));
    },
    [deckDexIds],
  );

  const handleRemoveFromDeck = useCallback(
    (dexId: number) => {
      const next = deckDexIds.filter((id) => id !== dexId);
      setDeckDexIds(next);
      saveDeckAction(next).catch(() => toast.error('덱 저장에 실패했습니다'));
    },
    [deckDexIds],
  );

  const handleAddToDeckById = useCallback(
    (dexId: number) => {
      const pokemon = pokemons.find((p) => p.dexId === dexId);
      if (pokemon) handleAddToDeck(pokemon);
    },
    [pokemons, handleAddToDeck],
  );

  const handleReorderDeck = useCallback((dexIds: number[]) => {
    setDeckDexIds(dexIds);
    saveDeckAction(dexIds).catch(() => toast.error('덱 저장에 실패했습니다'));
  }, []);

  const handleClearDeck = useCallback(() => {
    setDeckDexIds([]);
    saveDeckAction([]).catch(() => toast.error('덱 저장에 실패했습니다'));
  }, []);

  const deckPokemons = useMemo(
    () => deckDexIds.map((id) => pokemons.find((p) => p.dexId === id)).filter((p): p is PokemonData => Boolean(p)),
    [deckDexIds, pokemons],
  );

  const handleSetSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleSetGenerations = (value: string[]) => {
    setGenerations(value);
    setPage(1);
  };
  const handleSetTypes = (value: PokemonType[]) => {
    setTypes(value);
    setPage(1);
  };

  const filteredData = useMemo(
    () =>
      pokemons.filter((pokemon) => {
        if (showOwnedOnly && !ownedDexIds.includes(pokemon.dexId)) return false;
        const matchSearch = search === '' || pokemon.koName.includes(search);
        const matchGeneration =
          generations.length === 0 || generations.some((g) => pokemon.generation === Number(g.replace('세대', '')));
        const matchType = types.length === 0 || types.some((type) => pokemon.types.includes(type));
        return matchSearch && matchGeneration && matchType;
      }),
    [pokemons, ownedDexIds, showOwnedOnly, search, generations, types],
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      <HomeHeader nickname={nickname} avatarUrl={avatarUrl} />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col px-4 pt-[60px] pb-[60px]">
        <SearchBar
          search={search}
          setSearch={handleSetSearch}
          generations={generations}
          setGenerations={handleSetGenerations}
          types={types}
          setTypes={handleSetTypes}
          selectedPokemonCount={ownedDexIds.length}
          totalPokemonCount={pokemons.length}
        />

        {/* 소지 카드만 보기 토글 + 내 덱 관리 버튼 */}
        <div className="mt-5 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-base-1)' }}>
              보유한 포켓몬만 보기
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showOwnedOnly}
              onClick={() => {
                setShowOwnedOnly((prev) => !prev);
                setPage(1);
              }}
              className="relative h-6 w-11 rounded-full transition-colors duration-200"
              style={{ backgroundColor: showOwnedOnly ? 'var(--color-secondary-1)' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: showOwnedOnly ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </label>

          <button
            type="button"
            onClick={() => setIsDeckPanelOpen((prev) => !prev)}
            className="cursor-pointer rounded-full px-6 py-3 text-base font-bold transition-opacity duration-200"
            style={{
              backgroundColor: isDeckPanelOpen ? 'var(--color-secondary-1)' : '#F0F0F0',
              color: isDeckPanelOpen ? 'white' : 'var(--color-base-0)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isDeckPanelOpen ? '내 덱 편성 중...' : '내 덱 관리'}
          </button>
        </div>

        <div className="flex items-start" style={{ marginTop: '20px' }}>
          <div className="min-w-0 flex-1">
            <PokemonGrid
              data={pagedData}
              onSelect={setSelectedPokemon}
              ownedPokemonIds={ownedDexIds}
              isDeckMode={isDeckPanelOpen}
              deckDexIds={deckDexIds}
              onAddToDeck={handleAddToDeck}
              onRemoveFromDeck={handleRemoveFromDeck}
            />
          </div>
          {/* 사이드 패널 */}
          <div
            className="shrink-0 self-start"
            style={{
              position: 'sticky',
              top: '100px',
              width: isDeckPanelOpen ? '296px' : '0px',
              opacity: isDeckPanelOpen ? 1 : 0,
              overflow: 'clip',
              transition: 'width 0.3s ease-in-out, opacity 0.25s ease-in-out',
            }}
          >
            <div style={{ width: '296px', paddingLeft: '16px' }}>
              <DeckSidePanel
                deckPokemons={deckPokemons}
                onRemove={handleRemoveFromDeck}
                onAdd={handleAddToDeckById}
                onReorder={handleReorderDeck}
                onClear={handleClearDeck}
                onClose={() => setIsDeckPanelOpen(false)}
              />
            </div>
          </div>
        </div>
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />

        <PokemonDetailModal
          pokemon={selectedPokemon}
          isOpen={selectedPokemon !== null}
          onClose={() => setSelectedPokemon(null)}
        />

        <FloatingButton
          mode="card"
          cardPackCount={packCount}
          ownedCount={ownedDexIds.length}
          totalCount={pokemons.length}
        />
      </main>

      {/* 드래그 커스텀 프리뷰 */}
      {dragPokemon && (
        <div
          ref={dragPreviewRef}
          style={{
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none',
            width: '200px',
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%) scale(0.55)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <PokemonListCard pokemon={dragPokemon} owned={true} />
        </div>
      )}
    </div>
  );
}
