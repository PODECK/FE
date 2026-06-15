import { Volume1, Volume2, VolumeOffIcon } from 'lucide-react';
import { useSoundStore } from '@/shared/stores/sound-store';
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
  const iconClass = isDark ? 'text-base-3' : 'text-base-0';
  const labelClass = isDark ? 'text-base-3/50' : 'text-base-0';
  const pctClass = isDark ? 'text-base-3/50' : 'text-base-0';

  const trackMuted = isDark
    ? 'color-mix(in srgb, var(--color-base-3) 10%, transparent)'
    : 'color-mix(in srgb, var(--color-base-0) 8%, transparent)';
  const trackFill = isDark
    ? `linear-gradient(to right, color-mix(in srgb, var(--color-base-3) 85%, transparent) ${displayPct}%, color-mix(in srgb, var(--color-base-3) 15%, transparent) ${displayPct}%)`
    : `linear-gradient(to right, var(--color-primary) ${displayPct}%, color-mix(in srgb, var(--color-base-0) 8%, transparent) ${displayPct}%)`;
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
          className={cn('battle-volume-slider flex-1', isMuted && 'opacity-30')}
          style={{
            background: isMuted ? trackMuted : trackFill,
            cursor: isMuted ? 'not-allowed' : 'pointer',
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
  const isDark = tone === 'dark';

  const { setting, setBgmVolume, setSfxVolume, toggleBgmMuted, toggleSfxMuted } = useSoundStore();
  const { bgmVolume, sfxVolume, isBgmMuted, isSfxMuted } = setting;

  return (
    <div>
      <h2
        className={cn(
          'block w-full px-5 py-4 text-center text-[15px] font-black',
          isDark ? 'text-base-3' : 'text-base-0/90',
        )}
      >
        사운드 설정
      </h2>

      <div className="p-5 pt-2 pb-4">
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
    </div>
  );
}
