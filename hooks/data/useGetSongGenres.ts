import { Song } from "@/types";
import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES, TABLES } from "@/constants";
import { getErrorMessage } from "@/libs/utils/error";

/**
 * 指定されたジャンルに一致する曲を取得するカスタムフック
 *
 * @param genres 取得する曲のジャンルの配列
 * @param excludeId 除外する曲のID（オプション）
 * @returns 取得した曲の配列、ローディング状態、エラー
 */
const useGetSongsByGenres = (genres: string[], excludeId?: string) => {
  const supabaseClient = createClient();

  const {
    data: songGenres = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.songsByGenres, genres, excludeId],
    queryFn: async () => {
      if (genres.length === 0) {
        return [];
      }

      let query = supabaseClient.from(TABLES.SONGS).select("*");

      // ジャンルのOR条件を構築
      const genreConditions = genres.map((genre) => `genre.ilike.%${genre}%`);
      query = query.or(genreConditions.join(","));

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      query = query.limit(3);

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `ジャンルによる曲の取得に失敗しました: ${getErrorMessage(error)}`
        );
      }

      return (data as Song[]) || [];
    },
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    enabled: genres.length > 0,
  });


  return {
    isLoading,
    songGenres,
    error,
  };
};

export default useGetSongsByGenres;
