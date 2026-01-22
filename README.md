# BadWave (Web)

**BadWave** は、Next.js 16 (App Router) を採用した、モダンかつ高機能な音楽ストリーミング Web アプリケーションです。「ただ音楽を聴くだけ」ではなく、視覚的な没入感（Pulse Mode）や、高度なオーディオエフェクト（8D Audio, Nightcore）など、Web 技術の限界に挑戦したリッチなユーザー体験を提供します。

## 🚀 プロジェクトのハイライト

採用担当者・エンジニアの方へ向けた、本プロジェクトの技術的なこだわりポイントです。

### 1. 高度なオーディオエンジンとエフェクト

単なる `<audio>` タグのラッパーではなく、Web Audio API と **Zustand** を組み合わせたステートフルなオーディオエンジンを独自実装しています。

- **リアルタイムエフェクト**: `useAudioEffects` フックにより、再生速度調整 (Nightcore)、空間オーディオシミュレーション (8D Audio)、リバーブ付与 (Slowed + Reverb) をクライアントサイドでリアルタイムに処理しています。
- **デュアルプレイヤーアーキテクチャ**: メインの音楽再生 (`useAudioPlayer`) と、波形可視化や特殊再生を行う `useAudioWave` (WaveSurfer ベース) を連携させ、シームレスな切り替えを実現しています。

### 2. "Pulse" モード (没入型音楽体験)

`app/pulse` ディレクトリで実装されたこのモードは、音楽のジャンル（CityPop, Vaporwave）に合わせて UI テーマ、ビジュアライザー、背景アニメーションが動的に変化します。

- **Canvas ビジュアライザー**: 再生中のオーディオ周波数を解析し、React コンポーネント外の Canvas レイヤーで高フレームレートな波形描画を行っています。

### 3. モダンなデータフェッチ戦略

**Server Actions** と **TanStack Query (v5)** を組み合わせることで、以下の UX を実現しています。

- **楽観的更新 (Optimistic Updates)**: 「いいね」やプレイリスト追加などのアクションは即座に UI に反映され、バックグラウンドでサーバーと同期します。失敗時は自動的にロールバックされます。
- **無限スクロール**: `useGetAllSongsPaginated` などのフックにより、大量の楽曲データを効率的に読み込みます。

## 🛠 技術スタック

| Category          | Technology                      | Usage                                        |
| :---------------- | :------------------------------ | :------------------------------------------- |
| **Framework**     | **Next.js 16** (App Router)     | アプリケーション基盤、SSR/RSC                |
| **Language**      | **TypeScript**                  | 厳格な型安全性                               |
| **State**         | **Zustand**                     | グローバルクライアント状態 (Player, Effects) |
| **Data Fetching** | **TanStack Query v5**           | サーバー状態管理、キャッシュ、楽観的UI       |
| **Styling**       | **Tailwind CSS**, **shadcn/ui** | デザインシステム、レスポンシブUI             |
| **Motion**        | **Framer Motion**               | 複雑なアニメーション制御                     |
| **Database**      | **Supabase** (PostgreSQL)       | リレーショナルデータ、RLSによるセキュリティ  |
| **Auth**          | **Supabase Auth**               | GitHub / Email 認証                          |
| **Storage**       | **Cloudflare R2** / AWS S3      | 楽曲・画像データの安価かつ高速な配信         |

## 📂 ディレクトリ構造の解説

```bash
badwave/
├── actions/            # Server Actions (DB操作、R2署名など)
├── app/                # Next.js App Router (ページ、レイアウト)
│   ├── (site)/         # 一般的なブラウジング画面
│   ├── pulse/          # 特殊機能 "Pulse" モードの実装
│   └── ...
├── components/         # UIコンポーネント
│   ├── Player/         # プレイヤーUI (制御、シークバー等)
│   ├── AudioWaveform/  # 波形可視化コンポーネント
│   └── ...
├── hooks/
│   ├── audio/          # Web Audio API 関連ロジック (Effects, Wave, Player)
│   ├── data/           # TanStack Query ラッパー (useGet..., useMutate...)
│   └── stores/         # Zustand ストア (PlayerState, Volume, Equalizer)
├── libs/               # 外部サービス設定 (Supabase, Admin権限確認)
└── providers/          # Context Providers (Auth, Theme, Toast)
```

## 🏁 開発の始め方

### 前提条件

- Node.js (LTS 推奨)
- npm

### インストール手順

1. **リポジトリのクローン:**

   ```bash
   git clone https://github.com/yourusername/badwave.git
   cd badwave
   ```

2. **依存関係のインストール:**

   ```bash
   npm install
   ```

3. **環境変数の設定:**
   ルートディレクトリに `.env.local` を作成し、必要な認証情報を設定してください。

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

   # Cloudflare R2 / S3 Configuration
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=...
   R2_ENDPOINT=...
   ```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### テストの実行

Jest による単体・統合テストが含まれています。

```bash
npm test
```
