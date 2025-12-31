# BadWave

## プロジェクト概要

BadWave は、Next.js 14+ (App Router) で構築された音楽ストリーミングアプリケーションです。Tailwind CSS と shadcn/ui を使用したモダンな UI、Zustand による状態管理、React Query によるデータフェッチングを特徴としています。バックエンドサービスには認証とデータベースに Supabase、決済に Stripe を使用しています。

## 技術スタック

- **フレームワーク:** Next.js 14+ (App Router)
- **言語:** TypeScript
- **スタイリング:** Tailwind CSS, shadcn/ui
- **状態管理:** Zustand
- **データフェッチング:** TanStack Query (React Query)
- **データベース & 認証:** Supabase
- **ストレージ:** Cloudflare R2 (`next.config.js`で設定)
- **決済:** Stripe
- **テスト:** Jest, React Testing Library
- **アイコン:** React Icons, Lucide React

## プロジェクト構造

### ファイル階層図

```text
badwave/
├── app/              # Next.js App Router
│   ├── (site)/       # ルートとメインフィード
│   ├── account/      # アカウント管理
│   ├── genre/        # ジャンルページ
│   ├── liked/        # 「いいね」リスト
│   ├── playlists/    # プレイリスト
│   ├── pulse/        # Pulse機能
│   ├── search/       # 検索
│   ├── songs/        # 楽曲詳細
│   ├── api/          # APIルート
│   ├── layout.tsx    # ルートレイアウト
│   └── globals.css   # グローバルスタイル
├── components/       # コンポーネント
│   ├── ui/           # shadcn/ui プリミティブ
│   ├── common/       # 共通コンポーネント (ボタンなど)
│   ├── Player/       # 音楽プレイヤーUI
│   ├── Sidebar/      # サイドバー
│   ├── Header/       # ヘッダー
│   ├── Modals/       # 各種モーダル
│   └── ...           # 機能別コンポーネント (Trend, Latestなど)
├── actions/          # Server Actions
├── hooks/            # カスタムフック & Zustandストア
├── libs/             # ライブラリ設定 & ユーティリティ
│   ├── supabase/     # Supabaseクライアント
│   └── ...
├── providers/        # Contextプロバイダー
├── public/           # 静的ファイル
├── __tests__/        # テスト
└── types.ts          # 型定義
```

### 各ディレクトリの役割

- `app/`: Next.js App Router のページとレイアウト。
- `components/`: 再利用可能な UI コンポーネント。
  - `ui/`: shadcn/ui のプリミティブコンポーネント。
- `actions/`: データ変更と取得のための Server Actions。
- `hooks/`: カスタム React フック (ストアを含む)。
- `libs/`: ユーティリティ関数とライブラリ設定 (Supabase, Stripe など)。
- `providers/`: React コンテキストプロバイダー (Theme, Toast など)。
- `__tests__/`: Jest テストファイル。
- `types.ts`: グローバルな TypeScript 型定義。

## セットアップと開発

### 前提条件

- Node.js
- npm

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で利用可能になります。

### 本番ビルド

```bash
npm run build
npm start
```

### リント

```bash
npm run lint
```

## テスト

プロジェクトはテストに Jest と React Testing Library を使用しています。

### テストの実行

```bash
npm test
```

### テスト構造

テストは `__tests__` ディレクトリに配置され、可能な限り `app` や `components` ディレクトリの構造を反映しています。

- **ユニットテスト:** 個々のコンポーネントとフックに焦点を当てます。
- **統合テスト:** コンポーネントとプロバイダー間の相互作用をテストします。

## 主要な規約

- **コンポーネントの配置:** 共有コンポーネントは `components/` に配置します。ページ固有のコンポーネントは共存させるか、`app/` 内のサブディレクトリに配置できます。
- **インポート:** `@/` エイリアスを使用した絶対パスインポートを使用します (例: `@/components/Button`)。
- **スタイリング:** Tailwind CSS のユーティリティクラスを使用します。必要な場合を除き、CSS Modules は避けてください。
- **Server Actions:** サーバーサイドのロジックは `actions/` に配置してください。
- **状態:** グローバルなクライアント状態 (プレイヤー、音量など) には Zustand を使用します。

## 設定ファイル

- `next.config.js`: Next.js の設定 (R2 のリモートパターンを含む)。
- `tailwind.config.ts`: Tailwind CSS の設定。
- `components.json`: shadcn/ui の設定。
- `jest.config.js`: Jest のテスト設定。
