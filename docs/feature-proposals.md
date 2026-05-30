# BadWave 機能提案ドキュメント

> 作成日: 2026-05-30
> コードベースの深堀り分析に基づく、実装可能な機能候補の一覧

---

## 目次

1. [既存機能の概要](#1-既存機能の概要)
2. [簡単な追加機能（★☆☆）](#2-簡単な追加機能★☆)
3. [中程度の追加機能（★★☆）](#3-中程度の追加機能★★)
4. [難しい追加機能（★★★）](#4-難しい追加機能★★★)
5. [UI/UX改善ポイント](#5-uiux改善ポイント)
6. [パフォーマンス改善ポイント](#6-パフォーマンス改善ポイント)
7. [アクセシビリティ改善ポイント](#7-アクセシビリティ改善ポイント)
8. [サイバーパンク/HUD風UIテーマに合った機能](#8-サイバーパンクhud風uiテーマに合った機能)

---

## 1. 既存機能の概要

### DBテーブル構造（`types/index.ts`）

| テーブル名         | 主要カラム                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **songs**          | `id`, `user_id`, `author`, `title`, `song_path`, `image_path`, `video_path?`, `genre?`, `count?`, `like_count?`, `lyrics?`, `created_at` |
| **user_details**   | `id`, `first_name`, `last_name`, `full_name?`, `avatar_url?`, `billing_address?`, `payment_method?`                                      |
| **playlists**      | `id`, `user_id`, `image_path?`, `title`, `is_public`, `created_at`, `user_name?`                                                         |
| **playlist_songs** | `id`, `user_id`, `playlist_id`, `song_id?`, `suno_song_id?`, `song_type("regular")`                                                      |
| **spotlight**      | `id`, `video_path`, `title`, `author`, `genre?`, `description?`                                                                          |
| **pulse**          | `id`, `title`, `genre`, `music_path`                                                                                                     |
| **liked**          | (直接型定義なし、`getLikedSongs` / `likeStatus` で操作)                                                                                  |
| **play_history**   | (RPC `get_user_stats` で使用)                                                                                                            |

### プレイヤーの全機能

| カテゴリ                  | 機能                                    | 実装状態 |
| ------------------------- | --------------------------------------- | -------- |
| **再生制御**              | 再生/一時停止/次曲/前曲                 | 完了     |
| **ループ**                | リピート再生（single-track）            | 完了     |
| **シャッフル**            | ランダム再生 + Fisher-Yates             | 完了     |
| **シーク**                | シークバー + 時間表示                   | 完了     |
| **音量**                  | スライダー + ミュート（0.0-1.0）        | 完了     |
| **再生状態復元**          | ページリロードで続きから再生（7日有効） | 完了     |
| **Media Session**         | OS メディアコントロール連携             | 完了     |
| **エラーハンドリング**    | 連続3回エラーで次曲スキップ + トースト  | 完了     |
| **モバイル/デスクトップ** | レスポンシブ対応                        | 完了     |

### エフェクト一覧と実装状況

| エフェクト              | Store                  | AudioEngine実装                             | UI                                     | 完了度 |
| ----------------------- | ---------------------- | ------------------------------------------- | -------------------------------------- | ------ |
| **再生速度**            | `usePlaybackRateStore` | `audio.playbackRate`                        | RadixSlider（0.5-1.5x）+ プリセット6種 | 完了   |
| **6バンドイコライザー** | `useEqualizerStore`    | 6つの `BiquadFilterNode`                    | スライダー + 6プリセット + カーブ表示  | 完了   |
| **Spatial Audio**       | `useSpatialStore`      | `spatialFilter`（LowPass 800Hz）            | ON/OFFトグル                           | 完了   |
| **8D Audio**            | `useEffectStore`       | `StereoPannerNode` + LFO + `OscillatorNode` | ON/OFF + 3段階回転速度                 | 完了   |
| **Slowed + Reverb**     | `useEffectStore`       | ピッチ変更 + `ConvolverNode`                | ON/OFF                                 | 完了   |
| **Retro**               | `useEffectStore`       | HighPass→LowPass→WaveShaper                 | ON/OFF                                 | 完了   |
| **Bass Boost**          | `useEffectStore`       | `lowshelf` filter +9dB                      | ON/OFF                                 | 完了   |

**AudioEngineルーティング**: `Source → EQ(6) → Spatial → StereoPanner(8D) → Retro(HighPass→LowPass→Distortion) → BassBoost → MasterGain → Destination` + Reverb Path（`StereoPanner → ReverbGain → Convolver → Destination`）

### ホームページのセクション構成

`app/(site)/page.tsx` → `HomeContent.tsx` で **6セクション** を `Promise.all` で並列取得:

| セクション           | データソース           | コンポーネント                       |
| -------------------- | ---------------------- | ------------------------------------ |
| **TRENDING_NOW**     | `getTrendSongs("all")` | `TrendBoard` + `TrendPeriodSelector` |
| **SPOTLIGHT_SCAN**   | `getSpotlight()`       | `SpotlightBoard`                     |
| **LATEST_RELEASES**  | `getSongs()`           | `LatestBoard`                        |
| **FOR_YOU_OPERATOR** | `getRecommendations()` | `ForYouBoard`                        |
| **Playlists**        | `getPublicPlaylists()` | プレイリストボード                   |
| **Genre**            | (固定的)               | `GenreBoard`                         |

### Zustandストア一覧

| ストア                  | 永続化    | 役割                                          |
| ----------------------- | --------- | --------------------------------------------- |
| `usePlayer`             | `persist` | 再生リスト、アクティブID、リピート/シャッフル |
| `useVolumeStore`        | `persist` | デスクトップ音量                              |
| `usePlaybackRateStore`  | `persist` | 再生速度                                      |
| `useEffectStore`        | `persist` | SlowedReverb, 8D, Retro, BassBoost            |
| `useSpatialStore`       | `persist` | Spatial Audio                                 |
| `useEqualizerStore`     | `persist` | 6バンドEQ + プリセット                        |
| `useColorSchemeStore`   | `persist` | カラーテーマ                                  |
| `usePlaybackStateStore` | `persist` | 続きから再生（7日有効）                       |
| `useLyricsStore`        | `persist` | 歌詞表示ON/OFF                                |
| `useLyricsModalStore`   | メモリ    | 歌詞モーダル開閉                              |
| `useSearchHistoryStore` | `persist` | 検索履歴（最大20件）                          |
| `useAudioWaveStore`     | メモリ    | 波形プレイヤー（Pulseページ）                 |

### Server Actions一覧

| Action                                                | 用途                               |
| ----------------------------------------------------- | ---------------------------------- |
| `getSongs`                                            | 全曲取得                           |
| `getSongsPaginated`                                   | ページネーション付き曲取得         |
| `getSongsByGenre`                                     | ジャンル別曲取得                   |
| `getSongsByTitle`                                     | タイトル検索                       |
| `getTrendSongs`                                       | 期間指定トレンド取得               |
| `getRecommendations`                                  | RPC推奨曲（`get_recommendations`） |
| `getSpotlight`                                        | スポットライト取得                 |
| `getPulses`                                           | Pulse取得                          |
| `getLikedSongs`                                       | いいね済み曲取得                   |
| `getPlaylist` / `getPlaylists` / `getPublicPlaylists` | プレイリスト取得                   |
| `getPlaylistSongs`                                    | プレイリスト内曲取得               |
| `getPlaylistsByTitle`                                 | プレイリスト検索                   |
| `getStats`                                            | 聴取統計（RPC `get_user_stats`）   |
| `checkAdmin`                                          | 管理者権限チェック                 |
| `r2`                                                  | R2ストレージ操作                   |

---

## 2. 簡単な追加機能（★☆☆）

既存のstore/UIパターンを踏襲して、比較的短期間で実装可能な機能。

### 2.1 Nightcore モード

**概要**: 1.25倍速でピッチを変えずに再生するNightcore風エフェクト

**実装方法**:

- `useEffectStore.ts` に `isNightcoreEnabled: boolean` と `toggleNightcore: () => void` を追加
- `useAudioEffects.ts` に以下のロジックを追加:

  ```ts
  if (isNightcoreEnabled) {
    setRate(1.25);
    engine.setPreservesPitch(false);
  }
  ```

- `SpeedAndEffectsControl.tsx` にトグルボタンを追加

**変更ファイル**:

- `hooks/stores/useEffectStore.ts`
- `hooks/audio/useAudioEffects.ts`
- `components/Player/SpeedAndEffectsControl.tsx`

**難易度**: ★☆☆

---

### 2.2 A-B ループ

**概要**: 歌詞の繰り返し練習向けに、A地点からB地点までループ再生する機能

**実装方法**:

- `useAudioPlayer.ts` に `loopStart` と `loopEnd` の state を追加
- `SeekBar.tsx` にA/Bマーカーを表示するUIを追加
- `audio.currentTime` が `loopEnd` に達した場合、`loopStart` にシークするロジックを追加
- `useLyricsStore.ts` にループ状態を永続化

**変更ファイル**:

- `hooks/audio/useAudioPlayer.ts`
- `components/Player/Seekbar.tsx`
- `hooks/stores/useLyricsStore.ts`

**難易度**: ★★☆

---

### 2.3 ボリュームプリセット

**概要**: 安静/低/中/高のボリュームプリセットを追加

**実装方法**:

- `useVolumeStore.ts` に `presets` 配列を追加:

  ```ts
  const VOLUME_PRESETS = [
    { id: "quiet", label: "Quiet", value: 0.3 },
    { id: "low", label: "Low", value: 0.5 },
    { id: "medium", label: "Medium", value: 0.7 },
    { id: "high", label: "High", value: 1.0 },
  ];
  ```

- ボリュームコントロールにプリセットボタンを追加

**変更ファイル**:

- `hooks/stores/useVolumeStore.ts`
- `components/Player/VolumeControl.tsx`（または該当するボリュームUI）

**難易度**: ★☆☆

---

### 2.4 EQカスタムプリセット保存

**概要**: ユーザーが独自のイコライザー設定をプリセットとして保存可能にする

**実装方法**:

- `useEqualizerStore.ts` に `customPresets: EqPreset[]` 配列を追加
- `addCustomPreset` / `removeCustomPreset` アクションを追加
- `EqualizerControl.tsx` に「現在の設定を保存」ボタンとプリセット名入力フィールドを追加

**変更ファイル**:

- `hooks/stores/useEqualizerStore.ts`
- `components/Equalizer/EqualizerControl.tsx`

**難易度**: ★☆☆

---

### 2.5 歌詞フォントサイズ調整

**概要**: 歌詞表示のフォントサイズをユーザーが調整可能にする

**実装方法**:

- `useLyricsStore.ts` に `fontSize: number` state を追加（デフォルト: 16）
- `SyncedLyrics.tsx` にフォントサイズスライダーを追加
- 歌詞表示時に `style={{ fontSize:`${fontSize}px`}}` を適用

**変更ファイル**:

- `hooks/stores/useLyricsStore.ts`
- `components/Lyrics/SyncedLyrics.tsx`

**難易度**: ★☆☆

---

### 2.6 お気に入り数のリアルタイム表示

**概要**: いいねボタンの横にリアルタイムでいいね数を表示

**実装方法**:

- `LikeButton.tsx` に `song.like_count` を props として受け取り表示
- 楽観的更新パターンでUIに即座に反映
- Supabase Realtime で変更を監視（オプション）

**変更ファイル**:

- `components/LikeButton.tsx`
- `components/Song/SongItem.tsx`（いいね数の渡し方変更）

**難易度**: ★☆☆

---

### 2.7 再生回数インクリメント

**概要**: 曲が再生されるたびに再生回数をカウントアップ

**実装方法**:

- Supabase側に `increment_play_count` RPC を追加
- `useOnPlay.ts` の `handlePlay` 内でRPCを呼び出し
- `songs.count` カラムをインクリメント

**変更ファイル**:

- `hooks/player/useOnPlay.ts`
- Supabase側のRPC定義

**難易度**: ★☆☆

---

## 3. 中程度の追加機能（★★☆）

既存パターンの応用が必要だが、比較的短期間で実装可能な機能。

### 3.1 Crossfade（曲間クロスフェード）

**概要**: 曲が変わる際に滑らかにフェードイン/フェードアウトする機能

**実装方法**:

- `AudioEngine.ts` に2つ目の `<audio>` 要素を追加
- `gainNode` の `linearRampToValueAtTime` でフェード処理
- `usePlayer.ts` の `getNextSongId` を活用して次曲を事前ロード
- クロスフェード時間を設定するUIを追加（1-5秒）

**変更ファイル**:

- `libs/audio/AudioEngine.ts`
- `hooks/player/usePlayer.ts`
- `hooks/audio/useAudioPlayer.ts`
- `components/Player/SpeedAndEffectsControl.tsx`

**難易度**: ★★☆

---

### 3.2 Turntable モード（カセットテープ風ノイズ追加）

**概要**: Retroモードの延長として、カセットテープのヒスノイズを追加

**実装方法**:

- `AudioEngine.ts` に `OscillatorNode` + `GainNode` でホワイトノイズを生成
- `BiquadFilterNode` でHPFを適用し、ヒスノイズを再現
- マスターゲインに接続
- `useEffectStore.ts` に `isTurntableEnabled` を追加

**変更ファイル**:

- `libs/audio/AudioEngine.ts`
- `hooks/stores/useEffectStore.ts`
- `components/Player/SpeedAndEffectsControl.tsx`

**難易度**: ★★☆

---

### 3.3 Spotlight 動画への字幕対応

**概要**: Spotlight動画に字幕（SRT/VTT形式）を表示可能にする

**実装方法**:

- `spotlight` テーブルに `subtitle_path` カラムを追加
- `SpotlightModal.tsx` に `<track>` 要素で字幕を表示
- 字幕ファイルのアップロード機能を `SpotlightUploadModal.tsx` に追加

**変更ファイル**:

- `components/Modals/SpotlightModal.tsx`
- `components/Modals/SpotlightUploadModal.tsx`
- Supabase側のテーブル変更

**難易度**: ★★☆

---

### 3.4 プレイリスト曲の並べ替え（Drag & Drop）

**概要**: プレイリスト内の曲をドラッグ＆ドロップで並べ替え

**実装方法**:

- `playlist_songs` テーブルに `position` カラムを追加
- `@dnd-kit` ライブラリを使用してドラッグ＆ドロップを実装
- `DeletePlaylistSongsBtn` のパターンを踏襲してUIを構築

**変更ファイル**:

- `components/Playlist/DeletePlaylistSongsBtn.tsx`
- `app/playlists/[id]/page.tsx`
- Supabase側のテーブル変更

**難易度**: ★★☆

---

### 3.5 自動生成プレイリスト

**概要**: 「お気に入り50」「最近再生」などの自動生成プレイリストを作成

**実装方法**:

- `actions/` に `getAutoPlaylist` アクションを追加
- `get_user_stats` RPC の結果を活用
- `ForYouBoard` のパターンを踏襲してUIを構築

**変更ファイル**:

- `actions/getAutoPlaylist.ts`（新規）
- `app/(site)/components/HomeContent.tsx`
- `components/ForYou/ForYouBoard.tsx`

**難易度**: ★★☆

---

## 4. 難しい追加機能（★★★）

DB変更や新テーブルの追加が必要な機能。

### 4.1 アーティスト/アルバム機能

**概要**: 楽曲をアーティストとアルバム単位で管理・表示する機能

**実装方法**:

- `artists` テーブルと `albums` テーブルを新規作成
- `songs` テーブルに `artist_id` と `album_id` のFKを追加
- `/artists/[id]` ページを新設
- `/albums/[id]` ページを新設
- アーティスト一覧ページを新設

**変更ファイル**:

- Supabase側のテーブル変更
- `app/artists/[id]/page.tsx`（新規）
- `app/albums/[id]/page.tsx`（新規）
- `types/index.ts`
- `components/Song/SongItem.tsx`

**難易度**: ★★★

---

### 4.2 ソーシャル機能（フォロー・コメント）

**概要**: ユーザー間のソーシャル機能を追加

**実装方法**:

- `follows` テーブルと `comments` テーブルを新規作成
- `/users/[id]` プロフィールページを新設
- 通知テーブルを追加
- フォローフィード（タイムライン）を実装

**変更ファイル**:

- Supabase側のテーブル変更
- `app/users/[id]/page.tsx`（新規）
- `components/Social/`（新規ディレクトリ）
- `types/index.ts`

**難易度**: ★★★

---

### 4.3 オフライン再生（PWA）

**概要**: Service Workerを使用してオフラインでも音楽を再生可能にする

**実装方法**:

- `manifest.json` を追加
- Service Workerを作成
- Cache API / IndexedDB でオーディオをキャッシュ
- オフライン検出表示を追加

**変更ファイル**:

- `public/manifest.json`（新規）
- `public/service-worker.js`（新規）
- `app/layout.tsx`
- `components/common/OfflineIndicator.tsx`（新規）

**難易度**: ★★★

---

### 4.4 高度な検索フィルタ

**概要**: ジャンル/期間/再生回数/いいね数の複合フィルタを検索に追加

**実装方法**:

- `getSongsByTitle` を拡張し、複合フィルタに対応
- 検索ページにフィルタUIを追加
- フィルタ条件をURLパラメータで管理

**変更ファイル**:

- `actions/getSongsByTitle.ts`
- `app/search/page.tsx`
- `components/Header/HeaderNav.tsx`

**難易度**: ★★★

---

## 5. UI/UX改善ポイント

### 5.1 DownloadPreviewModal

- ダウンロード進捗バーがない。大きなファイルでユーザーが不安に
- ビデオプレビューがモバイルで見づらい（`aspect-video` のみ）

### 5.2 UploadModal

- ドラッグ＆ドロップ時にファイル形式のバリデーション表示がない
- ファイルサイズの上限表示がない（`SUPPORTED: .MP3 // .JPG // .PNG` のみ）

### 5.3 PlaylistModal

- プレイリスト説明フィールドがない。タイトルのみ
- プライベート/公開のトグルがない

### 5.4 TopPlayedSongs

- クリックで再生だが、右クリックメニュー（追加、シェア等）がない
- ランクインジケーターが `#` サイン付きだが、1位の特別表示がない

### 5.5 SongItem

- いいねボタンが直接操作できない（`SongOptionsPopover` 経由のみ）
- アクセシビリティ: `role="button"` や `aria-label` が不足

### 5.6 ContributionHeatmap

- ツールチップが `title` 属性のみ。カスタムツールチップで詳細表示が可能

---

## 6. パフォーマンス改善ポイント

| 問題                                                                 | 場所                                                                       | 改善策                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `createClient()` の毎レンダー生成                                    | `useOnPlay`, `useLikeMutation`, `useGetTopPlayedSongs`, `useGetLikedSongs` | `useMemo` でメモ化                            |
| `useAudioWave` の `addEventListener` が cleanup で適切に除去されない | `useAudioWave:103-115`                                                     | `removeEventListener` を `cleanup` に追加     |
| `UploadModal` の `useCallback` が `handleFiles` を含まない           | `UploadModal:56-62`                                                        | `handleFiles` を依存配列に追加                |
| `SpotlightBoard` の全ビデオがDOMに存在                               | `SpotlightBoard:76`                                                        | `IntersectionObserver` で可視範囲のみ読み込み |
| `StatsOverview` の `recharts` が全コンポーネントで再レンダー         | `StatsOverview:196`                                                        | `React.memo` + `tooltipFormatter` のメモ化    |
| `useGetAllSongsPaginated` が `Infinity` スクロール未対応             | `useGetAllSongsPaginated`                                                  | `useInfiniteQuery` への移行                   |

---

## 7. アクセシビリティ改善ポイント

- **`SongItem`**: クリック可能な `<div>` に `role="button"`, `tabIndex={0}`, `onKeyDown` が未設定
- **`SpotlightBoard`**: ミュートトグルに `aria-label` がない（`<svg>` のみ）
- **`ContributionHeatmap`**: ヒートマップの各セルが `<div>` のみ。`role="gridcell"` + `aria-label` でスクリーンリーダー対応可能
- **モーダル群**: `EditModal`, `UploadModal`, `PlaylistModal` のフォーカストラップが `Modal` コンポーネントに依存。`Dialog` を使用している `DownloadPreviewModal` は较好的
- **色のコントラスト**: `text-theme-500/40` や `text-theme-500/60` がコントラスト比4.5:1を下回る可能性
- **`UseForm` のバリデーションメッセージ**: `required: true` のみで、エラーメッセージが未表示

---

## 8. サイバーパンク/HUD風UIテーマに合った機能

### 8.1 既存テーマの強化

1. **HUDスキャンラインのアニメーション**: `ThemeProvider` で `.scanline-moving` を使っているが、`useAudioWave` の再生状態と連動してスキャンライン速度を変化させると「音に反応するHUD」になる
2. **グリッチアニメーション**: `.cyber-glitch` クラスが广泛使用。再生中はグリッチ頻度を上げる、一時停止時は静止するなどの演出
3. **波形ビジュアライザー**: `useAudioWave` の `analyser` と連携し、`SongItem` やプレイヤー背景にリアルタイム波形を表示

### 8.2 新規HUD風機能

1. **ターミナル風ログフィード**: 再生履歴やいいねをターミナルのログストリーム風に表示（`play_history` テーブルからリアルタイム取得）
2. **ミッションダッシュボード**: 毎日のリスニング目標（「今日30曲再生」等）をHUD風に表示。`getStats` のデータと連携
3. **ナビゲーションマップ**: ジャンル間を結ぶ「星図」風UI。`GenreBoard` を3Dインタラクティブに
4. **オーディオスペクトラム分析**: ダウンロードモーダルで曲の周波数特性をHUD風に可視化（`useAudioWave` の `analyser.getByteFrequencyData` を使用）
5. **カウントダウンタイマー**: 次曲へのカウントダウンをミリタリー時計風に表示
6. **エンコーディングステータス**: アップロード中の進捗を「データ転送中...バイト数表示」風に
7. **リスニングセッション記録**: 連続再生時間を「ミッション時間」としてHUDに表示

---

## 主要な修正優先度

| 優先度 | 内容                                         | 影響                                   |
| ------ | -------------------------------------------- | -------------------------------------- |
| **高** | `createClient()` の `useMemo` 化             | パフォーマンス（毎レンダー再生成防止） |
| **高** | `useAudioWave` の `removeEventListener` 追加 | メモリリーク防止                       |
| **中** | `SongItem` のアクセシビリティ対応            | キーボードナビゲーション               |
| **中** | `useInfiniteQuery` への移行                  | 大量データ時のUX                       |
| **低** | モーダルのエラーメッセージ表示               | ユーザー体験                           |

---

## まとめ

BadWaveは音楽プレイヤーのコア機能は非常に充実している。特に以下が強み:

- Web Audio API ベースの高度なオーディオエンジン (5種のエフェクト + 6バンドEQ)
- 歌詞のLRC同期表示
- パーソナライズ推薦 (Supabase RPC)
- 再生状態の永続化
- Pulse (オーディオ波形ビジュアライザー)
- 統計ダッシュボード (ヒートマップ含む)

**最も重要な未実装機能**として以下の優先度順に挙げられる:

1. **ソーシャル機能** — フォロー、コメント、共有が全くない。音楽体験の主要なエンゲージメント要素が欠如
2. **アプリオフライン化 (PWA)** — オフライン再生対応がない。モバイルユーザーへの対応が必須
3. **アーティスト/アルバム構造** — 楽曲がフラットなリストとしてしか存在しない。音楽の階層構造 (アーティスト > アルバム > 曲) がない
4. **高度な検索/フィルタ** — ジャンル、期間、人気順等の複合フィルタが不足
5. **通知システム** — 新曲通知、フォロー通知がない
6. **クロスフェード/Sleep Timer** — 基本的なユーザビリティ機能の不足
7. **外部キャスト (AirPlay/Chromecast)** — マルチデバイス再生への対応
