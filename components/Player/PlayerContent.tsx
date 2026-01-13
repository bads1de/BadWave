import React from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { Playlist, Song } from "@/types";

import DesktopPlayer from "./DesktopPlayer";
import MobilePlayer from "./MobilePlayer";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import useAudioEqualizer from "@/hooks/audio/useAudioEqualizer";
import usePlaybackRate from "@/hooks/audio/usePlaybackRate";
import useAudioEffects from "@/hooks/audio/useAudioEffects";
import useMediaSession from "@/hooks/player/useMediaSession";

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

    // イコライザー機能を初期化（AudioEngineを使用）
    useAudioEqualizer();

    // 再生速度機能を初期化
    usePlaybackRate();

    // 統合オーディオエフェクト（Spatial, 8D, Retro, Slowed+Reverb）
    useAudioEffects();

    // Media Session API Integration
    useMediaSession({
      song: song,
      isPlaying: isPlaying,
      onPlay: () => {
        if (!isPlaying) handlePlay();
      },
      onPause: () => {
        if (isPlaying) handlePlay();
      },
      onPlayNext: onPlayNext,
      onPlayPrevious: onPlayPrevious,
      onSeek: handleSeek,
    });

    // アイコン選択ロジック
    const Icon = isPlaying ? BsPauseFill : BsPlayFill;

    return (
      <>
        {/* audio要素はAudioEngineシングルトンで管理されるため、ここには不要 */}

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
