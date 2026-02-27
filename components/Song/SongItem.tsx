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
        rounded-none
        overflow-hidden
        bg-[#0a0a0f]
        cursor-pointer
        hover:bg-theme-500/5
        transition-all
        duration-500
        aspect-[9/16]
        border
        border-theme-500/20
        hover:border-theme-500/60
        hover:shadow-[0_0_25px_rgba(var(--theme-500),0.2)]
        cyber-glitch
        font-mono
      "
    >
      {/* HUDコーナー装飾 */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-theme-500/40 z-20 group-hover:border-theme-500 transition-colors" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-theme-500/40 z-20 group-hover:border-theme-500 transition-colors" />

      <div className="relative w-full h-full">
        {data.image_path && (
          <Image
            className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:opacity-60 grayscale-[30%] group-hover:grayscale-0"
            src={data.image_path}
            fill
            alt="Image"
            onClick={handleClick}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
          />
        )}
        
        {/* スキャンライン */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 bg-[length:100%_3px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent z-20">
          <Link href={`/songs/${data.id}`} className="w-full block mb-1">
            <div className="font-black text-theme-300 truncate text-[10px] uppercase tracking-widest hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
              <ScrollingText text={data.title} />
            </div>
          </Link>

          <p className="text-theme-500/60 text-[8px] truncate uppercase tracking-tighter group-hover:text-theme-300 transition-colors">
            // AUTH: {data.author}
          </p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme-500/10">
            <div className="flex items-center text-[8px] text-theme-500/40 group-hover:text-theme-400 transition-colors font-black uppercase tracking-widest">
              <CiPlay1 size={10} className="mr-1" />
              <span>{data.count}_PLAYS</span>
            </div>
            <div className="flex items-center text-[8px] text-theme-500/40 group-hover:text-theme-400 transition-colors font-black uppercase tracking-widest">
              <CiHeart size={10} className="mr-1" />
              <span>{data.like_count}_VAL</span>
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
