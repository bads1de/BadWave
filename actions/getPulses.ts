import { Pulse } from "@/types";
import { createClient } from "@/libs/supabase/server";
import { getErrorMessage } from "@/libs/utils/error";

/**
 * @returns Pulse[]
 * サーバーコンポーネントクライアントを作成し、データベースからPulseを取得します。
 * Pulseは、作成日の降順で並べ替えられます。
 * エラーが発生した場合は、エラーメッセージをコンソールに出力します。
 *
 */
const getPulses = async (): Promise<Pulse[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pulses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pulses:", getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }

  return (data as Pulse[]) || [];
};

export default getPulses;
