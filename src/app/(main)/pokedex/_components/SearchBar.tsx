import Image from 'next/image';
import { useState } from 'react';
import { PokemonType } from '@/shared/types/pokemon';
import { TYPE_CONFIG } from '@/app/(main)/pokedex/_constants/pokemon-type';

type Props = {
  search: string;
  setSearch: (value: string) => void;
  generations: string[];
  setGenerations: (value: string[]) => void;
  types: PokemonType[];
  setTypes: (value: PokemonType[]) => void;
  selectedPokemonCount: number;
};

const generationOptions = ['1세대', '2세대', '3세대', '4세대'];
const TypeOptions = PokemonType.options;
const TOTAL_POKEMON = 493;

export default function SearchBar({
  search,
  setSearch,
  generations,
  setGenerations,
  types,
  setTypes,
  selectedPokemonCount,
}: Props) {
  const [tempSearch, setTempSearch] = useState(search);
  const [tempGenerations, setTempGenerations] = useState(generations);
  const [tempTypes, setTempTypes] = useState(types);

  const handleSearch = () => {
    setSearch(tempSearch);
    setGenerations(tempGenerations);
    setTypes(tempTypes);
  };

  const handleReset = () => {
    setTempSearch('');
    setTempGenerations([]);
    setTempTypes([]);
    setSearch('');
    setGenerations([]);
    setTypes([]);
  };

  return (
    <div className="rounded-3xl bg-[#f9f9f9]" style={{ padding: '30px' }}>
      <div className="mb-6 flex items-center justify-between">
        {/* 검색창 */}
        <div className="flex items-center gap-[10px]" style={{ maxWidth: '700px', width: '100%' }}>
          <label htmlFor="pokemon-search" className="sr-only">
            포켓몬 이름 검색
          </label>
          <input
            id="pokemon-search"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#DEDEDE')}
            placeholder="포켓몬 이름을 입력하세요"
            className="flex-1 rounded-full border bg-white px-5 outline-none"
            style={{ height: '40px', borderColor: '#DEDEDE' }}
          />
          <button
            onClick={handleSearch}
            className="shrink-0 cursor-pointer rounded-full font-bold text-white transition-opacity duration-200"
            style={{
              height: '40px',
              padding: '0 30px',
              backgroundColor: 'var(--color-primary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            검색
          </button>
          <button
            onClick={handleReset}
            className="shrink-0 cursor-pointer rounded-full font-bold text-white transition-opacity duration-200"
            style={{
              height: '40px',
              padding: '0 25px',
              backgroundColor: 'var(--color-secondary-1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            초기화
          </button>
        </div>

        {/* 보유 포켓몬 카드 수 */}
        <div className="flex shrink-0 items-center gap-1" style={{ marginRight: '20px' }}>
          <Image
            src="/images/pokedex/deck-icon.svg"
            alt="보유 포켓몬 수"
            width={17}
            height={20}
            style={{ marginRight: '3px' }}
            unoptimized
          />
          <span className="text-lg font-extrabold" style={{ color: 'var(--color-primary)' }}>
            {selectedPokemonCount}
          </span>
          <span className="text-lg font-semibold" style={{ color: 'var(--color-base-1)' }}>
            / {TOTAL_POKEMON}
          </span>
        </div>
      </div>

      {/* 세대 */}
      <div className="mb-4 flex items-center gap-5">
        <p className="shrink-0 text-sm font-bold" style={{ color: '#666' }}>
          세대
        </p>
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {generationOptions.map((item) => (
            <button
              key={item}
              aria-pressed={tempGenerations.includes(item)}
              onClick={() => {
                setTempGenerations((prev) => {
                  if (prev.includes(item)) {
                    return prev.filter((g) => g !== item);
                  }
                  return [...prev, item];
                });
              }}
              className="rounded-full border"
              style={{
                fontSize: '13px',
                padding: '5px 15px',
                color: tempGenerations.includes(item) ? 'white' : '#666',
                backgroundColor: tempGenerations.includes(item) ? 'var(--color-secondary-1)' : 'transparent',
                borderColor: tempGenerations.includes(item) ? 'var(--color-secondary-1)' : '#DEDEDE',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 타입 */}
      <div className="flex items-center gap-5">
        <p className="shrink-0 text-sm font-bold" style={{ color: '#666' }}>
          타입
        </p>
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {TypeOptions.map((item) => (
            <button
              key={item}
              aria-pressed={tempTypes.includes(item)}
              onClick={() => {
                setTempTypes((prev) => {
                  if (prev.includes(item)) {
                    return prev.filter((t) => t !== item);
                  }
                  return [...prev, item];
                });
              }}
              className="rounded-full border"
              style={{
                fontSize: '13px',
                padding: '5px 15px',
                color: tempTypes.includes(item) ? 'white' : '#666',
                backgroundColor: tempTypes.includes(item) ? 'var(--color-secondary-1)' : 'transparent',
                borderColor: tempTypes.includes(item) ? 'var(--color-secondary-1)' : '#DEDEDE',
              }}
            >
              {TYPE_CONFIG[item].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
