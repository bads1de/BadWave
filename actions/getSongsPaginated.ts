"use server";

import { Song, type PaginatedSongsResult } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * ページネーション対応の曲取得
 * @param page - ページ番号 (0-indexed)
 * @param pageSize - 1ページあたりの曲数
 * @returns ページネーションされた曲データ
 */
const getSongsPaginated = async (
  page: number = 0,
  pageSize: number = 24
): Promise<PaginatedSongsResult> => {
  const supabase = await createClient();
  const offset = page * pageSize;

  // 曲と総件数を並列取得
  const [songsResult, countResult] = await Promise.all([
    supabase
      .from(TABLES.SONGS)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1),
    supabase.from(TABLES.SONGS).select("*", { count: "exact", head: true }),
  ]);

  // 曲取得・件数取得の両方のエラーを検査する
  throwOnSupabaseError(songsResult.error, "Error fetching songs");
  throwOnSupabaseError(countResult.error, "Error fetching songs count");

  const totalCount = countResult.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    songs: (songsResult.data as Song[]) || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
};

export default getSongsPaginated;
