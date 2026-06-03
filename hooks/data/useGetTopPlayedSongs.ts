import { type TopPlayedSong } from "@/types";
import { type Period } from "@/types/stats";
import { createClient } from "@/libs/supabase/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import { getErrorMessage } from "@/libs/utils/error";

const useGetTopPlayedSongs = (userId?: string, period: Period = "day") => {
  const supabase = createClient();

  const {
    data: topSongs,
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.getTopSongs, userId, period],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc("get_top_songs", {
        p_user_id: userId,
        p_period: period,
      });

      if (error) {
        throw new Error(`再生履歴の取得に失敗しました: ${getErrorMessage(error)}`);
      }

      return (data || []) as TopPlayedSong[];
    },
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    enabled: !!userId,
    placeholderData: keepPreviousData,
  });

  return {
    topSongs: topSongs ?? [],
    isLoading,
    error,
  };
};

export default useGetTopPlayedSongs;
