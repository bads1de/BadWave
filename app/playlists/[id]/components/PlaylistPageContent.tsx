"use client";

import PlaylistHeader from "./PlaylistHeader";
import LikedContent from "@/app/liked/components/LikedContent";
import { Song } from "@/types";

interface PlaylistPageContentProps {
  playlistId: string;
  playlistTitle: string;
  imageUrl: string;
  songs: Song[];
}

const PlaylistPageContent: React.FC<PlaylistPageContentProps> = ({
  playlistId,
  playlistTitle,
  songs,
  imageUrl,
}) => {
  return (
    <div className="bg-neutral-900 h-full w-full overflow-hidden overflow-y-auto custom-scrollbar">
      <PlaylistHeader
        playlistId={playlistId}
        playlistTitle={playlistTitle}
        imageUrl={imageUrl}
        songCount={songs.length}
      />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {songs.length ? (
          <LikedContent songs={songs} playlistId={playlistId} />
        ) : (
          <p className="text-neutral-400 text-center py-10">
            プレイリストには曲が追加されていません
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaylistPageContent;
