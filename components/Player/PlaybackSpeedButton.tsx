import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as RadixSlider from "@radix-ui/react-slider";
import { HelpCircle } from "lucide-react";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import useSpatialStore from "@/hooks/stores/useSpatialStore";
import useEffectStore, {
  ROTATION_SPEED_VALUES,
  RotationSpeed,
} from "@/hooks/stores/useEffectStore";

// HEXカラーをRGBに変換するヘルパー関数
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16
    )}`;
  }
  return "124, 58, 237"; // デフォルト値（violet-600）
};

const PlaybackSpeedButton: React.FC = () => {
  const playbackRate = usePlaybackRateStore((state) => state.rate);
  const setPlaybackRate = usePlaybackRateStore((state) => state.setRate);

  // Slowed + Reverb 状態 (useEffectStore から取得)
  const isSlowedReverb = useEffectStore((state) => state.isSlowedReverb);
  const toggleSlowedReverb = useEffectStore(
    (state) => state.toggleSlowedReverb
  );

  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();
  const accentFrom = hasHydrated ? colorScheme.colors.accentFrom : "#7c3aed";
  const accentFromRgb = hexToRgb(accentFrom);
  const { isSpatialEnabled, toggleSpatialEnabled } = useSpatialStore();

  // 8D Audio, Retro, Bass Boost 状態
  const is8DAudioEnabled = useEffectStore((state) => state.is8DAudioEnabled);
  const toggle8DAudio = useEffectStore((state) => state.toggle8DAudio);
  const rotationSpeed = useEffectStore((state) => state.rotationSpeed);
  const setRotationSpeed = useEffectStore((state) => state.setRotationSpeed);
  const isRetroEnabled = useEffectStore((state) => state.isRetroEnabled);
  const toggleRetro = useEffectStore((state) => state.toggleRetro);
  const isBassBoostEnabled = useEffectStore(
    (state) => state.isBassBoostEnabled
  );
  const toggleBassBoost = useEffectStore((state) => state.toggleBassBoost);

  const rates = [0.9, 0.95, 1, 1.05, 1.1, 1.25];
  const rotationSpeeds: { value: RotationSpeed; label: string }[] = [
    { value: "slow", label: "Slow" },
    { value: "medium", label: "Medium" },
    { value: "fast", label: "Fast" },
  ];

  const isActive =
    playbackRate !== 1 ||
    isSlowedReverb ||
    isSpatialEnabled ||
    is8DAudioEnabled ||
    isRetroEnabled ||
    isBassBoostEnabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`cursor-pointer transition-all duration-500 font-mono text-[10px] font-black border px-2 py-1 uppercase tracking-widest cyber-glitch ${
            isActive 
              ? "bg-theme-500/20 border-theme-500 text-white shadow-[0_0_15px_rgba(var(--theme-500),0.4)]" 
              : "border-theme-500/20 text-theme-500 hover:border-theme-500/60 hover:text-white"
          }`}
        >
          {playbackRate}x
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="w-64 p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border border-theme-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 font-mono rounded-none"
      >
        <div className="text-[8px] text-theme-500/40 tracking-[0.4em] uppercase border-b border-theme-500/10 pb-1">
           // TEMPORAL_SPEED_CONFIG
        </div>
        
        {/* Speed Slider (HUD Style) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-theme-500/60 uppercase">RATE_VAR</span>
            <span className="text-[10px] font-bold text-white">
              {playbackRate.toFixed(2)}x
            </span>
          </div>
          <RadixSlider.Root
            className="relative flex items-center select-none touch-none w-full h-4"
            defaultValue={[1]}
            value={[playbackRate]}
            onValueChange={(value) => setPlaybackRate(value[0])}
            max={1.5}
            min={0.5}
            step={0.05}
            aria-label="Playback Speed"
          >
            <RadixSlider.Track className="relative bg-theme-900 border border-theme-500/20 rounded-none flex-grow h-1.5 overflow-hidden">
              <RadixSlider.Range
                className="absolute bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-500),0.5)] h-full"
              />
            </RadixSlider.Track>
            <RadixSlider.Thumb
              className="block w-3 h-3 bg-white border border-theme-500 shadow-[0_0_8px_rgba(var(--theme-500),0.8)] focus:outline-none transition-transform hover:scale-125 cursor-pointer"
              aria-label="Speed"
            />
          </RadixSlider.Root>
        </div>

        {/* Preset Buttons (Terminal Commands) */}
        <div className="grid grid-cols-3 gap-2">
          {rates.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`py-1.5 border text-[10px] font-bold transition-all duration-300 uppercase ${
                playbackRate === rate
                  ? "bg-theme-500/20 border-theme-500 text-white shadow-[0_0_10px_rgba(var(--theme-500),0.3)]"
                  : "bg-theme-500/5 border-theme-500/10 text-theme-500/60 hover:border-theme-500/40 hover:text-theme-300"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="h-px bg-theme-500/10 w-full" />

        {/* HUD Toggles */}
        <div className="flex flex-col gap-3">
          {[
            { id: 'slowed', label: 'SLOWED+REVERB', active: isSlowedReverb, action: toggleSlowedReverb },
            { id: 'spatial', label: 'SPATIAL_MODE', active: isSpatialEnabled, action: toggleSpatialEnabled },
            { id: '8d', label: '8D_AUDIO_LINK', active: is8DAudioEnabled, action: toggle8DAudio },
            { id: 'retro', label: 'RETRO_SIGNAL', active: isRetroEnabled, action: toggleRetro },
            { id: 'bass', label: 'BASS_AMPLIFY', active: isBassBoostEnabled, action: toggleBassBoost },
          ].map((effect) => (
            <div key={effect.id} className="flex items-center justify-between">
              <span className={`text-[10px] font-bold tracking-widest ${effect.active ? "text-theme-300" : "text-theme-500/40"}`}>
                // {effect.label}
              </span>
              <button
                onClick={effect.action}
                className={`w-10 h-4 border transition-all duration-500 relative overflow-hidden ${
                  effect.active ? "bg-theme-500/20 border-theme-500" : "bg-theme-900/40 border-theme-500/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-2 transition-all duration-500 ${
                    effect.active ? "left-6 bg-white shadow-[0_0_8px_white]" : "left-1 bg-theme-500/40"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlaybackSpeedButton;
