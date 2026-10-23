"use client";

import { memo } from "react";
import SongScrollBoard from "@/components/common/SongScrollBoard";
import type { Song } from "@/types";

interface ForYouBoardProps {
  className?: string;
  recommendations: Song[];
}

const ForYouBoard: React.FC<ForYouBoardProps> = ({
  className = "",
  recommendations = [],
}) => (
  <SongScrollBoard
    songs={recommendations}
    className={className}
    listClassName="flex space-x-4"
    itemClassName="group relative transform transition duration-300 ease-in-out hover:scale-105 min-w-[200px] w-[200px]"
    emptyState={
      <p className="text-neutral-400 text-center">
        まだ推薦曲がありません。もっと曲を聴いてみましょう！
      </p>
    }
  />
);

// 表示名を設定
ForYouBoard.displayName = "ForYouBoard";

// メモ化されたコンポーネントをエクスポート
export default memo(ForYouBoard);
