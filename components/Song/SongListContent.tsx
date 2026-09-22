"use client";

import { Song } from "@/types";
import useOnPlay from "@/hooks/player/useOnPlay";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";
import SongList from "@/components/Song/SongList";
import { useUser } from "@/hooks/auth/useUser";
import { memo, useCallback, type ReactNode } from "react";

interface SongListEmptyStateProps {
  /** 表示するメッセージ */
  message?: string;
}

/** 曲が0件のときの既定表示 */
export const SongListEmptyState: React.FC<SongListEmptyStateProps> = ({
  message = "[ ! ] NO_DATA_DETECTED_IN_SECTOR",
}) => (
  <div className="flex flex-col gap-y-2 w-full px-8 py-20 text-theme-500 font-mono tracking-widest uppercase">
    {message}
  </div>
);

interface SongListContentProps {
  songs: Song[];
  playlistId?: string;
  playlistUserId?: string;
  /** プレイリスト内の表示など、新しい順に並べる場合に true */
  reverse?: boolean;
  /** 再生処理を差し替える場合に指定（未指定なら内部の useOnPlay を使用） */
  onPlay?: (id: string) => void;
  /** リストの上部に表示するツールバーなど */
  header?: ReactNode;
  /** 曲が0件のときの表示 */
  emptyState?: ReactNode;
  /** リストを包むコンテナのクラス */
  className?: string;
  /** オプション(三点リーダー)を常に表示するか。未指定の場合はログイン中のユーザーのみに表示 */
  showOptions?: boolean;
}

/**
 * 曲の一覧表示を共通化したコンポーネント
 *
 * ジャンル / いいね / 検索 / プレイリストで重複していた
 * 「SongList + SongOptionsPopover」の行レイアウトをまとめる。
 */
const SongListContent: React.FC<SongListContentProps> = memo(
  ({
    songs,
    playlistId,
    playlistUserId,
    reverse = false,
    onPlay: onPlayProp,
    header,
    emptyState,
    className = "flex flex-col gap-y-2 w-full p-6",
    showOptions,
  }) => {
    const { user } = useUser();
    const defaultOnPlay = useOnPlay(songs);
    const onPlay = onPlayProp ?? defaultOnPlay;

    // 再生ハンドラをメモ化
    const handlePlay = useCallback(
      (id: string) => {
        onPlay(id);
      },
      [onPlay]
    );

    if (songs.length === 0) {
      return <>{emptyState ?? <SongListEmptyState />}</>;
    }

    const displayedSongs = reverse ? [...songs].reverse() : songs;

    return (
      <div className={className}>
        {header}
        {displayedSongs.map((song: Song) => (
          <div key={song.id} className="flex items-center gap-x-4 w-full">
            <div className="flex-1 min-w-0">
              <SongList data={song} onClick={handlePlay} />
            </div>
            {(showOptions ?? !!user?.id) && (
              <SongOptionsPopover
                song={song}
                playlistId={playlistId}
                playlistUserId={playlistUserId}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
);

// displayName を設定
SongListContent.displayName = "SongListContent";
SongListEmptyState.displayName = "SongListEmptyState";

export default SongListContent;
