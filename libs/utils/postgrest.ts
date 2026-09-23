/**
 * PostgREST のフィルタ値を安全な引用符付きリテラルへ変換する
 *
 * `or` 構文では `,` や `)` が条件の区切り文字として解釈されるため、
 * ユーザー入力をそのまま埋め込むとフィルタ注入になる。
 * 値を二重引用符で括り、内部の `"` は二重化して無害化する。
 *
 * @param value - フィルタに埋め込む生の値
 * @returns 引用符付きにエスケープされた値
 */
export const escapePostgrestValue = (value: string): string =>
  `"${value.replace(/"/g, '""')}"`;

/**
 * `column.op.value` 形式の PostgREST フィルタ断片を組み立てる
 *
 * @param column - カラム名
 * @param operator - 演算子（eq, ilike など）
 * @param value - 値（自動でエスケープされる）
 */
export const buildPostgrestFilter = (
  column: string,
  operator: string,
  value: string
): string => `${column}.${operator}.${escapePostgrestValue(value)}`;
