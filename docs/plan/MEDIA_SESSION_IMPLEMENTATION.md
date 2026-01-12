# Media Session API 実装計画

Web版 (`badwave`) に Media Session API を実装し、OSのロック画面やメディアキー、イヤホンの操作ボタンからプレイヤーを制御できるようにします。

## 概要

`navigator.mediaSession` を使用して、以下の機能を実現します。
1. **メタデータの表示**: 再生中の曲のタイトル、アーティスト名、アルバムアートをOS側に通知します。
2. **アクションハンドラ**: 再生、一時停止、曲送り、曲戻し、シーク操作に対応します。

## 実装ファイル

### 1. 新規フック: `badwave/hooks/player/useMediaSession.ts`

再生状態と曲情報を監視し、Media Session API を更新するカスタムフックを作成します。

```typescript
import { useEffect } from "react";
import { Song } from "@/types";

interface UseMediaSessionProps {
  song?: Song;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onSeek?: (time: number) => void;
}

const useMediaSession = ({
  song,
  isPlaying,
  onPlay,
  onPause,
  onPlayNext,
  onPlayPrevious,
  onSeek
}: UseMediaSessionProps) => {
  // メタデータの更新
  useEffect(() => {
    if (!song || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.author,
      // album: song.album, // アルバム情報があれば
      artwork: [
        { src: song.image_path, sizes: '96x96', type: 'image/png' }, // サイズは適宜
        { src: song.image_path, sizes: '128x128', type: 'image/png' },
        { src: song.image_path, sizes: '192x192', type: 'image/png' },
        { src: song.image_path, sizes: '256x256', type: 'image/png' },
        { src: song.image_path, sizes: '384x384', type: 'image/png' },
        { src: song.image_path, sizes: '512x512', type: 'image/png' },
      ]
    });
  }, [song]);

  // 再生状態の更新
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // アクションハンドラの設定
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('previoustrack', onPlayPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', onPlayNext);
    
    // seekto はオプション
    if (onSeek) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined) {
                onSeek(details.seekTime);
            }
        });
    }

    return () => {
      // クリーンアップ
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [onPlay, onPause, onPlayNext, onPlayPrevious, onSeek]);
};

export default useMediaSession;
```

### 2. 統合: `badwave/components/Player/PlayerContent.tsx`

`PlayerContent` コンポーネント内で `useMediaSession` を呼び出します。
`useAudioPlayer` から提供される関数を利用します。

*注意*: `useAudioPlayer` の `handlePlay` はトグル動作になっているため、`isPlaying` の状態を見て明示的に呼ぶか、あるいはそのまま渡しても `play` ハンドラが呼ばれたときに `handlePlay` (トグル) が動けば、通常は `paused` -> `play` アクション -> `playing` となるので整合性は保たれます。より安全にするなら、`isPlaying` が `false` の時だけ `handlePlay` を呼ぶラッパー関数を作ると良いです。

```tsx
// PlayerContent.tsx

// ...
import useMediaSession from "@/hooks/player/useMediaSession";

// ...

// useAudioPlayer のフック呼び出しの後あたりに
useMediaSession({
  song: song,
  isPlaying: isPlaying,
  onPlay: () => {
    if (!isPlaying) handlePlay();
  },
  onPause: () => {
    if (isPlaying) handlePlay();
  },
  onPlayNext: onPlayNext,
  onPlayPrevious: onPlayPrevious,
  onSeek: handleSeek
});
```

## メリット

* **ユーザー体験の向上**: バックグラウンド再生中の操作性が大幅に向上します。
* **ネイティブアプリ感**: OSとの統合により、アプリとしての質感が向上します。
* **実装コスト**: 低コストで導入可能です。
