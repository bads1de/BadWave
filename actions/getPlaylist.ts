import { Playlist } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * 指定されたプレイリストIDのプレイリスト情報を取得する
 * @param {string} playlistId プレイリストID
 * @returns {Promise<Playlist | null>} プレイリスト情報。取得できない場合はnullを返す
 */
const getPlaylist = async (playlistId: string): Promise<Playlist | null> => {
  const supabase = await createClient();

  const { data: playlist, error } = await supabase
    .from(TABLES.PLAYLISTS)
    .select("*")
    .eq("id", playlistId)
    .maybeSingle();

  throwOnSupabaseError(error, "Error fetching playlist");

  return playlist;
};

export default getPlaylist;
