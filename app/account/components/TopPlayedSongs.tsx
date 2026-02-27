"use client";

import React, { useState, memo, useCallback } from "react";
import Image from "next/image";
import useGetTopPlayedSongs from "@/hooks/data/useGetTopPlayedSongs";
import useOnPlay from "@/hooks/player/useOnPlay";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";

interface TopPlayedSongsProps {
  user: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

const PERIODS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
] as const;

const TopPlayedSongs: React.FC<TopPlayedSongsProps> = memo(({ user }) => {
  const [period, setPeriod] =
    useState<(typeof PERIODS)[number]["value"]>("day");
  const { topSongs, isLoading } = useGetTopPlayedSongs(user?.id, period);
  const onPlay = useOnPlay(topSongs || []);
  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();

  // 再生ハンドラをメモ化
  const handlePlay = useCallback(
    (id: string) => {
      onPlay(id);
    },
    [onPlay]
  );

  return (
    <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-theme-500/20 shadow-[inset_0_0_20px_rgba(var(--theme-500),0.05)] rounded-none p-6 font-mono relative overflow-hidden group">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
             backgroundSize: '30px 30px'
           }} 
      />
      
      {/* HUDコーナー */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/40" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-theme-500/40" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] text-theme-500 tracking-[0.4em] uppercase animate-pulse">
            [ ACCESSING_RANKING_DATA ]
          </p>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]">
            STREAM_LEADERBOARD
          </h3>
        </div>
        
        <div className="flex items-center rounded-none bg-[#0a0a0f] border border-theme-500/30 p-1 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.1)]">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`
                px-4 py-2 text-[10px] font-black uppercase tracking-widest
                transition-all duration-500 relative overflow-hidden
                ${
                  period === p.value
                    ? "text-white cyber-glitch"
                    : "text-theme-500/40 hover:text-theme-300 hover:bg-theme-500/5"
                }
              `}
              style={
                period === p.value && hasHydrated
                  ? {
                      background: `rgba(var(--theme-500), 0.15)`,
                      boxShadow: `0 0 10px rgba(var(--theme-500), 0.2)`,
                    }
                  : undefined
              }
            >
              {period === p.value && (
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white" />
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-6 p-4 bg-theme-900/20 border border-theme-500/10 animate-pulse"
            >
              <div className="w-16 h-16 bg-theme-500/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-theme-500/10 w-1/2" />
                <div className="h-3 bg-theme-500/5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : topSongs?.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-theme-500/20 bg-theme-500/5">
          <p className="text-theme-500/60 uppercase tracking-widest text-xs animate-pulse">
            [ ! ] NO_STREAM_HISTORY_DETECTED_IN_THIS_PERIOD
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {topSongs?.map((song, index) => (
            <div
              key={song.id}
              onClick={() => handlePlay(song.id)}
              className="group flex items-center gap-6 p-4 bg-[#0a0a0f] border border-theme-500/10 hover:border-theme-500/50 hover:bg-theme-500/10 transition-all duration-500 cursor-pointer cyber-glitch"
            >
              <div className="flex-shrink-0 relative">
                <div className="w-16 h-16 border border-theme-500/20 group-hover:border-theme-500/60 transition-colors overflow-hidden">
                  <Image
                    fill
                    src={song.image_path}
                    alt={song.title}
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                </div>
                {/* ランクインジケーター */}
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center text-xs font-black text-white border border-theme-500/60 shadow-[0_0_10px_rgba(var(--theme-500),0.4)]"
                  style={{
                    backgroundColor: hasHydrated
                      ? `rgba(${colorScheme.colors.glow}, 0.4)`
                      : "#7c3aedCC",
                  }}
                >
                  <span className="text-[10px] text-theme-300 mr-0.5">#</span>{index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold uppercase tracking-widest truncate group-hover:text-theme-300 transition-colors">
                  {song.title}
                </h4>
                <p className="text-theme-500/60 text-[10px] uppercase tracking-tighter mt-1">
                  // ORIGIN: {song.author}
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="px-4 py-1.5 border border-theme-500/20 bg-theme-500/5 text-theme-500 font-bold text-[10px] tracking-widest uppercase group-hover:border-theme-500/60 group-hover:text-white transition-all shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]">
                  {song.play_count}_PLAYS_LOG
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 装飾用HUDライン */}
      <div className="mt-8 pt-4 border-t border-theme-500/10 flex justify-between items-center text-[8px] text-theme-500/20 uppercase">
         <span>protocol: ranking_v2.0 // priority: user_stats</span>
         <span className="animate-pulse">tracking_signal: active</span>
      </div>
    </div>
  );
});

// displayName を設定
TopPlayedSongs.displayName = "TopPlayedSongs";

export default TopPlayedSongs;
