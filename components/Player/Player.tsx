"use client";

import useGetSongById from "@/hooks/data/useGetSongById";
import usePlayer from "@/hooks/player/usePlayer";
import React, { memo, useEffect } from "react";
import PlayerContent from "./PlayerContent";
import MobileTabs from "../Mobile/MobileTabs";
import { Playlist } from "@/types";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";
import { usePathname } from "next/navigation";
import { globalAudioPlayerRef } from "@/hooks/audio/useAudioWave";

interface PlayerProps {
  playlists: Playlist[];
}

const Player = ({ playlists }: PlayerProps) => {
  const player = usePlayer();
  const { isMobilePlayer, toggleMobilePlayer } = useMobilePlayer();
  const { song } = useGetSongById(player.activeId);
  const pathname = usePathname();
  const isPulsePage = pathname === "/pulse";

  // pulseページに遷移したら曲を停止する
  useEffect(() => {
    if (isPulsePage) {
      // メインプレイヤーを停止
      if (globalAudioPlayerRef.pauseMainPlayer) {
        globalAudioPlayerRef.pauseMainPlayer();
      }
      if (globalAudioPlayerRef.mainPlayerAudioRef) {
        globalAudioPlayerRef.mainPlayerAudioRef.pause();
      }
    }
  }, [isPulsePage]);

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
        <div className="bg-[#121212] border-t border-[#303030] rounded-t-xl w-full h-[100px] pb-[130px] md:pb-0 max-md:px-2">
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
    </>
  );
};

// メモ化してパフォーマンスを改善
export default memo(Player);
