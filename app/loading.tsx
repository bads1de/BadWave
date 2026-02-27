"use client";

import { PulseLoader } from "react-spinners";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden font-mono">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[length:100%_2px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 p-12 border border-theme-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-[0_0_50px_rgba(var(--theme-500),0.1)]">
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-theme-500/40" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-theme-500/40" />

        <div className="flex items-center gap-4">
          <div className="w-12 h-1 bg-theme-500 animate-pulse shadow-[0_0_10px_rgba(var(--theme-500),0.8)]" />
          <p className="text-xl font-bold text-white tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]">
            INITIALIZING_SYSTEM
          </p>
          <div className="w-12 h-1 bg-theme-500 animate-pulse shadow-[0_0_10px_rgba(var(--theme-500),0.8)]" />
        </div>

        <div className="flex flex-col items-start w-full gap-2 text-[10px] text-theme-500/60 uppercase tracking-widest">
           <div className="flex gap-2">
              <span className="text-theme-500 animate-pulse">{">"}</span>
              <span>CONNECTING_TO_DATA_STREAM...</span>
           </div>
           <div className="flex gap-2 opacity-60">
              <span className="text-theme-500">{">"}</span>
              <span>DECRYPTING_AUDIO_PROTOCOLS...</span>
           </div>
           <div className="flex gap-2 opacity-30">
              <span className="text-theme-500">{">"}</span>
              <span>ESTABLISHING_SECURE_HUD_LINK...</span>
           </div>
        </div>

        <div className="mt-4 flex gap-1">
           {[...Array(5)].map((_, i) => (
             <div 
               key={i} 
               className="w-2 h-2 bg-theme-500/40 animate-pulse" 
               style={{ animationDelay: `${i * 0.2}s` }}
             />
           ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
