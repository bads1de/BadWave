import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // URLからコードを取得
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // codeを使用してセッションを交換
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ホームページにリダイレクト
  return NextResponse.redirect(requestUrl.origin);
}
