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

  // 8D Audio & Retro 状態
  const is8DAudioEnabled = useEffectStore((state) => state.is8DAudioEnabled);
  const toggle8DAudio = useEffectStore((state) => state.toggle8DAudio);
  const rotationSpeed = useEffectStore((state) => state.rotationSpeed);
  const setRotationSpeed = useEffectStore((state) => state.setRotationSpeed);
  const isRetroEnabled = useEffectStore((state) => state.isRetroEnabled);
  const toggleRetro = useEffectStore((state) => state.toggleRetro);

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
    isRetroEnabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`cursor-pointer transition-all duration-300 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${
            isActive ? "" : "text-neutral-400 hover:text-white"
          }`}
          style={
            isActive
              ? {
                  color: accentFrom,
                  filter: `drop-shadow(0 0 8px rgba(${accentFromRgb}, 0.5))`,
                }
              : undefined
          }
        >
          <span className="text-xs font-bold w-6 text-center block">
            {playbackRate}x
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="w-56 p-3 bg-[#1e1e1e] border-[#333333] flex flex-col gap-3"
      >
        {/* Speed Slider */}
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Speed</span>
            <span className="text-xs font-bold" style={{ color: accentFrom }}>
              {playbackRate.toFixed(2)}x
            </span>
          </div>
          <RadixSlider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            defaultValue={[1]}
            value={[playbackRate]}
            onValueChange={(value) => setPlaybackRate(value[0])}
            max={1.5}
            min={0.5}
            step={0.05}
            aria-label="Playback Speed"
          >
            <RadixSlider.Track className="relative bg-neutral-600 rounded-full flex-grow h-[3px]">
              <RadixSlider.Range
                className="absolute rounded-full h-full"
                style={{ backgroundColor: accentFrom }}
              />
            </RadixSlider.Track>
            <RadixSlider.Thumb
              className="block w-3 h-3 bg-white rounded-full hover:bg-neutral-100 focus:outline-none transition-transform hover:scale-110"
              style={{
                boxShadow: `0 0 0 2px rgba(${accentFromRgb}, 0.5)`,
              }}
              aria-label="Speed"
            />
          </RadixSlider.Root>
          <div className="flex justify-between text-[10px] text-neutral-600">
            <span>0.5x</span>
            <span>1.5x</span>
          </div>
        </div>

        <div className="h-[1px] bg-neutral-800 w-full" />

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {rates.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-1.5 rounded text-xs transition-colors text-center ${
                playbackRate === rate
                  ? "font-medium ring-1"
                  : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
              style={
                playbackRate === rate
                  ? {
                      backgroundColor: `rgba(${accentFromRgb}, 0.2)`,
                      color: accentFrom,
                      boxShadow: `0 0 0 1px rgba(${accentFromRgb}, 0.5)`,
                    }
                  : undefined
              }
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="h-[1px] bg-neutral-800 w-full" />

        {/* Slowed + Reverb Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Slowed + Reverb</span>
            <div className="group relative flex items-center justify-center">
              <HelpCircle
                size={12}
                className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#252525] border border-[#404040] rounded shadow-xl text-[10px] leading-relaxed text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                ピッチを下げて再生速度を0.85倍にし、独特の雰囲気を作り出します。
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#252525] border-b border-r border-[#404040] rotate-45"></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSlowedReverb}
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{
              backgroundColor: isSlowedReverb ? accentFrom : "#525252",
            }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
              style={{
                left: isSlowedReverb ? "calc(100% - 3px - 12px)" : "2px",
              }}
            />
          </button>
        </div>

        {/* ... Spatial Audio ... */}
        {/* Spatial Audio (ダンスホール) */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Spatial Mode</span>
            <div className="group relative flex items-center justify-center">
              <HelpCircle
                size={12}
                className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#252525] border border-[#404040] rounded shadow-xl text-[10px] leading-relaxed text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                ダンスホールのような、低音が響き高音がこもった、反響感のあるサウンドを再現します。
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#252525] border-b border-r border-[#404040] rotate-45"></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSpatialEnabled}
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{
              backgroundColor: isSpatialEnabled ? accentFrom : "#525252",
            }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
              style={{
                left: isSpatialEnabled ? "calc(100% - 3px - 12px)" : "2px",
              }}
            />
          </button>
        </div>

        {/* 8D Audio */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">8D Audio</span>
            <div className="group relative flex items-center justify-center">
              <HelpCircle
                size={12}
                className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#252525] border border-[#404040] rounded shadow-xl text-[10px] leading-relaxed text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                音が頭の周りを回るような没入感のあるサウンドを作り出します。ヘッドホン推奨。
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#252525] border-b border-r border-[#404040] rotate-45"></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggle8DAudio}
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{
              backgroundColor: is8DAudioEnabled ? accentFrom : "#525252",
            }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
              style={{
                left: is8DAudioEnabled ? "calc(100% - 3px - 12px)" : "2px",
              }}
            />
          </button>
        </div>

        {/* 8D Audio 回転速度 */}
        {is8DAudioEnabled && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-neutral-500">Rotation Speed</span>
            <div className="flex gap-1">
              {rotationSpeeds.map((speed) => (
                <button
                  key={speed.value}
                  onClick={() => setRotationSpeed(speed.value)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    rotationSpeed === speed.value
                      ? "font-medium"
                      : "bg-neutral-800/50 text-neutral-500 hover:bg-neutral-700 hover:text-white"
                  }`}
                  style={
                    rotationSpeed === speed.value
                      ? {
                          backgroundColor: `rgba(${accentFromRgb}, 0.2)`,
                          color: accentFrom,
                        }
                      : undefined
                  }
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Retro Mode */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Retro Mode</span>
            <div className="group relative flex items-center justify-center">
              <HelpCircle
                size={12}
                className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#252525] border border-[#404040] rounded shadow-xl text-[10px] leading-relaxed text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                80年代のラジカセやカセットテープのような、粗くて温かみのあるサウンドを再現します。
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#252525] border-b border-r border-[#404040] rotate-45"></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleRetro}
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{
              backgroundColor: isRetroEnabled ? accentFrom : "#525252",
            }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
              style={{
                left: isRetroEnabled ? "calc(100% - 3px - 12px)" : "2px",
              }}
            />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlaybackSpeedButton;
