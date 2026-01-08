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
        className="md:hidden fixed inset-0 bg-black text-white z-50 flex flex-col"
        style={{ touchAction: showLyrics ? "auto" : "none" }}
      >
        {/* Background Media Layer */}
        <div className="absolute inset-0 z-0">
          {videoUrl ? (
            <video
              className="w-full h-full object-cover"
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
              className="w-full h-full object-cover"
              priority
            />
          )}
          {/* Main Overlay Gradient - Stronger at bottom for controls visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          <div className="absolute bottom-0 h-2/3 w-full bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
          <button
            onClick={toggleMobilePlayer}
            className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
          >
            <BsChevronDown size={28} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-white/70 uppercase tracking-widest">
              Now Playing
            </span>
          </div>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>

        {/* Middle Spacer */}
        <div className="flex-1" />

        {/* Bottom Controls Area */}
        <div className="relative z-10 px-6 pb-12 w-full flex flex-col gap-6">
          {/* Title, Artist, Like Row */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <Link href={`/songs/${song.id}`}>
                <h1 className="text-2xl font-bold text-white drop-shadow-md hover:underline truncate">
                  {" "}
                  {/* ScrollingText handles its own truncation often, but parent needs overflow hidden */}
                  <ScrollingText text={song.title} limitCharacters={20} />
                </h1>
              </Link>
              <p className="text-lg text-gray-300 truncate font-medium">
                {song.author}
              </p>
            </div>
            <div className="flex-shrink-0">
              <LikeButton songId={song.id} size={26} songType="regular" />
            </div>
          </div>

          {/* Seekbar Section */}
          <div className="space-y-2">
            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className="w-full h-1"
            />
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>{formattedCurrentTime}</span>
              <span>{formattedDuration}</span>
            </div>
          </div>

          {/* Main Transport Controls */}
          <div className="px-2">
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

          {/* Secondary Actions Row */}
          {/* Secondary Actions Row */}
          <div className="flex justify-between items-center px-8 mt-4">
            <button
              onClick={toggleLyrics}
              className={`p-2 rounded-full transition-colors ${
                showLyrics
                  ? "text-primary hover:text-primary/80"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Lyrics"
            >
              <Mic2 size={24} />
            </button>

            <div className="flex items-center justify-center w-12 h-12">
              <PlaybackSpeedButton />
            </div>

            <div className="flex items-center justify-center w-12 h-12">
              <EqualizerButton />
            </div>

            <div className="text-gray-400 hover:text-white transition-colors p-2">
              <AddPlaylist
                playlists={playlists}
                songId={song.id}
                songType="regular"
              >
                <RiPlayListAddFill size={26} />
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
