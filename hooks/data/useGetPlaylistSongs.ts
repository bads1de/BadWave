import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES, TABLES } from "@/constants";
import { extractSongsFromJoin } from "@/libs/song/songUtils";

/**
 * プレイリストの曲を取得するカスタムフック
 *
 * @param playlistId プレイリストID
 * @returns プレイリストの曲のリストとローディング状態
 */
const useGetPlaylistSongs = (playlistId?: string) => {
  const supabaseClient = createClient();

  const {
    data: songs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
    queryFn: async () => {
      if (!playlistId) return [];

      const { data, error } = await supabaseClient
        .from(TABLES.PLAYLIST_SONGS)
        .select("*, songs(*)")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching playlist songs:", error);
        throw new Error("プレイリストの曲の取得に失敗しました");
      }

      // データがなければ空の配列を返す
      if (!data) return [];

      return extractSongsFromJoin(data);
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
