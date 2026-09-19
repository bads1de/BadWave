"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import getLikedSongs from "@/actions/getLikedSongs";

/**
 * ユーザーがいいねした曲を取得するカスタムフック
 *
 * Server Action を単一の情報源として利用する。
 *
 * @param userId ユーザーID
 * @returns いいねした曲のリストとローディング状態
 */
const useGetLikedSongs = (userId?: string) => {
  const {
    data: likedSongs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.likedSongs, userId],
    queryFn: () => getLikedSongs(),
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    enabled: !!userId,
  });

  return {
    likedSongs,
    isLoading,
    error,
  };
};

export default useGetLikedSongs;
