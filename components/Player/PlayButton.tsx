"use client";

import { FaPlay } from "react-icons/fa";

interface PlayButtonProps {
  size?: number;
}

const PlayButton: React.FC<PlayButtonProps> = ({ size = 35 }) => {
  return (
    <button
      className="
        transition-all
        duration-300
        rounded-full
        flex
        items-center
        justify-center
        p-4
        drop-shadow-md
        hover:scale-110
        hover:shadow-lg
        group
        relative
      "
      style={{
        background: `linear-gradient(to bottom right, rgba(var(--theme-500), 1), rgba(var(--theme-600), 1))`,
      }}
    >
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
      <FaPlay className="text-black relative ml-1" size={size / 2} />
    </button>
  );
};

export default PlayButton;
