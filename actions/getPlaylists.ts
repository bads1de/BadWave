import { createClient } from "@/libs/supabase/server";
import { Playlist } from "@/types";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * ユーザーのプレイリスト一覧を取得する
 * @returns {Promise<Playlist[]>} プレイリストの配列
 */
const getPlaylists = async (): Promise<Playlist[]> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLES.PLAYLISTS)
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  throwOnSupabaseError(error, "Failed to fetch playlists");

  return (data as Playlist[]) || [];
};

export default getPlaylists;
