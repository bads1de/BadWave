import { Playlist } from "@/types";
import { createClient } from "@/libs/supabase/server";

/**
 * 指定されたプレイリストIDのプレイリスト情報を取得する
 * @param {string} playlistId プレイリストID
 * @returns {Promise<Playlist | null>} プレイリスト情報。取得できない場合はnullを返す
 */
const getPlaylist = async (playlistId: string): Promise<Playlist | null> => {
  const supabase = await createClient();

  const { data: playlist, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", playlistId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching playlist:", error);
    throw new Error(error.message);
  }

  return playlist;
};

export default getPlaylist;
