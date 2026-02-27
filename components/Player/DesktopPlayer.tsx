import React from "react";
import { Mic2 } from "lucide-react";
import { Playlist, Song } from "@/types";
import LikeButton from "../LikeButton";
import MediaItem from "../Song/MediaItem";
import SeekBar from "./Seekbar";
import AddPlaylist from "../Playlist/AddPlaylist";
import CommonControls from "./CommonControls";
import VolumeControl from "./VolumeControl";
import AudioSettingsButton from "./AudioSettingsButton";
import useLyricsStore from "@/hooks/stores/useLyricsStore";
import useLyricsModalStore from "@/hooks/stores/useLyricsModalStore";

interface DesktopPlayerProps {
  song: Song;
  playlists: Playlist[];
  formattedCurrentTime: string;
  formattedDuration: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  Icon: React.ComponentType<any>;
  handlePlay: () => void;
  handleSeek: (time: number) => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleMobilePlayer: () => void;
}

const DesktopPlayer: React.FC<DesktopPlayerProps> = React.memo(
  ({
    song,
    playlists,
    formattedCurrentTime,
    formattedDuration,
    currentTime,
    duration,
    isPlaying,
    isShuffling,
    isRepeating,
    Icon,
    handlePlay,
    handleSeek,
    onPlayNext,
    onPlayPrevious,
    toggleShuffle,
    toggleRepeat,
    toggleMobilePlayer,
  }) => {
    const { toggleLyrics } = useLyricsStore();
    const { openModal } = useLyricsModalStore();

    // PCサイズ（md: 768px以上）では歌詞モーダル、それ以下ではモバイルプレイヤーを開く
    const handleMediaClick = () => {
      if (window.innerWidth >= 768) {
        openModal();
      } else {
        toggleMobilePlayer();
      }
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 h-full bg-[#0a0a0f] border-t border-theme-500/10 relative">
        <div className="flex w-full justify-start px-4">
          <div className="flex items-center gap-x-4">
            <MediaItem data={song} onClick={handleMediaClick} />
          </div>
        </div>

        <div className="flex md:hidden col-auto w-full justify-end items-center pr-6">
          <div
            onClick={handlePlay}
            className="h-12 w-12 flex items-center justify-center border border-theme-500/40 bg-theme-500/10 cursor-pointer group hover:bg-theme-500 transition-all duration-500 shadow-[0_0_15px_rgba(var(--theme-500),0.3)]"
          >
            <Icon
              size={32}
              className="text-white group-hover:text-[#0a0a0f] transition-colors"
            />
          </div>
        </div>

        <div className="hidden md:flex flex-col w-full md:justify-center items-center max-w-[722px] gap-x-6">
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
            isMobile={false}
          />

          <div className="flex items-center gap-x-2 mt-4 w-full lg:max-w-[800px] md:max-w-[300px]">
            <span className="w-[50px] text-center inline-block text-[#f0f0f0]">
              {formattedCurrentTime}
            </span>
            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className="flex-1 h-2"
            />
            <span className="w-[50px] text-center inline-block text-[#f0f0f0]">
              {formattedDuration}
            </span>
          </div>
        </div>

        <div className="hidden md:flex w-full justify-end pr-6">
          <div className="flex items-center gap-x-6 w-full md:w-[200px] lg:w-[240px]">
            <AddPlaylist
              playlists={playlists}
              songId={song.id}
              songType="regular"
            />
            <LikeButton songId={song.id} songType="regular" size={20} />
            <button
              onClick={toggleLyrics}
              className="cursor-pointer text-neutral-400 hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
            >
              <Mic2 size={20} />
            </button>
            <AudioSettingsButton />
            <VolumeControl />
          </div>
        </div>
      </div>
    );
  },
);

DesktopPlayer.displayName = "DesktopPlayer";

export default DesktopPlayer;
