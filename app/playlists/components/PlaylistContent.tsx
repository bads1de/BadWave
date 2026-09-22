"use client";

import { Playlist } from "@/types";
import PlaylistCard from "@/components/Playlist/PlaylistCard";
import { ROUTES } from "@/constants";
import { memo } from "react";

interface PlaylistContentProps {
  playlists: Playlist[];
}

const PlaylistContent: React.FC<PlaylistContentProps> = memo(
  ({ playlists }) => {
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
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            index={i}
            href={ROUTES.PLAYLISTS_DETAIL(playlist.id)}
          >
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-bold text-theme-300 truncate uppercase tracking-widest group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
                {playlist.title}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[8px] text-theme-500/40 uppercase tracking-tighter">
                  {"// DATA_TYPE: COLLECTION"}
                </span>
                <div className="w-1 h-1 bg-theme-500 rounded-full animate-pulse" />
              </div>
            </div>
          </PlaylistCard>
        ))}
      </div>
    );
  }
);

// displayName を設定
PlaylistContent.displayName = "PlaylistContent";

export default PlaylistContent;
