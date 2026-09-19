/**
 * catchブロックのエラーから安全にメッセージを取得する
 * @param error - catchされたエラー
 * @param fallback - フォールバックメッセージ
 * @returns エラーメッセージ
 */
export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

/**
 * Supabaseクエリが返したエラーを検査し、エラーがあればログ出力して例外を投げる
 * 各Server Actionで重複していたエラーハンドリングを一元化する
 * @param error - Supabaseから返されたエラー
 * @param context - ログに含めるエラー発生箇所
 */
export function throwOnSupabaseError(error: unknown, context: string): void {
  if (!error) return;

  const message = getErrorMessage(error);
  console.error(`${context}:`, message);
  throw new Error(message);
}
