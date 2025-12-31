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
        className="cursor-pointer text-neutral-400 hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
        size={22}
      />
      <div
        className={`absolute bottom-full rounded-xl mb-3 right-0 transition-all duration-200 z-50 bg-[#0c0c0c] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#333333] ${
          showSlider
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 pointer-events-none transform translate-y-2"
        }`}
      >
        <div className="flex flex-col items-center">
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;
