import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type PlaylistSong = Song & { songType: "regular" };

/**
 * 指定されたプレイリストIDに含まれる曲を取得する
 * @param {string} playlistId プレイリストID
 * @returns {Promise<PlaylistSong[]>} プレイリストに含まれる曲の配列
 */
const getPlaylistSongs = async (
  playlistId: string
): Promise<PlaylistSong[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from("playlist_songs")
    .select("*, songs(*)")
    .eq("playlist_id", playlistId)
    .eq("user_id", user.id)
    .eq("song_type", "regular")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching playlist songs:", error);
    return [];
  }

  return (data || []).map((item) => ({
    ...item.songs,
    songType: "regular",
  }));
};

export default getPlaylistSongs;
