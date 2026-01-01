"use server";

import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";

interface PaginatedSongsResult {
  songs: Song[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

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
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1),
    supabase.from("songs").select("*", { count: "exact", head: true }),
  ]);

  if (songsResult.error) {
    console.error("Error fetching songs:", songsResult.error.message);
    throw new Error(songsResult.error.message);
  }

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
