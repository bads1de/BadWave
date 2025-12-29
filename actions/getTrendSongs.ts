"use server";

import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { subMonths, subWeeks, subDays } from "date-fns";

/**
 * 指定された期間に基づいてトレンド曲をサーバーサイドで取得する
 * @param {"all" | "month" | "week" | "day"} period - 取得する期間
 * @returns {Promise<Song[]>} トレンド曲の配列
 */
const getTrendSongs = async (
  period: "all" | "month" | "week" | "day" = "all"
): Promise<Song[]> => {
  const supabase = await createClient();

  let query = supabase.from("songs").select("*");

  // 指定された期間に基づいてデータをフィルタリング
  switch (period) {
    case "month":
      query = query.filter(
        "created_at",
        "gte",
        subMonths(new Date(), 1).toISOString()
      );
      break;
    case "week":
      query = query.filter(
        "created_at",
        "gte",
        subWeeks(new Date(), 1).toISOString()
      );
      break;
    case "day":
      query = query.filter(
        "created_at",
        "gte",
        subDays(new Date(), 1).toISOString()
      );
      break;
    default:
      break;
  }

  // データを取得し、カウントの降順でソートし、最大10曲まで取得
  const { data, error } = await query
    .order("count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching trend songs:", error.message);
    throw new Error(error.message);
  }

  return (data as Song[]) || [];
};

export default getTrendSongs;
