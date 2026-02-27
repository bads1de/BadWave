"use client";

import { useSearchParams } from "next/navigation";
import useOnPlay from "@/hooks/player/useOnPlay";
import { useUser } from "@/hooks/auth/useUser";
import { Playlist, Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";
import SongList from "@/components/Song/SongList";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCallback, memo } from "react";

// 曲リストコンポーネントのプロップス型定義
interface SongListSectionProps {
  songs: Song[];
  playlistId?: string;
  onPlay: (id: string) => void;
}

// プレイリストリストコンポーネントのプロップス型定義
interface PlaylistSectionProps {
  playlists: Playlist[];
}

// 曲リストセクションコンポーネント（メモ化）
const SongListSection = memo(
  ({ songs, playlistId, onPlay }: SongListSectionProps) => {
    const { user } = useUser();

    if (songs.length === 0) {
      return (
        <div className="flex flex-col gap-y-4 w-full p-12 border border-dashed border-theme-500/20 bg-theme-500/5 items-center justify-center font-mono">
          <h1 className="text-theme-500/60 uppercase tracking-[0.4em] text-sm animate-pulse">
            [ ! ] NO_BINARY_STREAMS_FOUND_IN_SECTOR
          </h1>
          <p className="text-[8px] text-theme-500/20 uppercase tracking-widest">
            broadcasting_scan_signal: negative
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-y-2 w-full p-6">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center gap-x-4 w-full">
            <div className="flex-1 min-w-0">
              <SongList data={song} onClick={(id: string) => onPlay(id)} />
            </div>
            {user?.id && (
              <SongOptionsPopover song={song} playlistId={playlistId} />
            )}
          </div>
        ))}
      </div>
    );
  }
);

// プレイリストセクションコンポーネント（メモ化）
const PlaylistSection = memo(({ playlists }: PlaylistSectionProps) => {
  const router = useRouter();

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
        <motion.div
          key={playlist.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="group relative cursor-pointer cyber-glitch"
          onClick={() =>
            router.push(
              `/playlists/${playlist.id}?title=${encodeURIComponent(
                playlist.title
              )}`
            )
          }
        >
          {/* HUD装飾背後 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-500/20 via-theme-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm rounded-none" />
          
          <div className="relative bg-[#0a0a0f] border border-theme-500/20 rounded-none p-4 transform transition-all duration-300 group-hover:-translate-y-2 group-hover:border-theme-500/60 group-hover:shadow-[0_10px_30px_rgba(var(--theme-500),0.15)] overflow-hidden">
            {/* 角のアクセント */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/0 group-hover:border-theme-500/40 transition-colors pointer-events-none rounded-none" />
            
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
              <h3 className="text-sm font-mono font-bold text-theme-300 truncate uppercase tracking-widest group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]">
                {playlist.title}
              </h3>
              <p className="text-[10px] font-mono text-theme-500/60 uppercase">
                // PLAYLIST_DATA
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

// コンポーネントにdisplayNameを設定
SongListSection.displayName = "SongListSection";
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
        <SongListSection
          songs={songs}
          playlistId={playlistId}
          onPlay={handlePlay}
        />
      )}
      {activeTab === "playlists" && <PlaylistSection playlists={playlists} />}
    </div>
  );
};

export default SearchContent;
