import { createClient } from "@/libs/supabase/server";
import { Playlist } from "@/types";
import { getErrorMessage } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * パブリックプレイリスト一覧を取得する
 * @returns {Promise<Playlist[]>} プレイリストの配列
 */
const getPublicPlaylists = async (limit: number = 6): Promise<Playlist[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.PLAYLISTS)
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching public playlists:", getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }

  return (data as Playlist[]) || [];
};

export default getPublicPlaylists;
