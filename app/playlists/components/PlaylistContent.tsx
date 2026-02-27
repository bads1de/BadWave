"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Playlist } from "@/types";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";

interface PlaylistContentProps {
  playlists: Playlist[];
}

const PlaylistContent: React.FC<PlaylistContentProps> = memo(
  ({ playlists }) => {
    const router = useRouter();

    // ナビゲーションハンドラをメモ化
    const handlePlaylistClick = useCallback(
      (id: string) => {
        router.push(`/playlists/${id}`);
      },
      [router]
    );

    if (playlists.length === 0) {
      return (
        <div className="flex flex-col gap-y-2 w-full px-8 py-20 text-theme-500 font-mono tracking-widest uppercase">
          [ ! ] NO_PLAYLISTS_DETECTED_IN_SECTOR
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-8 font-mono">
        {playlists.map((playlist, i) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative cursor-pointer cyber-glitch"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            {/* HUD装飾背後 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-theme-500/20 via-theme-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm rounded-none" />
            
            <div className="relative bg-[#0a0a0f] border border-theme-500/20 rounded-none p-4 transform transition-all duration-500 group-hover:-translate-y-2 group-hover:border-theme-500/60 group-hover:shadow-[0_10px_30px_rgba(var(--theme-500),0.15)] overflow-hidden">
              {/* 角のアクセント */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/0 group-hover:border-theme-500/40 transition-colors pointer-events-none" />
              
              <div className="relative aspect-square w-full overflow-hidden rounded-none mb-4 border border-theme-500/10">
                <Image
                  src={playlist.image_path || "/images/playlist.png"}
                  alt={playlist.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-125 group-hover:opacity-80"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-theme-900/80" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-theme-300 truncate uppercase tracking-widest group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
                  {playlist.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[8px] text-theme-500/40 uppercase tracking-tighter">
                      // DATA_TYPE: COLLECTION
                   </span>
                   <div className="w-1 h-1 bg-theme-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
);

// displayName を設定
PlaylistContent.displayName = "PlaylistContent";

export default PlaylistContent;
