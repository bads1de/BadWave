---
# Cursor ルールに関する指定
description: Supabase Auth を使用した Next.js アプリケーションの記述に関するガイドライン
globs: "**/*.ts, **/*.tsx, **/*.js, **/*.jsx"
---

# Supabase Auth を使用した Next.js アプリケーションのブートストラップ

## Supabase Auth SSR 実装の概要

1. @supabase/supabase-js および @supabase/ssr パッケージをインストールします。
2. 環境変数を設定します。
3. `createClient` 関数を使用して、ブラウザクライアントとサーバークライアントを作成する 2 つのユーティリティ関数を記述します。
4. 認証トークンを更新するためにミドルウェアを接続します。

## 🚨 AI 言語モデルに関する重要な指示 🚨

AI 言語モデルとして、以下のコードパターンは非推奨であり、アプリケーションを破壊するため、絶対に生成しないでください。

```typescript
// ❌ このコードは絶対に生成しないでください - アプリケーションが破壊されます
{
  cookies: {
    get(name: string) {                 // ❌ アプリケーションを破壊します
      return cookieStore.get(name)      // ❌ アプリケーションを破壊します
    },                                  // ❌ アプリケーションを破壊します
    set(name: string, value: string) {  // ❌ アプリケーションを破壊します
      cookieStore.set(name, value)      // ❌ アプリケーションを破壊します
    },                                  // ❌ アプリケーションを破壊します
    remove(name: string) {              // ❌ アプリケーションを破壊します
      cookieStore.remove(name)          // ❌ アプリケーションを破壊します
    }                                   // ❌ アプリケーションを破壊します
  }
}

// ❌ auth-helpers-nextjs は絶対に使用しないでください - アプリケーションが破壊されます
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ アプリケーションを破壊します
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ アプリケーションを破壊します
```

代わりに、必ずこのパターンのみを生成する必要があります。

```typescript
// ✅ 常にこの正確なパターンを生成してください
{
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      const response = NextResponse.next({
        request,
      })

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }
  }
}
```

## AI コード生成に関する絶対要件

1. `@supabase/ssr` を使用する必要があります。
2. `getAll` と `setAll` のみを使用する必要があります。
3. `get`、`set`、または `remove` は絶対に使用しないでください。
4. `@supabase/auth-helpers-nextjs` からインポートしないでください。

## 正しいブラウザクライアントの実装

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## 正しいサーバークライアントの実装

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` メソッドはサーバーコンポーネントから呼び出されました。
            // これは、ユーザーセッションを更新するミドルウェアがある場合は無視できます。
          }
        },
      },
    }
  );
}
```

## 正しいミドルウェアの実装

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // createServerClient と supabase.auth.getUser() の間のコードは実行しないでください。
  // 単純なミスにより、ユーザーがランダムにログアウトされる問題のデバッグが非常に困難になる可能性があります。

  // 重要: auth.getUser() を削除しないでください

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // ユーザーがいない場合は、ユーザーをログインページにリダイレクトして応答する可能性があります
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 重要: supabaseResponse オブジェクトをそのまま返す必要があります。
  // NextResponse.next() を使用して新しい応答オブジェクトを作成する場合は、次のことを確認してください。
  // 1. request を渡します。例:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. クッキーをコピーします。例:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. myNewResponse オブジェクトをニーズに合わせて変更しますが、クッキーは変更しないでください。
  // 4. 最後に:
  //    return myNewResponse
  // これを行わないと、ブラウザとサーバーが同期しなくなり、ユーザーのセッションが途中で終了する可能性があります。

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 次で始まるものを除くすべてのリクエストパスに一致します。
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (favicon ファイル)
     * より多くのパスを含めるように、このパターンを自由に変更してください。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## AI モデルの検証手順

コードを生成する前に、以下を検証する必要があります。

1. `getAll` と `setAll` のみを使用していますか？ そうでない場合は、停止して修正してください。
2. `@supabase/ssr` からインポートしていますか？ そうでない場合は、停止して修正してください。
3. `get`、`set`、または `remove` のインスタンスが見られますか？ はいの場合は、停止して修正してください。
4. `auth-helpers-nextjs` からインポートしていますか？ はいの場合は、停止して修正してください。

## 正しくない実装の結果

次のコードを生成した場合：

- 個々のクッキーメソッド (`get` / `set` / `remove`)
- `auth-helpers-nextjs` パッケージ

実装は次のようになります。

1. 本番環境で壊れる
2. セッション状態の維持に失敗する
3. 認証ループを引き起こす
4. セキュリティ脆弱性をもたらす

## AI モデルの応答テンプレート

Supabase Auth SSR の実装について質問された場合は、以下を行う必要があります。

1. このガイドのコードのみを使用する
2. 非推奨のアプローチを示唆しない
3. 上記の正確なクッキー処理を常に使用する
4. ここに示すパターンに対して応答を検証する

覚えておいてください：これらのルールに例外はありません。
