import React from "react";
import { MdLyrics } from "react-icons/md";
import { Playlist, Song } from "@/types";
import LikeButton from "../LikeButton";
import MediaItem from "../Song/MediaItem";
import Slider from "./Slider";
import SeekBar from "./Seekbar";
import AddPlaylist from "../Playlist/AddPlaylist";
import CommonControls from "./CommonControls";
import useLyricsStore from "@/hooks/stores/useLyricsStore";

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
  volume: number;
  setVolume: (value: number) => void;
  Icon: React.ComponentType<any>;
  VolumeIcon: React.ComponentType<any>;
  handleVolumeClick: () => void;
  showVolumeSlider: boolean;
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
    volume,
    setVolume,
    Icon,
    VolumeIcon,
    handleVolumeClick,
    showVolumeSlider,
    handlePlay,
    handleSeek,
    onPlayNext,
    onPlayPrevious,
    toggleShuffle,
    toggleRepeat,
    toggleMobilePlayer,
  }) => {
    const { toggleLyrics } = useLyricsStore();

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 h-full bg-[#121212] border-t border-[#303030] rounded-t-xl">
        <div className="flex w-full justify-start px-4">
          <div className="flex items-center gap-x-4">
            <MediaItem data={song} onClick={toggleMobilePlayer} />
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
          <div className="flex items-center gap-x-8 w-full md:w-[170px] lg:w-[200px]">
            <AddPlaylist
              playlists={playlists}
              songId={song.id}
              songType="regular"
            />
            <LikeButton songId={song.id} songType="regular" />
            <button
              onClick={toggleLyrics}
              className="cursor-pointer text-neutral-400 hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
            >
              <MdLyrics size={22} />
            </button>
            <div className="relative">
              <VolumeIcon
                onClick={handleVolumeClick}
                className="cursor-pointer text-neutral-400 hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
                size={22}
              />
              <div
                className={`absolute bottom-full rounded-xl mb-3 right-0 transition-all duration-200 z-50 bg-[#0c0c0c] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#333333] ${
                  showVolumeSlider
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 pointer-events-none transform translate-y-2"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Slider
                    value={volume}
                    onChange={(value) => setVolume(value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DesktopPlayer.displayName = "DesktopPlayer";

export default DesktopPlayer;