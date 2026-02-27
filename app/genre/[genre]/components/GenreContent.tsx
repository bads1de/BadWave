"use client";

import useOnPlay from "@/hooks/player/useOnPlay";
import { useUser } from "@/hooks/auth/useUser";
import { Song } from "@/types";
import React, { memo, useCallback } from "react";
import SongList from "@/components/Song/SongList";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";

interface Props {
  songs: Song[];
}

const GenreContent: React.FC<Props> = memo(({ songs }) => {
  const onPlay = useOnPlay(songs);
  const { user } = useUser();

  // 再生ハンドラをメモ化
  const handlePlay = useCallback(
    (id: string) => {
      onPlay(id);
    },
    [onPlay]
  );

      if (songs.length === 0) {
        return (
          <div className="flex flex-col gap-y-2 w-full px-8 py-20 text-theme-500 font-mono tracking-widest uppercase">
            [ ! ] NO_DATA_DETECTED_IN_SECTOR_GENRE
          </div>
        );
      }
  
      return (
        <div className="flex flex-col gap-y-4 w-full px-8 font-mono">
          <div className="mb-4 flex items-center justify-between text-[10px] text-theme-500/40 tracking-[0.3em] uppercase">
             <span>// SECTOR_SCAN_RESULTS</span>
             <span>NODES_IDENTIFIED: {songs.length}</span>
          </div>
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-x-4 w-full">
              <div className="flex-1 min-w-0">
                <SongList data={song} onClick={handlePlay} />
              </div>
              {user?.id && (
                <div className="flex items-center gap-x-2">
                  <SongOptionsPopover song={song} />
                </div>
              )}
            </div>
          ))}
        </div>
      );
  
});

// displayName を設定
GenreContent.displayName = "GenreContent";

export default GenreContent;
