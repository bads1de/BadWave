"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Edit2, Trash2, Globe2, Lock } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/hooks/auth/useUser";
import { CACHED_QUERIES } from "@/constants";

interface PlaylistOptionsPopoverProps {
  playlistId: string;
  currentTitle: string;
  isPublic: boolean;
}

const PlaylistOptionsPopover: React.FC<PlaylistOptionsPopoverProps> = ({
  playlistId,
  currentTitle,
  isPublic,
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const updatePlaylistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("playlists")
        .update({ title: newTitle })
        .eq("id", playlistId)
        .eq("user_id", user.id);

      if (error) throw error;

      return { newTitle };
    },
    onSuccess: ({ newTitle }) => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success("プレイリスト名を更新しました");
      router.push(
        `/playlists/${playlistId}?title=${encodeURIComponent(newTitle)}`
      );
      setIsEditing(false);
    },
    onError: () => {
      toast.error("プレイリスト名の更新に失敗しました");
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("playlists")
        .update({ is_public: !isPublic })
        .eq("id", playlistId)
        .eq("user_id", user.id);

      if (error) throw error;
      return { isPublic: !isPublic };
    },
    onSuccess: ({ isPublic }) => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success(
        isPublic
          ? "プレイリストを公開しました"
          : "プレイリストを非公開にしました"
      );
      router.refresh();
    },
    onError: () => {
      toast.error("プレイリストの公開設定の更新に失敗しました");
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Unauthorized");

      await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id);

      await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId)
        .eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success("プレイリストを削除しました");
      router.push("/playlists");
      router.refresh();
    },
    onError: () => {
      toast.error("プレイリストの削除に失敗しました");
    },
  });

  const handleTitleUpdate = () => {
    updatePlaylistMutation.mutate();
  };

  const handleTogglePublic = () => {
    togglePublicMutation.mutate();
  };

  const handleDeletePlaylist = () => {
    deletePlaylistMutation.mutate();
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
        className="w-56 p-0 bg-[#0a0a0f] border-theme-500/40 font-mono"
      >
        <div className="flex flex-col text-[10px] uppercase tracking-widest">
          <div className="px-4 py-3">
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2 py-2 bg-[#0a0a0f] border border-theme-500/40 text-theme-300 focus:outline-none focus:border-theme-500 focus:shadow-[0_0_10px_rgba(var(--theme-500),0.3)] font-mono text-[10px]"
                  placeholder="NEW_IDENTIFIER"
                  disabled={updatePlaylistMutation.isPending}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-[8px] text-theme-900 hover:text-theme-500 transition"
                    disabled={updatePlaylistMutation.isPending}
                  >
                    [ ABORT ]
                  </button>
                  <button
                    onClick={handleTitleUpdate}
                    className="px-2 py-1 text-[8px] bg-theme-500/20 border border-theme-500/60 text-theme-300 hover:bg-theme-500/40 transition"
                    disabled={updatePlaylistMutation.isPending}
                  >
                    [ COMMIT ]
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="w-full flex items-center text-theme-500/60 hover:text-white transition-all duration-300 group"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} className="mr-3 group-hover:text-theme-500" />
                // MODIFY_NAME
              </button>
            )}
          </div>
          <div className="px-4 py-3 border-t border-theme-500/10">
            <button
              className="w-full flex items-center text-theme-500/60 hover:text-white transition-all duration-300 group"
              onClick={handleTogglePublic}
              disabled={togglePublicMutation.isPending}
            >
              {isPublic ? (
                <>
                  <Lock size={14} className="mr-3 group-hover:text-theme-500" />
                  // STATUS: PRIVATE
                </>
              ) : (
                <>
                  <Globe2 size={14} className="mr-3 group-hover:text-theme-500" />
                  // STATUS: PUBLIC
                </>
              )}
            </button>
          </div>
          <div className="px-4 py-3 border-t border-theme-500/10">
            <button
              className="w-full flex items-center text-theme-500/60 hover:text-red-500 transition-all duration-300 group"
              onClick={handleDeletePlaylist}
              disabled={deletePlaylistMutation.isPending}
            >
              <Trash2 size={14} className="mr-3 group-hover:text-red-500" />
              // TERMINATE_DATA
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlaylistOptionsPopover;
