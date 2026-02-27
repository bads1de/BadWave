import React from "react";
import { FaRandom } from "react-icons/fa";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { BsRepeat1 } from "react-icons/bs";
import { twMerge } from "tailwind-merge";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";

interface CommonControlsProps {
  isPlaying: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  Icon: React.ComponentType<any>;
  handlePlay: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  isMobile?: boolean;
}

const CommonControls: React.FC<CommonControlsProps> = ({
  isPlaying,
  isShuffling,
  isRepeating,
  Icon,
  handlePlay,
  onPlayNext,
  onPlayPrevious,
  toggleShuffle,
  toggleRepeat,
  isMobile = false,
}) => {
  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();

  // カラースキーマからの色取得
  const theme500 = hasHydrated ? `rgba(${colorScheme.colors.theme500}, 1)` : "#06b6d4";
  const glowColor = hasHydrated ? `rgba(${colorScheme.colors.glow}, 0.6)` : "rgba(0, 255, 255, 0.6)";

  return (
    <div
      className={twMerge(
        "flex items-center font-mono",
        isMobile ? "justify-between w-full" : "gap-x-10"
      )}
    >
      <div className="group relative">
        <FaRandom
          onClick={toggleShuffle}
          size={isMobile ? 22 : 18}
          className={twMerge(
            "cursor-pointer transition-all duration-300",
            isShuffling 
              ? "text-white drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]" 
              : "text-theme-500/40 hover:text-theme-300"
          )}
        />
        {isShuffling && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-theme-500 rounded-full animate-pulse" />
        )}
      </div>

      <AiFillStepBackward
        onClick={onPlayPrevious}
        size={isMobile ? 32 : 28}
        className="text-theme-500/60 cursor-pointer hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]"
      />

      <div
        onClick={handlePlay}
        className={twMerge(
          "relative flex items-center justify-center cursor-pointer group/play transition-all duration-500",
          isMobile ? "h-20 w-20" : "h-12 w-12"
        )}
      >
        {/* 背景装飾サークル */}
        <div className="absolute inset-0 border border-theme-500/20 rounded-full group-hover/play:border-theme-500/40 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-1 border-2 border-theme-500/40 rounded-full group-hover/play:border-theme-500/80 transition-colors" />
        
        <div className={twMerge(
          "flex items-center justify-center rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(var(--theme-500),0.3)] group-hover/play:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] group-hover/play:scale-110 cyber-glitch",
          isMobile ? "h-16 w-16 bg-theme-500" : "h-10 w-10 bg-theme-500/20 border border-theme-500/60"
        )}>
          <Icon 
            size={isMobile ? 36 : 24} 
            className={twMerge(
              "transition-all duration-300",
              isMobile ? "text-[#0a0a0f]" : "text-white group-hover/play:drop-shadow-[0_0_8px_white]"
            )} 
          />
        </div>
      </div>

      <AiFillStepForward
        onClick={onPlayNext}
        size={isMobile ? 32 : 28}
        className="text-theme-500/60 cursor-pointer hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]"
      />

      <div className="group relative">
        <BsRepeat1
          onClick={toggleRepeat}
          size={isMobile ? 28 : 22}
          className={twMerge(
            "cursor-pointer transition-all duration-300",
            isRepeating 
              ? "text-white drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]" 
              : "text-theme-500/40 hover:text-theme-300"
          )}
        />
        {isRepeating && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-theme-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

CommonControls.displayName = "CommonControls";

export default CommonControls;
