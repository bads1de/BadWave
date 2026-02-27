"use client";

import useGetSongById from "@/hooks/data/useGetSongById";
import usePlayer from "@/hooks/player/usePlayer";
import { memo, useEffect } from "react";
import PlayerContent from "./PlayerContent";
import MobileTabs from "../Mobile/MobileTabs";
import { Playlist } from "@/types";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";
import { usePathname } from "next/navigation";
import useAudioControl from "@/hooks/audio/useAudioControl";
import LyricsModal from "../Modals/LyricsModal/LyricsModal";

interface PlayerProps {
  playlists: Playlist[];
}

const Player = ({ playlists }: PlayerProps) => {
  const player = usePlayer();
  const { isMobilePlayer, toggleMobilePlayer } = useMobilePlayer();
  const { song } = useGetSongById(player.activeId);
  const pathname = usePathname();
  const isPulsePage = pathname === "/pulse";
  const { stopMainPlayer } = useAudioControl();

  // pulseページに遷移したら曲を停止する
  useEffect(() => {
    if (isPulsePage) {
      stopMainPlayer();
    }
  }, [isPulsePage, stopMainPlayer]);

  // pulseページではプレイヤーを非表示
  if (isPulsePage) {
    return null;
  }

  if (!song || (!song.song_path && !isMobilePlayer)) {
    return (
      <>
        <div className="md:hidden ">
          <MobileTabs />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50">
        <div className="bg-[#0a0a0f] border-t-2 border-theme-500/40 w-full h-[100px] pb-[130px] md:pb-0 max-md:px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8),0_-5px_15px_rgba(var(--theme-500),0.1)] relative">
          {/* HUD装飾ライン */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-theme-500/40 to-transparent" />
          
          <PlayerContent
            song={song}
            isMobilePlayer={isMobilePlayer}
            toggleMobilePlayer={toggleMobilePlayer}
            playlists={playlists}
          />
        </div>
      </div>
      {!isMobilePlayer && (
        <div className="md:hidden">
          <MobileTabs />
        </div>
      )}

      {/* 全画面歌詞モーダル */}
      <LyricsModal song={song} />
    </>
  );
};

// メモ化してパフォーマンスを改善
export default memo(Player);
