import { createClient } from "@/libs/supabase/server";
import { User } from "@supabase/supabase-js";

export interface ServerAuthResult {
  user: User | null;
  error: Error | null;
}

/**
 * サーバーサイドでユーザーの認証状態を確認する
 * @returns {Promise<ServerAuthResult>} 認証結果を含むオブジェクト
 */
export const checkServerAuth = async (): Promise<ServerAuthResult> => {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // セッションがない場合（ログアウト状態）は、エラーなしで返す
    if (!session) {
      return {
        user: null,
        error: null,
      };
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        user: null,
        error: new Error("認証エラーが発生しました。ログインしてください。"),
      };
    }

    if (!user) {
      return {
        user: null,
        error: new Error("ユーザーが見つかりません。ログインしてください。"),
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error:
        error instanceof Error
          ? error
          : new Error("不明なエラーが発生しました"),
    };
  }
};
