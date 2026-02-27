import React, { useState } from "react";
import Image from "next/image";
import { BsPauseFill, BsPlayFill, BsChevronDown } from "react-icons/bs";
import { Mic2 } from "lucide-react";
import { RiPlayListAddFill } from "react-icons/ri";
import CommonControls from "../Player/CommonControls";
import PlaybackSpeedButton from "../Player/PlaybackSpeedButton";
import EqualizerButton from "../Player/EqualizerButton";

import { Playlist, Song } from "@/types";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import SeekBar from "../Player/Seekbar";
import LyricsDrawer from "./LyricsDrawer";
import ScrollingText from "../common/ScrollingText";
import LikeButton from "../LikeButton";
import AddPlaylist from "../Playlist/AddPlaylist";

interface MobilePlayerContentProps {
  song: Song;
  playlists: Playlist[];
  songUrl: string;
  imageUrl: string;
  videoUrl?: string;
  currentTime: number;
  duration: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  isPlaying: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  handlePlay: () => void;
  handleSeek: (time: number) => void;
  toggleMobilePlayer: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
}

const MobilePlayerContent = React.memo(
  ({
    song,
    playlists,
    imageUrl,
    videoUrl,
    currentTime,
    formattedCurrentTime,
    formattedDuration,
    duration,
    isPlaying,
    isShuffling,
    isRepeating,
    handlePlay,
    handleSeek,
    toggleShuffle,
    toggleRepeat,
    toggleMobilePlayer,
    onPlayNext,
    onPlayPrevious,
  }: MobilePlayerContentProps) => {
    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const [showLyrics, setShowLyrics] = useState(false);

    const toggleLyrics = () => {
      setShowLyrics(!showLyrics);
    };

    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag={showLyrics ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            toggleMobilePlayer();
          }
        }}
        className="md:hidden fixed inset-0 bg-[#0a0a0f] text-white z-50 flex flex-col font-mono"
        style={{ touchAction: showLyrics ? "auto" : "none" }}
      >
        {/* Background Media Layer */}
        <div className="absolute inset-0 z-0">
          {videoUrl ? (
            <video
              className="w-full h-full object-cover opacity-40"
              src={videoUrl}
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <Image
              src={imageUrl}
              alt="song image"
              fill={true}
              className="w-full h-full object-cover opacity-30 blur-sm scale-110"
              priority
            />
          )}
          {/* Cyberpunk Overlay Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
                 backgroundSize: '30px 30px'
               }} 
          />
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
        </div>

        {/* HUD Corners */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-theme-500/40 pointer-events-none z-20" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-theme-500/40 pointer-events-none z-20" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-theme-500/40 pointer-events-none z-20" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-theme-500/40 pointer-events-none z-20" />

        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-14 pb-4">
          <button
            onClick={toggleMobilePlayer}
            className="p-3 bg-theme-500/10 border border-theme-500/30 text-theme-500 hover:text-white transition-all cyber-glitch"
          >
            <BsChevronDown size={24} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-theme-500 tracking-[0.5em] uppercase animate-pulse">
              [ STREAM_MONITORING ]
            </span>
            <div className="flex gap-2 items-center mt-1">
               <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
               <span className="text-[8px] text-theme-500/60 font-mono">LIVE_DECRYPTING...</span>
            </div>
          </div>
          <div className="w-12" /> {/* Spacer for balance */}
        </div>

        {/* Middle Area: Artwork / Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 relative">
           <div className="relative w-full aspect-square max-w-[280px] group">
              {/* 装飾用サークル */}
              <div className="absolute -inset-4 border border-theme-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute -inset-8 border border-theme-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-theme-500/60 shadow-[0_0_30px_rgba(var(--theme-500),0.3)] cyber-glitch">
                 <Image
                   src={imageUrl}
                   alt="artwork"
                   fill
                   className="object-cover group-hover:scale-110 transition-transform duration-1000"
                 />
                 {/* シグナルオーバーレイ */}
                 <div className="absolute inset-0 bg-theme-500/10 mix-blend-overlay animate-pulse" />
              </div>
           </div>
        </div>

        {/* Bottom Controls Area */}
        <div className="relative z-10 px-8 pb-16 w-full flex flex-col gap-8 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent pt-10">
          {/* Title, Artist */}
          <div className="space-y-2 text-center">
            <div className="inline-block px-2 py-0.5 bg-theme-500/20 border border-theme-500/40 text-[8px] text-theme-300 mb-2 uppercase tracking-widest">
               Track_ID: {String(song.id).slice(0, 8)}
            </div>
            <Link href={`/songs/${song.id}`}>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)] hover:text-theme-300 transition-colors">
                <ScrollingText text={song.title} limitCharacters={15} />
              </h1>
            </Link>
            <p className="text-sm text-theme-500 uppercase tracking-[0.3em]">
              // AUTH: {song.author}
            </p>
          </div>

          {/* Seekbar Section */}
          <div className="space-y-3">
            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className="w-full h-1.5"
            />
            <div className="flex justify-between text-[10px] font-bold font-mono text-theme-500/60 tracking-widest">
              <span>{formattedCurrentTime} // [START]</span>
              <div className="h-px flex-1 mx-4 bg-theme-500/10 self-center" />
              <span>[END] // {formattedDuration}</span>
            </div>
          </div>

          {/* Main Transport Controls */}
          <div className="px-4">
            <CommonControls
              isPlaying={isPlaying}
              isShuffling={isShuffling}
              isRepeating={isRepeating}
              Icon={Icon}
              handlePlay={handlePlay}
              onPlayNext={onPlayNext}
              onPlayPrevious={onPlayPrevious}
              toggleShuffle={toggleShuffle}
              toggleRepeat={toggleRepeat}
              isMobile={true}
            />
          </div>

          {/* HUD Tools Bar */}
          <div className="flex justify-between items-center px-4 bg-[#0a0a0f]/60 border border-theme-500/20 py-2 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)]">
            <button
              onClick={toggleLyrics}
              className={`p-3 transition-all ${
                showLyrics
                  ? "bg-theme-500/30 text-white shadow-[0_0_15px_rgba(var(--theme-500),0.4)]"
                  : "text-theme-500/60 hover:text-theme-300"
              }`}
            >
              <Mic2 size={20} />
            </button>

            <div className="flex gap-4">
               <PlaybackSpeedButton />
               <EqualizerButton />
            </div>

            <div className="flex gap-4 items-center">
               <LikeButton songId={song.id} size={22} songType="regular" />
               <AddPlaylist
                 playlists={playlists}
                 songId={song.id}
                 songType="regular"
               >
                 <RiPlayListAddFill size={22} className="text-theme-500/60 hover:text-theme-300" />
               </AddPlaylist>
            </div>
          </div>
        </div>

        <LyricsDrawer
          showLyrics={showLyrics}
          toggleLyrics={toggleLyrics}
          lyrics={song?.lyrics || ""}
        />
      </motion.div>
    );
  }
);

MobilePlayerContent.displayName = "MobilePlayerContent";

export default MobilePlayerContent;
