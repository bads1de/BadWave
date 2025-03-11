"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PlaylistOptionsPopover from "@/components/Playlist/PlaylistOptionsPopover";
import { RiPlayListFill } from "react-icons/ri";

interface PlaylistHeaderProps {
  playlistId: string;
  playlistTitle: string;
  imageUrl: string;
  songCount: number;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  playlistId,
  playlistTitle,
  imageUrl,
  songCount,
}) => {
  return (
    <div className="relative w-full h-[400px]">
      {/* 背景画像 */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageUrl || "/images/playlist.png"}
          alt="Playlist background"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-neutral-900/90 to-neutral-900/95" />
      {/* グラスモーフィズム効果 */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 70%)",
          }}
        />
      </div>
      {/* コンテンツ */}
      <div className="relative h-full max-w-7xl mx-auto px-6 py-6 flex items-end">
        <div className="flex items-end gap-x-6">
          {/* プレイリストアートワーク */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-52 w-52 group"
          >
            <div className="absolute -top-2 -left-2 w-full h-full bg-purple-900/50 transform rotate-3 rounded-xl" />
            <div className="absolute -top-1 -left-1 w-full h-full bg-purple-800/50 transform rotate-2 rounded-xl" />
            <Image
              src={imageUrl || "/images/playlist.png"}
              alt="Playlist"
              fill
              className="object-cover rounded-xl shadow-2xl"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 208px"
            />
          </motion.div>
          {/* プレイリスト情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-y-2 mb-2"
          >
            <div className="flex items-center gap-x-4">
              <h1 className="text-5xl font-bold text-white tracking-wide drop-shadow-lg">
                {playlistTitle}
              </h1>
              <PlaylistOptionsPopover
                playlistId={playlistId}
                currentTitle={playlistTitle}
              />
            </div>
            <p className="text-sm text-white/80">
              {songCount} {songCount === 1 ? "曲" : "曲"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
