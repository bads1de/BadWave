import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";
import { User } from "@supabase/supabase-js";

interface AuthResult {
  user: User | null;
  error?: string;
}

/**
 * クライアントサイドでユーザーの認証状態を確認する
 * @param {boolean} showToast - エラー時にトーストを表示するかどうか
 * @returns {Promise<AuthResult>} 認証結果を含むオブジェクト
 */
export const checkClientAuth = async (
  showToast: boolean = true
): Promise<AuthResult> => {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      if (showToast) {
        toast.error("認証エラーが発生しました");
      }
      return {
        user: null,
        error: authError.message,
      };
    }

    if (!user) {
      if (showToast) {
        toast.error("認証エラーが発生しました");
      }
      return {
        user: null,
        error: "ユーザーが見つかりません",
      };
    }

    return { user };
  } catch (error) {
    if (showToast) {
      toast.error("認証エラーが発生しました");
    }
    return {
      user: null,
      error:
        error instanceof Error ? error.message : "不明なエラーが発生しました",
    };
  }
};
