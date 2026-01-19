"use client";

import { Song } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import getSongsPaginated from "@/actions/getSongsPaginated";

/**
 * ページネーション対応の曲取得結果
 */
interface PaginatedSongsResult {
  songs: Song[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * ページネーション対応の曲取得フック
 *
 * TanStack Query でキャッシュ管理
 *
 * @param page - 現在のページ番号 (0-indexed)
 * @param pageSize - 1ページあたりの曲数
 */
const useGetAllSongsPaginated = (page: number = 0, pageSize: number = 24) => {
  const { data, isLoading, error, isFetching } = useQuery<PaginatedSongsResult>(
    {
      queryKey: [CACHED_QUERIES.media, "allSongs", "paginated", page, pageSize],
      queryFn: () => getSongsPaginated(page, pageSize),
      staleTime: CACHE_CONFIG.staleTime,
      gcTime: CACHE_CONFIG.gcTime,
    },
  );

  if (error) {
    console.error("曲データの取得に失敗しました。", error);
  }

  return {
    songs: data?.songs || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 0,
    isLoading,
    isFetching,
    error,
  };
};

export default useGetAllSongsPaginated;
