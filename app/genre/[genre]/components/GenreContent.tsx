"use client";

import { Song } from "@/types";
import React, { memo } from "react";
import SongListContent, {
  SongListEmptyState,
} from "@/components/Song/SongListContent";

interface Props {
  songs: Song[];
}

const GenreContent: React.FC<Props> = memo(({ songs }) => (
  <SongListContent
    songs={songs}
    className="flex flex-col gap-y-4 w-full px-8 font-mono"
    header={
      <div className="mb-4 flex items-center justify-between text-[10px] text-theme-500/40 tracking-[0.3em] uppercase">
        <span>{"// SECTOR_SCAN_RESULTS"}</span>
        <span>NODES_IDENTIFIED: {songs.length}</span>
      </div>
    }
    emptyState={
      <SongListEmptyState message="[ ! ] NO_DATA_DETECTED_IN_SECTOR_GENRE" />
    }
  />
));

// displayName を設定
GenreContent.displayName = "GenreContent";

export default GenreContent;
