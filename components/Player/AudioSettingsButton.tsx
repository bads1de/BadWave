"use client";

import React, { useState } from "react";
import { Settings2, Music2, SlidersVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import useEqualizerStore from "@/hooks/stores/useEqualizerStore";
import useEffectStore from "@/hooks/stores/useEffectStore";
import useSpatialStore from "@/hooks/stores/useSpatialStore";
import SpeedAndEffectsControl from "./SpeedAndEffectsControl";
import EqualizerControl from "../Equalizer/EqualizerControl";

type Tab = "effects" | "equalizer";

const AudioSettingsButton: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("effects");

  // オーディオ設定が有効かどうかをチェックしてアイコンの色を変えるためのstate
  const playbackRate = usePlaybackRateStore((state) => state.rate);
  const isEqualizerEnabled = useEqualizerStore((state) => state.isEnabled);
  const isSpatialEnabled = useSpatialStore((state) => state.isSpatialEnabled);
  const is8DAudioEnabled = useEffectStore((state) => state.is8DAudioEnabled);
  const isRetroEnabled = useEffectStore((state) => state.isRetroEnabled);
  const isBassBoostEnabled = useEffectStore(
    (state) => state.isBassBoostEnabled,
  );
  const isSlowedReverb = useEffectStore((state) => state.isSlowedReverb);

  const isAnyEffectActive =
    playbackRate !== 1 ||
    isEqualizerEnabled ||
    isSpatialEnabled ||
    is8DAudioEnabled ||
    isRetroEnabled ||
    isBassBoostEnabled ||
    isSlowedReverb;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`cursor-pointer transition-all duration-300 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${
            isAnyEffectActive
              ? "text-theme-500 drop-shadow-[0_0_8px_var(--glow-color)]"
              : "text-neutral-400 hover:text-white"
          }`}
          title="オーディオ設定 (速度・エフェクト・イコライザー)"
        >
          <Settings2 size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="w-[380px] p-0 bg-[#0a0a0f]/95 backdrop-blur-xl border border-theme-500/40 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(var(--theme-500),0.1)] overflow-hidden rounded-none font-mono"
      >
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-theme-500/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-theme-500/40 pointer-events-none" />

        {/* タブヘッダー */}
        <div className="flex border-b border-theme-500/20 bg-theme-500/5 relative z-10">
          <button
            onClick={() => setActiveTab("effects")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden cyber-glitch ${
              activeTab === "effects"
                ? "text-white bg-theme-500/20"
                : "text-theme-500/40 hover:text-theme-300 hover:bg-theme-500/5"
            }`}
          >
            {activeTab === "effects" && (
               <div className="absolute top-0 left-0 w-full h-0.5 bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-500),0.8)]" />
            )}
            <Music2 size={12} className={activeTab === "effects" ? "text-theme-500" : ""} />
            <span>EFFECTS_LOG</span>
          </button>
          <button
            onClick={() => setActiveTab("equalizer")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden cyber-glitch ${
              activeTab === "equalizer"
                ? "text-white bg-theme-500/20"
                : "text-theme-500/40 hover:text-theme-300 hover:bg-theme-500/5"
            }`}
          >
            {activeTab === "equalizer" && (
               <div className="absolute top-0 left-0 w-full h-0.5 bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-500),0.8)]" />
            )}
            <SlidersVertical size={12} className={activeTab === "equalizer" ? "text-theme-500" : ""} />
            <span>FREQ_CONFIG</span>
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar relative z-10">
          <div className="mb-4 text-[8px] text-theme-500/40 tracking-[0.4em] uppercase border-b border-theme-500/10 pb-1">
             // INITIALIZING_SIGNAL_PROCESSOR_v4.2
          </div>
          {activeTab === "effects" ? (
            <SpeedAndEffectsControl />
          ) : (
            <EqualizerControl className="!bg-transparent !border-none !rounded-none !p-0 !min-w-0 shadow-none" />
          )}
        </div>
        
        {/* スキャンライン的な横線 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
      </PopoverContent>
    </Popover>
  );
};

export default AudioSettingsButton;
