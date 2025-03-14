import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * 全ての曲を取得する
 * @returns {Promise<Song[]>} 曲の配列
 */
const getSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.log(error.message);
    return [];
  }

  return (data as Song[]) || [];
};

export default getSongs;
