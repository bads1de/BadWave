"use client";

import React from "react";
import usePlayer from "@/hooks/player/usePlayer";
import useGetSongById from "@/hooks/data/useGetSongById";
import FullScreenLayout from "./FullScreenLayout";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";

interface RightSidebarProps {
  children: React.ReactNode;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ children }) => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const { song: nextSong } = useGetSongById(player.getNextSongId());
  const pathname = usePathname();
  const isPulsePage = pathname === "/pulse";

  const currentSong = song;
  const nextTrack = nextSong;

  // pulseページではRightSidebarを非表示
  const showRightSidebar = !!currentSong && !isPulsePage;

  return (
    <div className={twMerge(`flex h-full`, player.activeId && "h-full")}>
      <main className="h-full flex-1 overflow-y-auto ">{children}</main>
      {showRightSidebar && (
        <div
          className={twMerge(
            "hidden xl:flex w-96 flex-col h-full",
            "bg-[#0a0a0f] border-l border-theme-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.8)]",
            "p-2 transition-all duration-700 z-40 relative"
          )}
        >
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
               }} 
          />
          
          <FullScreenLayout
            song={currentSong!}
            videoPath={song?.video_path}
            imagePath={song?.image_path}
            nextSong={nextTrack}
            nextImagePath={nextTrack?.image_path}
          />
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
