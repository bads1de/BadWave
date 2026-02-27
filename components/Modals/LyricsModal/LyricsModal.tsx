"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { HiOutlineQueueList } from "react-icons/hi2";
import { Song } from "@/types";
import useLyricsModalStore from "@/hooks/stores/useLyricsModalStore";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import SyncedLyrics from "@/components/Lyrics/SyncedLyrics";
import LyricsModalArtwork from "./LyricsModalArtwork";
import LyricsModalControls from "./LyricsModalControls";

interface LyricsModalProps {
  song: Song;
}

const LyricsModal: React.FC<LyricsModalProps> = ({ song }) => {
  const { isOpen, closeModal } = useLyricsModalStore();

  const {
    formattedCurrentTime,
    formattedDuration,
    currentTime,
    duration,
    isPlaying,
    handlePlay,
    handleSeek,
    onPlayNext,
    onPlayPrevious,
  } = useAudioPlayer(song?.song_path);

  const lyrics = song?.lyrics ?? "歌詞はありません";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        {/* オーバーレイ */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-[100]
            bg-[#0a0a0f]/90
            backdrop-blur-md
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            duration-500
          "
        />

        {/* メインコンテンツ */}
        <Dialog.Content
          className="
            fixed inset-0 z-[101]
            w-full h-full
            bg-[#0a0a0f]
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            duration-500
            flex flex-col
            overflow-hidden
            font-mono
          "
        >
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
                 backgroundSize: '100px 100px'
               }} 
          />

          {/* アクセシビリティ用の非表示タイトル */}
          <Dialog.Title className="sr-only">Lyrics_Interface</Dialog.Title>

          {/* ヘッダー（右上のボタン） */}
          <div className="absolute top-0 right-0 z-20 p-6 flex items-center gap-4">
            {/* キューボタン (HUD Style) */}
            <button
              className="
                p-2.5
                bg-theme-500/10
                border border-theme-500/30
                text-theme-500
                hover:text-white hover:bg-theme-500/20
                transition-all duration-300
                cyber-glitch
              "
              aria-label="Queue"
            >
              <HiOutlineQueueList size={20} />
            </button>

            {/* 閉じるボタン (HUD Style) */}
            <Dialog.Close asChild>
              <button
                className="
                  p-2.5
                  bg-theme-500/10
                  border border-theme-500/30
                  text-theme-500
                  hover:text-white hover:bg-theme-500/20
                  transition-all duration-300
                  cyber-glitch
                "
                aria-label="Close"
              >
                <IoMdClose size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* メインエリア（左：アートワーク、右：歌詞） */}
          <div className="flex flex-1 overflow-hidden relative z-10">
            {/* 左側：アートワーク (HUD Monitor Style) */}
            <div className="w-1/2 h-full border-r border-theme-500/10 relative group">
              <div className="absolute top-10 left-10 text-[10px] text-theme-500 tracking-[0.5em] uppercase animate-pulse z-20">
                 [ VISUAL_ASSET_LOG ]
              </div>
              <LyricsModalArtwork song={song} />
              {/* スキャンライン */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
            </div>

            {/* 右側：歌詞 (Terminal Style) */}
            <div className="w-1/2 h-full flex flex-col bg-[#0a0a0f]/60 backdrop-blur-xl relative">
              {/* HUDコーナー */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-theme-500/20" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-theme-500/20" />

              {/* LYRICS ラベル */}
              <div className="px-12 pt-10 pb-4 flex justify-between items-center">
                <span className="text-[10px] font-black tracking-[0.4em] text-theme-500 uppercase">
                  [ STREAM_LYRICS_ENCRYPTION ]
                </span>
                <span className="text-[8px] text-theme-500/20 animate-pulse">SYNC_STATUS: ACTIVE</span>
              </div>

              {/* 歌詞スクロールエリア */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-12 pb-12 relative">
                <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-theme-500/20 to-transparent" />
                <SyncedLyrics lyrics={lyrics} />
              </div>
            </div>
          </div>

          {/* 下部：コントロールパネル */}
          <div className="relative z-20 border-t border-theme-500/20">
            <LyricsModalControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              formattedCurrentTime={formattedCurrentTime}
              formattedDuration={formattedDuration}
              handlePlay={handlePlay}
              handleSeek={handleSeek}
              onPlayPrevious={onPlayPrevious}
              onPlayNext={onPlayNext}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LyricsModal;
