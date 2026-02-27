import React from "react";
import { Song } from "@/types";
import NextSongPreview from "./NextSongPreview";
import CurrentSongDisplay from "./CurrentSongDisplay";
import useLyricsStore from "@/hooks/stores/useLyricsStore";
import SyncedLyrics from "@/components/Lyrics/SyncedLyrics";

interface FullScreenLayoutProps {
  song: Song;
  videoPath?: string;
  imagePath?: string;
  nextSong: Song | undefined;
  nextImagePath?: string;
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = React.memo(
  ({ song, videoPath, imagePath, nextSong, nextImagePath }) => {
    const { showLyrics } = useLyricsStore();
    const lyrics = song.lyrics ?? "歌詞はありません";

    if (showLyrics) {
      return (
        <div className="relative w-full h-full bg-black/20 backdrop-blur-sm custom-scrollbar rounded-none border border-theme-500/10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
          <div className="flex items-center justify-center h-full py-8 px-6">
            <div className="w-full max-h-full overflow-y-auto custom-scrollbar pr-2">
              <SyncedLyrics lyrics={lyrics} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden rounded-none shadow-2xl border-l border-theme-500/10 bg-[#0a0a0f] group">
        <CurrentSongDisplay
          song={song}
          videoPath={videoPath}
          imagePath={imagePath}
        />
        <NextSongPreview nextSong={nextSong} nextImagePath={nextImagePath} />
      </div>
    );
  },
);

FullScreenLayout.displayName = "FullScreenLayout";

export default FullScreenLayout;
