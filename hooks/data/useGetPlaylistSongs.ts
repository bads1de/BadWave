"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import getPlaylistSongs from "@/actions/getPlaylistSongs";

/**
 * プレイリストの曲を取得するカスタムフック
 *
 * Server Action を単一の情報源として利用し、プライバシー判定や
 * song_type フィルタなどのロジックを重複させない。
 *
 * @param playlistId プレイリストID
 * @returns プレイリストの曲のリストとローディング状態
 */
const useGetPlaylistSongs = (playlistId?: string) => {
  const {
    data: songs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
    queryFn: async () => {
      if (!playlistId) return [];

      return getPlaylistSongs(playlistId);
    },
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    enabled: !!playlistId,
  });

  return {
    songs,
    isLoading,
    error,
  };
};

export default useGetPlaylistSongs;
