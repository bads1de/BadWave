"use client";

import React, { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import useVolumeStore from "@/hooks/stores/useVolumeStore";
import Slider from "./Slider";

const VolumeControl: React.FC = () => {
  // モバイルは固定値1を使用、デスクトップはストアから取得
  const [mobileVolume, setMobileVolume] = useState(1);
  const { volume: storedVolume, setVolume: setStoredVolume } = useVolumeStore();

  const volume = isMobile ? mobileVolume : storedVolume;
  const setVolume = isMobile ? setMobileVolume : setStoredVolume;

  const [showSlider, setShowSlider] = useState(false);

  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const handleClick = useCallback(() => {
    setShowSlider((prev) => !prev);
  }, []);

  // 3秒後に自動で閉じる
  useEffect(() => {
    if (!showSlider) return;

    const timeout = setTimeout(() => {
      setShowSlider(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showSlider]);

  // モバイルでは非表示
  if (isMobile) return null;

  return (
    <div className="relative">
      <VolumeIcon
        onClick={handleClick}
        className="cursor-pointer text-theme-500 hover:text-white transition-all duration-300 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
        size={20}
      />
      <div
        className={`absolute bottom-full rounded-none mb-4 right-0 transition-all duration-500 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_15px_rgba(var(--theme-500),0.1)] border border-theme-500/30 ${
          showSlider
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 pointer-events-none transform translate-y-4"
        }`}
      >
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/60" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/60" />
        
        <div className="flex flex-col items-center gap-y-2">
          <Slider value={volume} onChange={(value) => setVolume(value)} />
          <span className="text-[8px] font-mono text-theme-500 font-bold uppercase tracking-tighter">
            VOL_{Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;
