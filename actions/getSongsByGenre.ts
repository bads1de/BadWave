import { createClient } from "@/libs/supabase/server";
import { Song } from "@/types";
import { parseGenres } from "@/libs/song/songUtils";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * 指定したジャンルの曲一覧を取得する
 * @param {string | string[]} genre - ジャンル名またはジャンル名の配列
 * @returns {Promise<Song[]>} 曲の配列
 */
const getSongsByGenre = async (genre: string | string[]): Promise<Song[]> => {
  const genreArray =
    typeof genre === "string"
      ? parseGenres(genre)
      : (genre ?? []).map((g) => g.trim()).filter(Boolean);

  // ジャンルが未指定の場合は空で返す。
  // `.or("")` は不正なフィルタになり、`genre.ilike.%%` は全件一致になってしまうため。
  if (genreArray.length === 0) return [];

  const supabase = await createClient();

  // データベースから曲を検索
  const { data, error } = await supabase
    .from(TABLES.SONGS)
    .select("*")
    .or(genreArray.map((genre) => `genre.ilike.%${genre}%`).join(","))
    .order("created_at", { ascending: false });

  throwOnSupabaseError(error, "Error fetching songs by genre");

  return (data as Song[]) || [];
};

export default getSongsByGenre;
