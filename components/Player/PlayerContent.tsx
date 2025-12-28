import React, { useEffect } from "react";
import { Playlist, Song } from "@/types";

import DesktopPlayer from "./DesktopPlayer";
import MobilePlayer from "./MobilePlayer";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import useLyricsStore from "@/hooks/stores/useLyricsStore";

interface PlayerContentProps {
  song: Song;
  isMobilePlayer: boolean;
  toggleMobilePlayer: () => void;
  playlists: Playlist[];
}

const PlayerContent: React.FC<PlayerContentProps> = React.memo(
  ({ song, isMobilePlayer, toggleMobilePlayer, playlists }) => {
    const {
      Icon,
      VolumeIcon,
      formattedCurrentTime,
      formattedDuration,
      volume,
      setVolume,
      audioRef,
      currentTime,
      duration,
      isPlaying,
      isRepeating,
      isShuffling,
      handlePlay,
      handleSeek,
      onPlayNext,
      onPlayPrevious,
      toggleRepeat,
      toggleShuffle,
      handleVolumeClick,
      showVolumeSlider,
      setShowVolumeSlider,
    } = useAudioPlayer(song?.song_path);
    const { toggleLyrics } = useLyricsStore();

    useEffect(() => {
      if (!showVolumeSlider) return;

      const timeout = setTimeout(() => {
        setShowVolumeSlider(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }, [showVolumeSlider, setShowVolumeSlider]);

    return (
      <>
        {/* NOTE: srcはuseAudioPlayer内で設定されるため、ここでは指定しない */}
        <audio ref={audioRef} />

        {isMobilePlayer ? (
          <MobilePlayer
            song={song}
            playlists={playlists}
            isMobilePlayer={isMobilePlayer}
            formattedCurrentTime={formattedCurrentTime}
            formattedDuration={formattedDuration}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isShuffling={isShuffling}
            isRepeating={isRepeating}
            Icon={Icon}
            handlePlay={handlePlay}
            handleSeek={handleSeek}
            toggleMobilePlayer={toggleMobilePlayer}
            toggleShuffle={toggleShuffle}
            toggleRepeat={toggleRepeat}
            onPlayNext={onPlayNext}
            onPlayPrevious={onPlayPrevious}
          />
        ) : (
          <DesktopPlayer
            song={song}
            playlists={playlists}
            formattedCurrentTime={formattedCurrentTime}
            formattedDuration={formattedDuration}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isShuffling={isShuffling}
            isRepeating={isRepeating}
            volume={volume}
            setVolume={setVolume}
            Icon={Icon}
            VolumeIcon={VolumeIcon}
            handleVolumeClick={handleVolumeClick}
            showVolumeSlider={showVolumeSlider}
            handlePlay={handlePlay}
            handleSeek={handleSeek}
            onPlayNext={onPlayNext}
            onPlayPrevious={onPlayPrevious}
            toggleShuffle={toggleShuffle}
            toggleRepeat={toggleRepeat}
            toggleMobilePlayer={toggleMobilePlayer}
          />
        )}
      </>
    );
  }
);

PlayerContent.displayName = "PlayerContent";

export default PlayerContent;
