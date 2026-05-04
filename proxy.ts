import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES } from "./constants";
import { updateSession } from "./libs/supabase/middleware";

export async function proxy(request: NextRequest) {
  // セッションの更新とユーザー情報の取得
  const { response, user } = await updateSession(request);

  // 保護されたルートのパターンをチェック
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // ユーザーが存在しない場合（未認証）で、保護されたルートにアクセスしようとした場合
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // updateSessionで設定されたCookie（セッションクリア等）をリダイレクトレスポンスに引き継ぐ
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
