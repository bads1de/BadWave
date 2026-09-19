"use server";

import { Spotlight } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { throwOnSupabaseError } from "@/libs/utils/error";
import { TABLES } from "@/constants";

/**
 * @returns Spotlight[]
 * サーバーコンポーネントクライアントを作成し、データベースからスポットライトを取得します。
 * スポットライトは、作成日の降順で並べ替えられます。
 * エラーが発生した場合は、エラーメッセージをコンソールに出力します。
 *
 */
const getSpotlight = async (): Promise<Spotlight[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.SPOTLIGHTS)
    .select("*")
    .order("created_at", { ascending: false });

  throwOnSupabaseError(error, "Error fetching spotlights");

  return (data as Spotlight[]) || [];
};

export default getSpotlight;
