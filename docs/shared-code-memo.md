# Phase 0: 共通コード（web/desktop/mobile）統合メモ

3環境（badwave / badwave-desktop / badwave-mobile）は同じ系統のコードを
コピーして派生しており、共通部分が重複しつつ drift（乖離）している。
このファイルは統合・整理の進捗と知見を記録する。

## 背景（調査で判明した事実）

- web↔desktop は同一パスのソースファイルが **164個**（テスト除く）存在
- うち **14個はバイト単位で完全一致**（→ 2026-10-18 再計測: 改行正規化後 12。「対応済み 6」参照）
- ただし中核ロジックは既に drift している:
  - `constants/errorMessages.ts` — 38行(web) / 78行(desktop) / 66行(mobile)
  - `libs/utils/error.ts` — 実装は同一だが drift しやすい
  - Zustand ストア — 永続化層が別物（web=localStorage / mobile=MMKV）
- そもそもフレームワークが違う（web: React19 / desktop: React18 / mobile: React19）
  → 共有できるのは「フレームワーク非依存の純粋ロジック」のみ

## 統合の基本方針

- 闇雲に統合しない。**1ファイルずつ中身を読んで統合可否を判断**する
- 同じパスでも中身は2種類ある:
  1. **完全一致で統合できる**（純粋関数・フレームワーク非依存ロジック）
  2. **環境ごとに drift していて統合が危険**（値・構造が違うもの）
- 安易な統合は「同じキーを叩いても環境で挙動が変わるバグ」を生む

## 対応済み

### 1. `libs/utils/error.ts`（getErrorMessage）

- 状態: **3環境で実装が完全に同一**（統合候補）
- 対応: 各環境の実装に「3環境で完全に同一。変更時は3環境すべてに同じ差分を適用すること」
  という注記を追加（drift 防止の意識付け）
- desktop 内では `electron/lib/error.ts` が**唯一の真実**で、
  レンダラー側 `libs/utils/error.ts` は**再エクスポートのみ**（理想的な共有パターン）
- 検証: web 16 / mobile 9 テスト PASS、desktop tsc PASS、実コード差分ゼロ

### 2. `constants/errorMessages.ts`（ERROR_MESSAGES）

- 状態: **統合は見送り**（環境ごとにキー名・値・構造が異なる）
  - 値が異なる例: `TITLE_REQUIRED` は web/desktop「タイトルを…」 mobile「プレイリスト名を…」
  - キー名が異なる例: `LOGOUT_FAILED`(web/desktop) と `SIGNOUT_FAILED`(mobile)
  - 構造が異なる例: mobile は `AUTH_ERRORS` 等のカテゴリ別辞書を持つ
- 対応: 各環境に「環境ごとにキー名・値・構造が異なる。統合・変更時は3環境すべてで
  差分を確認すること」という注意喚起コメントを追加（drift の可視化）
- 検証: 3環境 tsc PASS、実コード差分ゼロ

### 3. `constants/colorSchemes.ts`（テーマ定義）

- 状態: **web↔desktop は「DEFAULT 以外完全一致」= 統合候補、mobile は統合不可**
  - 機械比較の結果、差分は `DEFAULT_COLOR_SCHEME_ID` の1行のみ（web="violet" / desktop="cyberpunk"）
  - 当該差は**意図的**（各環境のテストで値を固定: web=`__tests__/constants/colorSchemes.test.ts`）
  - mobile の対応物は `constants/ThemeColors.ts` — 5テーマ・別キー構造（`theme300` 等の色キーが無い）で統合不可
- 対応: web/desktop の冒頭に「共通部分は完全に同一・差分は意図的な DEFAULT のみ」の注記、
  `DEFAULT_COLOR_SCHEME_ID` 行にも意図差の注記を追加
- 検証: 定数テスト web 25 / desktop 33 件 PASS、3環境 tsc PASS、実コード差分ゼロ

### 4. `constants/index.ts`（純粋定数）

- 状態: **ファイル全体では統合不可。定数単位で選別可能**:
  - 3環境同一: `CACHE_PREFIX`（"@query-cache"）/ `CACHE_CONFIG.staleTime`（10分）
  - web=desktop 完全一致: `videoIds` / `genres`
  - 意図的な差: `CACHE_CONFIG.gcTime`（web/desktop=30分 / mobile=7日）
  - 上位集合: `CACHED_QUERIES`（desktop = web + 5キー。共通15キーは値まで一致）/
    `TABLES`（desktop = web + `PLAY_HISTORY`）
  - 別体系: mobile の `CACHED_QUERIES` / `SUPABASE_TABLES`（キー命名が異なる）
  - 環境固有: `PROTECTED_ROUTES` / `DURATIONS`（web/desktop は秒・mobile は
    `ANIMATION_DURATION` ミリ秒）/ `SPRING_*` / `ROUTES`
- 知見: web の `PROTECTED_ROUTES` は `"/playlist"`（単数）で、実ルート `"/playlists"` を
  `startsWith` の prefix 一致で偶然カバーしている。desktop は `"/playlists"` を保護しない（→ 5 で対応・判断記録）
- 対応: 3環境の `constants/index.ts` 冒頭に定数単位の drift マップ注記を追加
- 検証: 定数テスト web 25 / desktop 33 / mobile 62 件 + 3環境 tsc PASS。実コード差分ゼロ

### 5. `PROTECTED_ROUTES` の単数/複数整理（web）

- 状態: web の `"/playlist"`（単数）は実ルート `"/playlists"` と不一致。
  `startsWith` の prefix 一致で偶然 /playlists と配下を保護していた
- 対応: `"/playlists"` に修正し、`proxy.ts` のテストに「未認証で /playlists・/playlists/abc123 →
  ホームへリダイレクト」を追加。`constants` テストにも `/playlists` の存在チェックを追加
- desktop 側は変更なし（matcher が `/account/:path*`・`/liked/:path*` のみで、`/playlists` は
  未認証時も空状態を表示する設計。詳細は desktop 側メモの 5）
- 検証: proxy/constants テスト 29 件 PASS、tsc PASS

### 6. バイト一致ファイルの棚卸し（計測の固定）

- 対応: 機械比較スクリプト `scripts/compare-shared-code.mjs` を web に追加
  - 対象: *.ts / *.tsx（`__tests__` は既定で除外、`--include-tests` で含む）
  - 同一パス（大文字小文字は区別しない）を内容比較。改行コード（CRLF/LF）は既定で正規化
    （`--raw` でバイト単位）。`next-env.d.ts`（gitignore 対象の自動生成物）と
    `node_modules` 等の生成物ディレクトリは除外
- 確定値（2026-10-18、web↔desktop、テスト除く）:
  - 同一パス **164** ファイル（初版メモの 164 と一致）
  - 内容一致（改行正規化後）**12** / バイト完全一致 **11**
    （差の 1 件は `hooks/stores/useLyricsModalStore.ts` の改行のみ）
  - 参考: web↔mobile は同一パス 12 ファイル・一致 0（mobile メモの「実体もほぼ別物」を確認）
- 統合候補 12 ファイル:
  - `components/common/Hover.tsx` / `components/common/ScrollingText.tsx`
  - `components/Genre/GenreBoard.tsx` / `components/KeyboardShortcuts.tsx`
  - `components/Song/SongItemSkeleton.tsx` / `hooks/data/useDownload.ts`
  - `hooks/modal/useSpotlightModal.ts` / `hooks/stores/useLyricsModalStore.ts`
  - `hooks/stores/useLyricsStore.ts` / `hooks/utils/useDebounce.ts`
  - `libs/supabase/client.ts` / `providers/UserProvider.tsx`
- 初版メモの「14 個」は現存コミットの組み合わせでは再現できず（最大 13: web@0e57fac^ 時点）。
  計測条件の差と推定し、**以後は本スクリプトの出力を正**とする
  （手作業計測は `next-env.d.ts` の混入などでずれる）
- 検証: スクリプト出力（再実行可能）。コード変更なし

## 次の候補（未着手）

- 統合候補 12 ファイルの扱い決め（`@badwave/shared` 第一期の対象選定）
- 将来的に `@badwave/shared` パッケージを作り、真実を1箇所に集約する

## 原則

- **「モノレポ化」と「共通化」は同時にやらない。**
  先に drift を解消してから、モノレポの器に載せるのが安全。
- 変更は「コメントのみ・挙動を変えない」安全パターンを徹底し、都度テスト/tscで検証する。
