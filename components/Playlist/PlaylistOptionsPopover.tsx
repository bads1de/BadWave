"use client";

import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Edit2, Trash2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/hooks/auth/useUser";

interface PlaylistOptionsPopoverProps {
  playlistId: string;
  currentTitle: string;
}

const PlaylistOptionsPopover: React.FC<PlaylistOptionsPopoverProps> = ({
  playlistId,
  currentTitle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user } = useUser();

  const handleTitleUpdate = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("playlists")
        .update({ title: newTitle })
        .eq("id", playlistId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("プレイリスト名を更新しました");
      router.refresh();
      setIsEditing(false);
    } catch (error) {
      toast.error("プレイリスト名の更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // playlist_songs からデータを削除
      await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id);

      // playlists からデータを削除
      await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId)
        .eq("user_id", user.id);

      toast.success("プレイリストを削除しました");
      router.push("/playlists");
      router.refresh();
    } catch (error) {
      toast.error("プレイリストの削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-neutral-400 cursor-pointer hover:text-white transition"
          aria-label="More Options"
        >
          <BsThreeDots size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        className="w-48 p-0 bg-neutral-800 border-neutral-700"
      >
        <div className="flex flex-col text-sm">
          <div className="px-3 py-2">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="プレイリスト名"
                  disabled={isLoading}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs text-neutral-400 hover:text-white transition"
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleTitleUpdate}
                    className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                    disabled={isLoading}
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="w-full flex items-center text-neutral-400 cursor-pointer hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} className="mr-2" />
                名前を変更
              </button>
            )}
          </div>
          <div className="px-3 py-2 border-t border-neutral-700">
            <button
              className="w-full flex items-center text-neutral-400 cursor-pointer hover:text-red-500 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-300"
              onClick={handleDeletePlaylist}
              disabled={isLoading}
            >
              <Trash2 size={16} className="mr-2" />
              削除
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlaylistOptionsPopover;
