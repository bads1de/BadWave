"use client";

import { Spotlight } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import getSpotlight from "@/actions/getSpotlight";

/**
 * スポットライトデータを取得するカスタムフック
 *
 * Server Action を単一の情報源として利用する。
 *
 * @param initialData - サーバーから取得した初期データ（オプション）
 * @returns スポットライトのリストとローディング状態
 */
const useGetSpotlight = (initialData: Spotlight[] = []) => {
  const {
    data: spotlights = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.spotlight],
    queryFn: () => getSpotlight(),
    initialData: initialData.length > 0 ? initialData : undefined,
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    // 初期データがある場合は再取得しない（必要に応じて調整可能）
    enabled: initialData.length === 0,
  });

  return {
    spotlights,
    isLoading,
    error,
  };
};

export default useGetSpotlight;
