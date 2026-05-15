import { Volume1, Volume2, VolumeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { useSoundStore } from '@/shared/stores/soundStore';

function volumeIcon(volume: number, isMuted: boolean) {
  if (isMuted || volume === 0) return <VolumeOffIcon className="text-white" />;
  if (volume < 0.5) return <Volume1 className="text-white" />;
  return <Volume2 className="text-white" />;
}

interface VolumeSliderProps {
  label: string;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

function VolumeSlider({ label, volume, isMuted, onVolumeChange, onMuteToggle }: VolumeSliderProps) {
  const displayPct = Math.round(volume * 100);
  return (
    <div className="mb-3">
      {/* 라벨 + 음소거 */}
      <div className="mb-1.5 flex justify-between">
        <span className="text-xs text-white/50">{label}</span>
      </div>

      {/* 슬라이더 + 수치 */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onMuteToggle}
          aria-pressed={isMuted}
          aria-label={`${label} ${isMuted ? '음소거 해제' : '음소거'}`}
          className="inline-flex shrink-0 cursor-pointer border-0 bg-transparent p-0"
        >
          {volumeIcon(volume, isMuted)}
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
            background: isMuted
              ? 'rgba(255,255,255,0.1)'
              : `linear-gradient(to right,
                  rgba(255,255,255,0.85) ${displayPct}%,
                  rgba(255,255,255,0.15) ${displayPct}%)`,
            cursor: isMuted ? 'not-allowed' : 'pointer',
            opacity: isMuted ? 0.3 : 1,
          }}
        />
        <span className="w-7 text-right text-[11px] text-white/50">{isMuted ? '-' : `${displayPct}%`}</span>
      </div>
    </div>
  );
}

export function SoundController() {
  const [soundOpen, setSoundOpen] = useState(false);

  const { setting, setBgmVolume, setSfxVolume, toggleBgmMuted, toggleSfxMuted } = useSoundStore();
  const { bgmVolume, sfxVolume, isBgmMuted, isSfxMuted } = setting;

  return (
    <div>
      <button
        className="block w-full cursor-pointer border-0 bg-transparent px-5 py-4 text-center text-[15px] font-black text-white hover:bg-white/5"
        onClick={() => setSoundOpen((v) => !v)}
      >
        사운드 설정
      </button>

      {/* 슬라이더 패널 */}
      {soundOpen && (
        <div className="p-5 pb-4">
          <VolumeSlider
            label="BGM"
            volume={bgmVolume}
            isMuted={isBgmMuted}
            onVolumeChange={setBgmVolume}
            onMuteToggle={toggleBgmMuted}
          />
          <VolumeSlider
            label="SFX"
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
