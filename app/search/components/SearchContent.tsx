"use client";

import { useSearchParams } from "next/navigation";
import useOnPlay from "@/hooks/player/useOnPlay";
import { Playlist, Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";
import SongListContent from "@/components/Song/SongListContent";
import PlaylistCard from "@/components/Playlist/PlaylistCard";
import { useCallback, memo } from "react";
import { ROUTES } from "@/constants";

interface PlaylistSectionProps {
  playlists: Playlist[];
}

// プレイリストセクションコンポーネント（メモ化）
const PlaylistSection = memo(({ playlists }: PlaylistSectionProps) => {
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-theme-500 font-mono">
        <h1>[ ! ] PLAYLIST_NOT_FOUND</h1>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
      {playlists.map((playlist, i) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          index={i}
          href={`${ROUTES.PLAYLISTS_DETAIL(playlist.id)}?title=${encodeURIComponent(
            playlist.title
          )}`}
        >
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-bold text-theme-300 truncate uppercase tracking-widest group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
              {playlist.title}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[8px] text-theme-500/40 uppercase tracking-tighter">
                {"// PLAYLIST_DATA"}
              </span>
              <div className="w-1 h-1 bg-theme-500 rounded-full animate-pulse" />
            </div>
          </div>
        </PlaylistCard>
      ))}
    </div>
  );
});

// 曲が0件のときの表示
const searchEmptyState = (
  <div className="flex flex-col gap-y-4 w-full p-12 border border-dashed border-theme-500/20 bg-theme-500/5 items-center justify-center font-mono">
    <h1 className="text-theme-500/60 uppercase tracking-[0.4em] text-sm animate-pulse">
      [ ! ] NO_BINARY_STREAMS_FOUND_IN_SECTOR
    </h1>
    <p className="text-[8px] text-theme-500/20 uppercase tracking-widest">
      broadcasting_scan_signal: negative
    </p>
  </div>
);

// コンポーネントにdisplayNameを設定
PlaylistSection.displayName = "PlaylistSection";

interface SearchContentProps {
  songs: Song[];
  playlists: Playlist[];
  playlistId?: string;
}

const SearchContent: React.FC<SearchContentProps> = ({
  songs,
  playlists,
  playlistId,
}) => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "songs";
  const onPlay = useOnPlay(songs);
  const player = usePlayer();

  // 再生処理関数
  const handlePlay = useCallback(
    (id: string) => {
      onPlay(id);
      player.setId(id);
    },
    [onPlay, player]
  );

  return (
    <div className="w-full">
      {activeTab === "songs" && (
        <SongListContent
          songs={songs}
          playlistId={playlistId}
          onPlay={handlePlay}
          emptyState={searchEmptyState}
        />
      )}
      {activeTab === "playlists" && <PlaylistSection playlists={playlists} />}
    </div>
  );
};

export default SearchContent;
