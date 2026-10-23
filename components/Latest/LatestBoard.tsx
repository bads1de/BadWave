"use client";

import { memo } from "react";
import SongScrollBoard from "@/components/common/SongScrollBoard";
import type { Song } from "@/types";

interface LatestBoardProps {
  songs: Song[];
}

const LatestBoard: React.FC<LatestBoardProps> = ({ songs }) => (
  <SongScrollBoard
    songs={songs}
    className="flex flex-col h-full relative"
    listClassName="flex space-x-6 pb-4"
    itemClassName="group relative min-w-[200px] w-[200px]"
    emptyState={
      <div className="py-10 border border-dashed border-theme-500/20 bg-theme-500/5 text-center">
        <p className="text-theme-500/60 uppercase tracking-[0.4em] text-xs animate-pulse">
          [ ! ] NO_DATA_STREAMS_IN_BUFFER
        </p>
      </div>
    }
  />
);

// メモ化されたコンポーネントをエクスポート
export default memo(LatestBoard);
