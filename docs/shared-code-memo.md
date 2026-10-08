# Phase 0: 共通コード（web/desktop/mobile）統合メモ

3環境（badwave / badwave-desktop / badwave-mobile）は同じ系統のコードを
コピーして派生しており、共通部分が重複しつつ drift（乖離）している。
このファイルは統合・整理の進捗と知見を記録する。

## 背景（調査で判明した事実）

- web↔desktop は同一パスのソースファイルが **164個**（テスト除く）存在
- うち **14個はバイト単位で完全一致**
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

## 次の候補（未着手）

- `constants/index.ts` の `CACHE_CONFIG` など、3環境で一致・かつ安全に統合できる純粋定数
- `constants/colorSchemes.ts`（テーマ定義）— 構造を確認して統合可否を判断
- 将来的に `@badwave/shared` パッケージを作り、真実を1箇所に集約する

## 原則

- **「モノレポ化」と「共通化」は同時にやらない。**
  先に drift を解消してから、モノレポの器に載せるのが安全。
- 変更は「コメントのみ・挙動を変えない」安全パターンを徹底し、都度テスト/tscで検証する。
