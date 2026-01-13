import { useEffect } from "react";
import { Song } from "@/types";

interface UseMediaSessionProps {
  song?: Song;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onSeek?: (time: number) => void;
}

const useMediaSession = ({
  song,
  isPlaying,
  onPlay,
  onPause,
  onPlayNext,
  onPlayPrevious,
  onSeek,
}: UseMediaSessionProps) => {
  // Metadata update
  useEffect(() => {
    if (!song || !("mediaSession" in navigator)) return;

    if (typeof MediaMetadata === "undefined") return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.author,
      artwork: song.image_path
        ? [
            { src: song.image_path, sizes: "96x96", type: "image/png" },
            { src: song.image_path, sizes: "128x128", type: "image/png" },
            { src: song.image_path, sizes: "192x192", type: "image/png" },
            { src: song.image_path, sizes: "256x256", type: "image/png" },
            { src: song.image_path, sizes: "384x384", type: "image/png" },
            { src: song.image_path, sizes: "512x512", type: "image/png" },
          ]
        : [],
    });
  }, [song]);

  // Playback state update
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", onPlay);
    navigator.mediaSession.setActionHandler("pause", onPause);
    navigator.mediaSession.setActionHandler("previoustrack", onPlayPrevious);
    navigator.mediaSession.setActionHandler("nexttrack", onPlayNext);

    if (onSeek) {
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          onSeek(details.seekTime);
        }
      });
    }

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [onPlay, onPause, onPlayNext, onPlayPrevious, onSeek]);
};

export default useMediaSession;
