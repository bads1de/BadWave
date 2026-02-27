"use client";

import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";

interface DeletePlaylistSongsBtnProps {
  songId: string;
  playlistId: string;
  showText?: boolean;
}

/**
 * プレイリストから曲を削除するボタンコンポーネント
 *
 * @param songId 削除する曲のID
 * @param playlistId 対象のプレイリストID
 * @param showText テキストを表示するかどうか
 */
const DeletePlaylistSongsBtn: React.FC<DeletePlaylistSongsBtnProps> = ({
  songId,
  playlistId,
  showText = false,
}) => {
  // プレイリスト曲の削除ミューテーションを取得
  const { deletePlaylistSong } = useMutatePlaylistSong();

  // 削除ハンドラー
  const handleDeletePlaylistSongs = () => {
    deletePlaylistSong.mutate({ songId, playlistId });
  };

  return (
    <button
      className="w-full flex items-center text-red-500/60 cursor-pointer hover:text-red-500 transition-all duration-500 font-mono uppercase tracking-widest group cyber-glitch"
      disabled={deletePlaylistSong.isPending}
      onClick={handleDeletePlaylistSongs}
    >
      <div className="p-2 border border-red-500/20 group-hover:border-red-500 transition-colors mr-3">
        <RiDeleteBin5Line size={18} />
      </div>
      {showText && <span className="text-[10px] font-black tracking-widest">// PURGE_ENTRY</span>}
    </button>
  );
};

export default DeletePlaylistSongsBtn;
