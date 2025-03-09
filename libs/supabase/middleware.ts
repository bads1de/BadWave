import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * ユーザーセッションを更新するミドルウェア関数
 * 全てのリクエストで実行され、認証状態を維持・更新する
 *
 * @param request - Next.jsのリクエストオブジェクト
 * @returns NextResponse - 更新されたCookieを含むレスポンス
 */
export async function updateSession(request: NextRequest) {
  // 初期レスポンスを作成
  // このレスポンスオブジェクトに後でCookieを設定する
  let response = NextResponse.next({
    request,
  });

  // Supabaseクライアントを初期化
  // Cookiesオブジェクトを通じてセッション管理を行う
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request,
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 現在のユーザー情報を取得
  // この呼び出しで以下が実行される：
  // 1. 既存のセッションCookieを検証
  // 2. 必要に応じてセッショントークンを更新
  // 3. 新しいCookieを設定（セッション延長）
  await supabase.auth.getUser();

  return response;
}
