import React from "react";
import { Song, Playlist } from "@/types";
import MediaItem from "../Song/MediaItem";
import MobilePlayerContent from "../Mobile/MobilePlayerContent";

interface MobilePlayerProps {
  song: Song;
  playlists: Playlist[];
  isMobilePlayer: boolean;
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
  toggleMobilePlayer: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
}

const MobilePlayer: React.FC<MobilePlayerProps> = React.memo(
  ({
    song,
    playlists,
    isMobilePlayer,
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
    toggleMobilePlayer,
    toggleShuffle,
    toggleRepeat,
    onPlayNext,
    onPlayPrevious,
  }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 h-full bg-[#121212] border-t border-[#303030] rounded-t-xl">
        <div className="flex w-full justify-start px-4">
          <div className="flex items-center gap-x-4">
            <MediaItem data={song} onClick={toggleMobilePlayer} />
          </div>
        </div>

        <div className="flex md:hidden col-auto w-full justify-end items-center">
          <div
            onClick={handlePlay}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#08101f] to-[#0d0d0d] p-1 cursor-pointer group"
          >
            <Icon
              size={30}
              className="text-[#f0f0f0] group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </div>
        </div>

        {isMobilePlayer && (
          <MobilePlayerContent
            song={song}
            playlists={playlists}
            songUrl={song.song_path}
            imageUrl={song.image_path}
            videoUrl={song.video_path}
            currentTime={currentTime}
            duration={duration}
            formattedCurrentTime={formattedCurrentTime}
            formattedDuration={formattedDuration}
            isPlaying={isPlaying}
            isShuffling={isShuffling}
            isRepeating={isRepeating}
            handlePlay={handlePlay}
            handleSeek={handleSeek}
            toggleMobilePlayer={toggleMobilePlayer}
            toggleShuffle={toggleShuffle}
            toggleRepeat={toggleRepeat}
            onPlayNext={onPlayNext}
            onPlayPrevious={onPlayPrevious}
          />
        )}
      </div>
    );
  }
);

MobilePlayer.displayName = "MobilePlayer";

export default MobilePlayer;