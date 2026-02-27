"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";
import { Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";
import { twMerge } from "tailwind-merge";
import { Play, Heart, PlayIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SongListProps {
  data: Song;
  onClick?: (id: string) => void;
  className?: string;
}

const SongList: React.FC<SongListProps> = memo(
  ({ data, onClick, className }) => {
    const player = usePlayer();

    // クリックハンドラーをメモ化
    const handleClick = useCallback(() => {
      if (onClick) {
        return onClick(data.id!);
      }

      if ("author" in data && data.id) {
        return player.setId(data.id);
      }
    }, [onClick, data.id, player]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className={twMerge(
          `
        flex
        items-center
        gap-x-2
        sm:gap-x-4
        cursor-pointer
        w-full
        bg-[#0a0a0f]/60
        rounded-none
        p-2
        group
        hover:bg-theme-500/10
        transition-all
        duration-300
        backdrop-blur-md
        border
        border-theme-500/20
        hover:border-theme-500/50
        hover:shadow-[0_0_15px_rgba(var(--theme-500),0.15)]
        relative
        overflow-hidden
        cyber-glitch
        `,
          className
        )}
      >
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-theme-500/0 group-hover:border-theme-500/30 transition-colors pointer-events-none rounded-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-theme-500/0 group-hover:border-theme-500/30 transition-colors pointer-events-none rounded-none" />

        <div
          onClick={handleClick}
          className="relative w-12 h-12 sm:w-16 sm:h-16 min-w-12 sm:min-w-16 rounded-none overflow-hidden group-hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)] transition-all duration-300 border border-theme-500/10"
        >
          {data.image_path && (
            <Image
              fill
              src={data.image_path}
              alt={data.title}
              className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:opacity-80"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
            />
          )}
          <div className="absolute inset-0 bg-theme-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" />
          </div>
        </div>
        <div className="flex flex-col py-1 truncate flex-grow min-w-0 font-mono uppercase tracking-tight">
          <Link href={`/songs/${data.id}`}>
            <p className="text-theme-300 font-bold text-xs sm:text-sm truncate tracking-widest hover:text-white transition-colors group-hover:drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]">
              {data.title}
            </p>
          </Link>
          <div className="flex gap-x-2 items-center mt-0.5">
            <Link href={`/genre/${data.genre}`}>
              <p className="text-theme-500 text-[10px] truncate hover:text-theme-300 transition-colors">
                // {data?.genre}
              </p>
            </Link>
            <span className="text-theme-900 text-[10px]">•</span>
            <p className="text-neutral-500 text-[10px] truncate hidden sm:block">
              AUTH: {data?.author}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-x-1 sm:gap-x-4 pr-1 sm:pr-4 ml-auto font-mono text-[10px] text-theme-500">
          <div className="flex items-center group-hover:text-theme-300 transition-colors">
            <PlayIcon size={14} className="sm:size-16" />
            <span className="font-bold ml-1">
              {data?.count}
            </span>
          </div>

          <div className="flex items-center ml-2 sm:ml-0 group-hover:text-theme-300 transition-colors">
            <Heart size={14} className="sm:size-16" />
            <span className="font-bold ml-1">
              {data?.like_count}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
);

// 表示名を設定
SongList.displayName = "SongList";

export default SongList;
