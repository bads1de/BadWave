"use client";

import PlaylistHeader from "./PlaylistHeader";
import LikedContent from "@/app/liked/components/LikedContent";
import { Playlist, Song } from "@/types";
import { memo } from "react";

interface PlaylistPageContentProps {
  playlist: Playlist;
  songs: Song[];
}

const PlaylistPageContent: React.FC<PlaylistPageContentProps> = memo(
  ({ playlist, songs }) => {
    return (
      <div className="bg-[#0a0a0f] h-full w-full overflow-hidden overflow-y-auto custom-scrollbar font-mono">
        <PlaylistHeader
          playlistId={playlist.id}
          playlistTitle={playlist.title}
          imageUrl={playlist.image_path || "/images/playlist.png"}
          songCount={songs.length}
          isPublic={playlist.is_public}
          createdAt={playlist.created_at}
          userId={playlist.user_id}
        />
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          {/* 背景装飾 */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-theme-500/20 to-transparent" />
          
          {songs.length ? (
            <div className="relative">
              <div className="mb-4 flex items-center justify-between text-[10px] text-theme-500/60 tracking-[0.3em] uppercase">
                 <span>// TRACK_LISTING_v1.0</span>
                 <span>SCAN_COMPLETE</span>
              </div>
              <LikedContent
                songs={songs}
                playlistId={playlist.id}
                playlistUserId={playlist.user_id}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-theme-500/20 rounded-none bg-theme-500/5">
              <p className="text-theme-500 font-mono tracking-widest uppercase animate-pulse">
                [ ! ] NO_DATA_DETECTED_IN_SECTOR_PLAYLIST
              </p>
              <div className="mt-4 text-[10px] text-theme-500/40 uppercase">
                 awaiting_input_stream...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// displayName を設定
PlaylistPageContent.displayName = "PlaylistPageContent";

export default PlaylistPageContent;
