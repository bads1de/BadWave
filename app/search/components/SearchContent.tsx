"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useOnPlay from "@/hooks/player/useOnPlay";
import { useUser } from "@/hooks/auth/useUser";
import { Playlist, Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";
import SongList from "@/components/Song/SongList";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const { user } = useUser();
  const player = usePlayer();
  const router = useRouter();

  const handlePlay = (id: string) => {
    onPlay(id);
    player.setId(id);
  };

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlists/${playlistId}`);
  };

  const renderSongs = (songsData: Song[]) => {
    if (songsData.length === 0) {
      return (
        <div className="flex flex-col gap-y-2 w-full text-neutral-400 p-6">
          <h1>該当の曲が見つかりませんでした</h1>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-y-2 w-full p-6">
        {songsData.map((song) => (
          <div key={song.id} className="flex items-center gap-x-4 w-full">
            <div className="flex-1 min-w-0">
              <SongList data={song} onClick={(id: string) => handlePlay(id)} />
            </div>
            {user?.id && (
              <SongOptionsPopover song={song} playlistId={playlistId} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPlaylists = (playlistsData: Playlist[]) => {
    if (playlistsData.length === 0) {
      return (
        <div className="flex flex-col gap-y-2 w-full text-neutral-400 p-6">
          <h1>該当のプレイリストが見つかりませんでした</h1>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4 p-6">
        {playlistsData.map((playlist) => (
          <div
            key={playlist.id}
            className="flex flex-col items-center p-3 cursor-pointer bg-neutral-800 hover:bg-neutral-700 transition rounded-md"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
              <Image
                className="object-cover"
                src={playlist.image_path || "/images/playlist.png"}
                fill
                alt="Playlist"
              />
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
              <p className="font-semibold truncate w-full">{playlist.title}</p>
              <p className="text-neutral-400 text-sm truncate w-full">
                {playlist.user_name || "ユーザー"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {activeTab === "songs" && renderSongs(songs)}
      {activeTab === "playlists" && renderPlaylists(playlists)}
    </div>
  );
};

export default SearchContent;
