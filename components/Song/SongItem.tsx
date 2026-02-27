"use client";

import { Song } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { CiHeart, CiPlay1 } from "react-icons/ci";
import ScrollingText from "../common/ScrollingText";
import { memo, useCallback } from "react";

interface SongItemProps {
  onClick: (id: string) => void;
  data: Song;
}

const SongItem: React.FC<SongItemProps> = memo(({ onClick, data }) => {
  // クリックハンドラーをメモ化
  const handleClick = useCallback(() => {
    onClick(data.id);
  }, [onClick, data.id]);
  return (
    <div
      className="
        relative
        group
        flex
        flex-col
        items-center
        justify-center
        rounded-xl
        overflow-hidden
        bg-theme-900/40
        cursor-pointer
        hover:bg-theme-500/20
        transition-all
        duration-300
        aspect-[9/16]
        border
        border-theme-500/20
        hover:border-theme-500/50
        hover:shadow-[0_0_20px_rgba(var(--theme-500),0.3)]
        cyber-glitch
      "
    >
      <div className="relative w-full h-full">
        {data.image_path && (
          <Image
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
            src={data.image_path}
            fill
            alt="Image"
            onClick={handleClick}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] to-transparent">
          <Link href={`/songs/${data.id}`} className="w-full block">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            <div className="font-medium text-theme-300 truncate text-sm hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
              <ScrollingText text={data.title} />
            </div>
          </Link>

          <p className="text-neutral-400 text-xs mt-1 truncate group-hover:text-theme-300 transition-colors">
            {data.author}
          </p>

          <div className="flex items-center justify-start mt-2 space-x-4">
            <div className="flex items-center text-neutral-400 group-hover:text-theme-400 transition-colors">
              <CiPlay1 size={14} />
              <span className="ml-1 text-xs">{data.count}</span>
            </div>
            <div className="flex items-center text-neutral-400 group-hover:text-theme-400 transition-colors">
              <CiHeart size={14} />
              <span className="ml-1 text-xs">{data.like_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 表示名を設定
SongItem.displayName = "SongItem";

export default SongItem;
