import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { getErrorMessage } from "@/libs/utils/error";

/**
 * 全ての曲を取得する
 * @returns {Promise<Song[]>} 曲の配列
 */
const getSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching songs:", getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }

  return (data as Song[]) || [];
};

export default getSongs;
