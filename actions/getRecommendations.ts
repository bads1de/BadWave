import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";

const getRecommendations = async (limit: number = 10): Promise<Song[]> => {
  // supabaseクライアントを初期化
  const supabase = await createClient();

  // 現在のユーザーセッションを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  try {
    // 推薦曲を取得するファンクションを呼び出す
    const { data, error } = await supabase.rpc("get_recommendations", {
      p_user_id: user.id,
      p_limit: limit,
    });

    if (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }

    // データがない場合は空配列を返す
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // データを整形して返す
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      song_path: item.song_path,
      image_path: item.image_path,
      genre: item.genre,
      count: item.count || 0,
      like_count: item.like_count || 0,
      created_at: item.created_at,
      user_id: user.id,
      recommendation_score: item.score,
    }));
  } catch (e) {
    console.error("Exception in getRecommendations:", e);
    return [];
  }
};

export default getRecommendations;
