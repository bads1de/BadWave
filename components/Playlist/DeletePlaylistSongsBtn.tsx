"use client";

import React, { useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DeletePlaylistSongsBtnProps {
  songId: string;
  playlistId: string;
  showText?: boolean;
}

const DeletePlaylistSongsBtn: React.FC<DeletePlaylistSongsBtnProps> = ({
  songId,
  playlistId,
  showText = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeletePlaylistSongs = async () => {
    setIsDeleting(true);

    const supabase = createClientComponentClient();

    // 現在のユーザーセッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error("User not authenticated.");
      setIsDeleting(false);
      return;
    }

    try {
      // playlist_songs からデータを削除
      await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", session.user.id)
        .eq("song_id", songId);

      toast.success("プレイリストから曲が削除されました！");
      router.refresh();
    } catch (error: any) {
      toast.error("Error deleting playlist songs:", error);
      // エラー処理
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      className="w-full flex items-center text-neutral-400 cursor-pointer hover:text-red-500 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-300"
      disabled={isDeleting}
      onClick={handleDeletePlaylistSongs}
    >
      <RiDeleteBin5Line size={28} className="mr-2" />
      {showText && <span className="text-sm font-semibold">削除</span>}
    </button>
  );
};

export default DeletePlaylistSongsBtn;
