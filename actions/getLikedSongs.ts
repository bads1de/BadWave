import { Song, SongType } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { extractSongsFromJoin } from "@/libs/song/songUtils";
import { getErrorMessage } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * 現在のユーザーが「いいね」した曲一覧を取得する
 * @param {'regular'} [songType='regular'] - 曲のタイプ
 * @returns {Promise<Song[]>} いいねした曲の配列
 */
const getLikedSongs = async (
  songType: SongType = "regular"
): Promise<Song[]> => {
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

  if (error) {
    console.error("Error fetching liked songs:", error);
    throw new Error(getErrorMessage(error));
  }

  // データがなければ空の配列を返す
  if (!data) return [];

  return extractSongsFromJoin(data);
};

export default getLikedSongs;
