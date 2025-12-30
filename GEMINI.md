# BadWave

## プロジェクト概要
BadWaveは、Next.js 14+ (App Router) で構築された音楽ストリーミングアプリケーションです。Tailwind CSSとshadcn/uiを使用したモダンなUI、Zustandによる状態管理、React Queryによるデータフェッチングを特徴としています。バックエンドサービスには認証とデータベースにSupabase、決済にStripeを使用しています。

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
- `app/`: Next.js App Routerのページとレイアウト。
- `components/`: 再利用可能なUIコンポーネント。
  - `ui/`: shadcn/uiのプリミティブコンポーネント。
- `actions/`: データ変更と取得のためのServer Actions。
- `hooks/`: カスタムReactフック (ストアを含む)。
- `libs/`: ユーティリティ関数とライブラリ設定 (Supabase, Stripeなど)。
- `providers/`: Reactコンテキストプロバイダー (Theme, Toastなど)。
- `__tests__/`: Jestテストファイル。
- `types.ts`: グローバルなTypeScript型定義。

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
プロジェクトはテストにJestとReact Testing Libraryを使用しています。

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
- **スタイリング:** Tailwind CSSのユーティリティクラスを使用します。必要な場合を除き、CSS Modulesは避けてください。
- **Server Actions:** サーバーサイドのロジックは `actions/` に配置してください。
- **状態:** グローバルなクライアント状態 (プレイヤー、音量など) にはZustandを使用します。

## 設定ファイル
- `next.config.js`: Next.jsの設定 (R2のリモートパターンを含む)。
- `tailwind.config.ts`: Tailwind CSSの設定。
- `components.json`: shadcn/uiの設定。
- `jest.config.js`: Jestのテスト設定。