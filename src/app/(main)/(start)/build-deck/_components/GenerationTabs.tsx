import type { Generation } from '@/app/(main)/(start)/build-deck/_types/pokemon';

type GenerationTab = {
  generation: Generation;
  label: string;
};

type GenerationTabsProps = {
  tabs: readonly GenerationTab[];
  activeGeneration: Generation;
  onSelectGeneration: (generation: Generation) => void;
};

export default function GenerationTabs({ tabs, activeGeneration, onSelectGeneration }: GenerationTabsProps) {
  return (
    <div className="grid w-[440px] grid-cols-4 rounded-full bg-[#F9F9F9] p-1">
      {tabs.map((tab) => {
        const isActive = tab.generation === activeGeneration;

        return (
          <button
            key={tab.generation}
            type="button"
            onClick={() => onSelectGeneration(tab.generation)}
            className={`h-12 cursor-pointer rounded-full text-lg font-bold transition ${
              isActive ? 'bg-[var(--color-secondary-1)] text-white' : 'text-[#999999]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
