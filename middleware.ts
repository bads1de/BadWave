import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES } from "./constants";
import { updateSession } from "./libs/supabase/middleware";

export async function middleware(request: NextRequest) {
  // セッションの更新とユーザー情報の取得
  const { response, user } = await updateSession(request);

  // 保護されたルートのパターンをチェック
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // ユーザーが存在しない場合（未認証）で、保護されたルートにアクセスしようとした場合
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // PROTECTED_ROUTESの各ルートに対してマッチャーを生成
  matcher: ["/account/:path*", "/liked/:path*"],
};
