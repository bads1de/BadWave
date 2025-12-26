"use client";

import { Spotlight } from "@/types";
import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";

/**
 * スポットライトデータを取得するカスタムフック
 *
 * @param initialData - サーバーから取得した初期データ（オプション）
 * @returns スポットライトのリストとローディング状態
 */
const useGetSpotlight = (initialData: Spotlight[] = []) => {
  const supabaseClient = createClient();

  const {
    data: spotlights = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.spotlight],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("spotlights")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching spotlights:", error);
        throw new Error("スポットライトの取得に失敗しました");
      }

      return (data as Spotlight[]) || [];
    },
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
