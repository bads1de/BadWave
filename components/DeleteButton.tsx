"use client";
import React from "react";

import { HiTrash } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import useDeleteSongMutation from "@/hooks/data/useDeleteSongMutation";

interface DeleteButtonProps {
  songId: string;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ songId, className }) => {
  const deleteMutation = useDeleteSongMutation();

  const handleDelete = () => {
    if (deleteMutation.isPending) return;

    deleteMutation.mutate({ songId });
  };

  return (
    <button
      className={twMerge(
        `
        group
        relative
        rounded-none
        p-2
        bg-red-500/5
        border
        border-red-500/20
        hover:border-red-500/60
        hover:bg-red-500/10
        transition-all
        duration-500
        focus:outline-none
        cyber-glitch
      `,
        className
      )}
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
    >
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-500/0 group-hover:border-red-500 transition-colors" />
      <HiTrash
        className="text-red-500/40 group-hover:text-red-500 transition-colors duration-300 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
        size={18}
      />
    </button>
  );
};

// displayName を設定
DeleteButton.displayName = "DeleteButton";

export default DeleteButton;
