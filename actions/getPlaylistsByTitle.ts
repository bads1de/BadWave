import { createClient } from "@/libs/supabase/server";
import { Playlist } from "@/types";
import { getErrorMessage } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * タイトルでパブリックプレイリストを検索する
 * @param {string} title 検索するタイトル
 * @returns {Promise<{playlists: Playlist[]}>} プレイリストオブジェクト
 */
const getPlaylistsByTitle = async (title: string) => {
  const supabase = await createClient();

  // タイトルが空の場合は空の配列を返す
  if (!title) {
    return {
      playlists: [],
    };
  }

  const { data, error } = await supabase
    .from(TABLES.PLAYLISTS)
    .select("*")
    .eq("is_public", true) // パブリック状態のプレイリストのみ
    .ilike("title", `%${title}%`) // タイトルで検索
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching playlists:", error);
    throw new Error(getErrorMessage(error));
  }

  return {
    playlists: (data as Playlist[]) || [],
  };
};

export default getPlaylistsByTitle;
