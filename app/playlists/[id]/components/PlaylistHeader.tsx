"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import PlaylistOptionsPopover from "@/components/Playlist/PlaylistOptionsPopover";
import { Globe, Lock } from "lucide-react";
import { useUser } from "@/hooks/auth/useUser";

interface PlaylistHeaderProps {
  playlistId: string;
  playlistTitle: string;
  imageUrl: string;
  songCount: number;
  isPublic: boolean;
  createdAt: string;
  userId: string;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = memo(
  ({
    playlistId,
    playlistTitle,
    imageUrl,
    songCount,
    isPublic,
    createdAt,
    userId,
  }) => {
    const { user } = useUser();
    const formattedDate = format(new Date(createdAt), "yyyy年MM月dd日", {
      locale: ja,
    });

    return (
      <div className="relative w-full h-[250px] md:h-[400px]">
        {/* 背景画像 */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={imageUrl}
            alt="Playlist background"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-theme-900/40 to-[#0a0a0f]/90" />
        {/* スキャンライン / グリッド効果 */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.1) 1px, transparent 1px)`,
               backgroundSize: '30px 30px'
             }} 
        />
        {/* コンテンツ */}
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-end">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-x-8 w-full">
            {/* プレイリストアートワーク */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-32 w-32 md:h-64 md:w-64 group mx-auto md:mx-0 cyber-glitch"
            >
              {/* HUDコーナー */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-theme-500/60 pointer-events-none rounded-none shadow-[-5px_-5px_15px_rgba(var(--theme-500),0.2)]" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-theme-500/60 pointer-events-none rounded-none shadow-[5px_5px_15px_rgba(var(--theme-500),0.2)]" />
              
              <div className="relative h-full w-full overflow-hidden rounded-none border border-theme-500/40 shadow-[0_0_30px_rgba(var(--theme-500),0.2)]">
                <Image
                  src={imageUrl}
                  alt="Playlist"
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-125"
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 256px, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
              </div>
            </motion.div>
            {/* プレイリスト情報 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-y-3 text-center md:text-left font-mono"
            >
              <p className="text-theme-500 text-xs tracking-[0.3em] uppercase opacity-80">
                [ ACCESSING_PLAYLIST_DATA... ]
              </p>
              <div className="flex items-center justify-center md:justify-start gap-x-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-widest drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)] break-all uppercase">
                  {playlistTitle}
                </h1>
                {user?.id === userId && (
                  <PlaylistOptionsPopover
                    playlistId={playlistId}
                    currentTitle={playlistTitle}
                    isPublic={isPublic}
                  />
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-x-6 text-xs md:text-sm text-theme-400/90 tracking-widest uppercase">
                <div className="flex items-center gap-x-2 border-r border-theme-500/30 pr-4">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-theme-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-theme-500" />
                  )}
                  <span>{isPublic ? "STATUS: PUBLIC" : "STATUS: PRIVATE"}</span>
                </div>
                <div className="flex items-center gap-x-2 border-r border-theme-500/30 pr-4">
                   <span>DATA_COUNT: {songCount}</span>
                </div>
                <div className="hidden md:block">
                  <span>INIT_DATE: {formattedDate}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
);

// displayName を設定
PlaylistHeader.displayName = "PlaylistHeader";

export default PlaylistHeader;
