import { Volume1, Volume2, VolumeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { useSoundStore } from '@/shared/stores/soundStore';
import { cn } from '@/shared/lib/cn';

export type SoundControllerTone = 'dark' | 'light';

function volumeIcon(volume: number, isMuted: boolean, iconClass: string) {
  if (isMuted || volume === 0) return <VolumeOffIcon className={iconClass} />;
  if (volume < 0.5) return <Volume1 className={iconClass} />;
  return <Volume2 className={iconClass} />;
}

interface VolumeSliderProps {
  label: string;
  volume: number;
  isMuted: boolean;
  tone: SoundControllerTone;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

function VolumeSlider({ label, volume, isMuted, tone, onVolumeChange, onMuteToggle }: VolumeSliderProps) {
  const displayPct = Math.round(volume * 100);
  const isDark = tone === 'dark';
  const iconClass = isDark ? 'text-white' : 'text-gray-700';
  const labelClass = isDark ? 'text-white/50' : 'text-gray-500';
  const pctClass = isDark ? 'text-white/50' : 'text-gray-500';

  const trackMuted = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const trackFill = isDark
    ? `linear-gradient(to right, rgba(255,255,255,0.85) ${displayPct}%, rgba(255,255,255,0.15) ${displayPct}%)`
    : `linear-gradient(to right, rgba(55,65,81,0.45) ${displayPct}%, rgba(0,0,0,0.08) ${displayPct}%)`;

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex justify-between">
        <span className={cn('text-xs', labelClass)}>{label}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onMuteToggle}
          aria-pressed={isMuted}
          aria-label={`${label} ${isMuted ? '음소거 해제' : '음소거'}`}
          className="inline-flex shrink-0 cursor-pointer border-0 bg-transparent p-0"
        >
          {volumeIcon(volume, isMuted, iconClass)}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={displayPct}
          disabled={isMuted}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="battle-volume-slider"
          style={{
            flex: 1,
            background: isMuted ? trackMuted : trackFill,
            cursor: isMuted ? 'not-allowed' : 'pointer',
            opacity: isMuted ? 0.3 : 1,
          }}
        />
        <span className={cn('w-7 text-right text-[11px]', pctClass)}>{isMuted ? '-' : `${displayPct}%`}</span>
      </div>
    </div>
  );
}

interface SoundControllerProps {
  tone?: SoundControllerTone;
}

export function SoundController({ tone = 'dark' }: SoundControllerProps) {
  const [soundOpen, setSoundOpen] = useState(false);
  const isDark = tone === 'dark';

  const { setting, setBgmVolume, setSfxVolume, toggleBgmMuted, toggleSfxMuted } = useSoundStore();
  const { bgmVolume, sfxVolume, isBgmMuted, isSfxMuted } = setting;

  return (
    <div>
      <button
        type="button"
        className={cn(
          'block w-full cursor-pointer border-0 bg-transparent px-5 py-4 text-center text-[15px] font-black',
          isDark ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-50',
        )}
        onClick={() => setSoundOpen((v) => !v)}
      >
        사운드 설정
      </button>

      {soundOpen && (
        <div className="p-5 pb-4">
          <VolumeSlider
            label="BGM"
            tone={tone}
            volume={bgmVolume}
            isMuted={isBgmMuted}
            onVolumeChange={setBgmVolume}
            onMuteToggle={toggleBgmMuted}
          />
          <VolumeSlider
            label="SFX"
            tone={tone}
            volume={sfxVolume}
            isMuted={isSfxMuted}
            onVolumeChange={setSfxVolume}
            onMuteToggle={toggleSfxMuted}
          />
        </div>
      )}
    </div>
  );
}
