"use server";

import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { extractSongsFromJoin } from "@/libs/song/songUtils";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * 現在のユーザーが「いいね」した曲一覧を取得する
 * @returns {Promise<Song[]>} いいねした曲の配列
 */
const getLikedSongs = async (): Promise<Song[]> => {
  // supabaseクライアントを初期化
  const supabase = await createClient();

  // 現在のユーザーセッションを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  // いいねされた曲を取得
  const { data, error } = await supabase
    .from(TABLES.LIKED_SONGS_REGULAR)
    .select("*, songs(*)") // 関連する曲の情報も含めて取得
    .eq("user_id", user?.id) // ユーザーIDで絞り込み
    .order("created_at", { ascending: false }); // 作成日時で降順ソート

  throwOnSupabaseError(error, "Error fetching liked songs");

  // データがなければ空の配列を返す
  if (!data) return [];

  return extractSongsFromJoin(data);
};

export default getLikedSongs;
