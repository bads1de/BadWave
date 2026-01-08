import React from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { Playlist, Song } from "@/types";

import DesktopPlayer from "./DesktopPlayer";
import MobilePlayer from "./MobilePlayer";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import useAudioEqualizer from "@/hooks/audio/useAudioEqualizer";
import usePlaybackRate from "@/hooks/audio/usePlaybackRate";

interface PlayerContentProps {
  song: Song;
  isMobilePlayer: boolean;
  toggleMobilePlayer: () => void;
  playlists: Playlist[];
}

const PlayerContent: React.FC<PlayerContentProps> = React.memo(
  ({ song, isMobilePlayer, toggleMobilePlayer, playlists }) => {
    const {
      formattedCurrentTime,
      formattedDuration,
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
    } = useAudioPlayer(song?.song_path);

    // イコライザー機能を初期化（audioRefを渡す）
    useAudioEqualizer(audioRef);

    // 再生速度機能を初期化（audioRefを渡す）
    usePlaybackRate(audioRef);

    // アイコン選択ロジック
    const Icon = isPlaying ? BsPauseFill : BsPlayFill;

    return (
      <>
        {/* NOTE: srcはuseAudioPlayer内で設定されるため、ここでは指定しない */}
        {/* crossOrigin でWeb Audio API (イコライザー) がCORS対応できるようにする */}
        <audio ref={audioRef} crossOrigin="anonymous" />

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
            Icon={Icon}
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
