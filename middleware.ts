import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES } from "./constants";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 保護されたルートのパターンをチェック
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // ユーザーが存在しない場合（未認証）で、保護されたルートにアクセスしようとした場合
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  // PROTECTED_ROUTESの各ルートに対してマッチャーを生成
  matcher: PROTECTED_ROUTES.map((route) => `${route}/:path*`),
};
