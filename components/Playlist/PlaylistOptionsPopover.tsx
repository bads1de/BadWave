"use client";

import * as React from "react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Edit2, Trash2, Globe2, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useUpdatePlaylistTitle,
  useTogglePlaylistPublic,
  useDeletePlaylist,
} from "@/hooks/data/usePlaylistMutations";

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

  const updateTitleMutation = useUpdatePlaylistTitle();
  const togglePublicMutation = useTogglePlaylistPublic();
  const deletePlaylistMutation = useDeletePlaylist();

  const handleTitleUpdate = () => {
    updateTitleMutation.mutate(
      { playlistId, newTitle },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleTogglePublic = () => {
    togglePublicMutation.mutate({ playlistId, isPublic });
  };

  const handleDeletePlaylist = () => {
    deletePlaylistMutation.mutate({ playlistId });
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
                  disabled={updateTitleMutation.isPending}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-[8px] text-theme-900 hover:text-theme-500 transition"
                    disabled={updateTitleMutation.isPending}
                  >
                    [ ABORT ]
                  </button>
                  <button
                    onClick={handleTitleUpdate}
                    className="px-2 py-1 text-[8px] bg-theme-500/20 border border-theme-500/60 text-theme-300 hover:bg-theme-500/40 transition"
                    disabled={updateTitleMutation.isPending}
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
