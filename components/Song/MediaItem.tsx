"use client";

import Image from "next/image";
import { Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";
import { twMerge } from "tailwind-merge";
import ScrollingText from "../common/ScrollingText";
import { memo, useCallback } from "react";

interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
  isCollapsed?: boolean;
  className?: string;
}

const MediaItem: React.FC<MediaItemProps> = memo(
  ({ data, onClick, isCollapsed, className }) => {
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
      <div
        onClick={handleClick}
        className={twMerge(
          `
        flex
        items-center
        gap-x-4
        cursor-pointer
        rounded-none
        p-2
        group
        relative
        animate-fade-in
        font-mono
        `,
          className
        )}
      >
        <div
          className={twMerge(
            `
          relative
          rounded-none
          h-12
          w-12
          min-h-[48px]
          min-w-[48px]
          transition-all
          duration-500
          border
          border-theme-500/20
          group-hover:border-theme-500/60
          group-hover:shadow-[0_0_15px_rgba(var(--theme-500),0.3)]
          overflow-hidden
          cyber-glitch
          `
          )}
        >
          {data.image_path && (
            <Image
              fill
              src={data.image_path!}
              alt="MediaItem"
              className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:opacity-70"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
            />
          )}
          {/* シグナルオーバーレイ */}
          <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col gap-y-0.5 overflow-hidden w-[75%]">
            <div className="text-theme-300 font-bold text-sm truncate uppercase tracking-tighter group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]">
              <ScrollingText text={data.title} limitCharacters={15} />
            </div>
            <p className="text-[10px] text-theme-500/60 truncate uppercase tracking-widest">
              // AUTH: {data.author}
            </p>
          </div>
        )}
      </div>
    );
  }
);

// 表示名を設定
MediaItem.displayName = "MediaItem";

export default MediaItem;
