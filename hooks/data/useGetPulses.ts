"use client";

import { Pulse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import getPulses from "@/actions/getPulses";

/**
 * Pulseデータを取得するカスタムフック
 *
 * Server Action を単一の情報源として利用する。
 *
 * @param initialData - サーバーから取得した初期データ（オプション）
 * @returns Pulseのリストとローディング状態
 */
const useGetPulses = (initialData: Pulse[] = []) => {
  const {
    data: pulses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [CACHED_QUERIES.pulse],
    queryFn: () => getPulses(),
    initialData: initialData.length > 0 ? initialData : undefined,
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
    // 初期データがある場合は再取得しない（必要に応じて調整可能）
    enabled: initialData.length === 0,
  });

  return {
    pulses,
    isLoading,
    error,
  };
};

export default useGetPulses;
