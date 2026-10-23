"use client";

import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";

import SongItem from "@/components/Song/SongItem";
import ScrollableContainer from "@/components/common/ScrollableContainer";
import useHoverArrows from "@/hooks/utils/useHoverArrows";
import useOnPlay from "@/hooks/player/useOnPlay";
import { DURATIONS } from "@/constants";
import type { Song } from "@/types";

interface SongScrollBoardProps {
  songs: Song[];
  /** 曲がないときに表示する要素 */
  emptyState: React.ReactNode;
  /** 親要素のクラス（高さ・レイアウト用） */
  className?: string;
  /** 曲リストのクラス（余白の調整用） */
  listClassName?: string;
  /** 各カードのクラス（幅・ホバー効果用） */
  itemClassName?: string;
}

// レンダーごとに作り直さないようモジュールスコープに置く
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.NORMAL } },
};

/**
 * 曲を横スクロールで並べる共通ボード。
 *
 * スクロール矢印・再生ハンドラ・フェードインのアニメーションを一元化し、
 * 各ボードは空状態とカードの見た目だけを指定する。
 */
const SongScrollBoard: React.FC<SongScrollBoardProps> = ({
  songs,
  emptyState,
  className = "",
  listClassName = "flex space-x-6 pb-4",
  itemClassName = "group relative min-w-[200px] w-[200px]",
}) => {
  const onPlay = useOnPlay(songs);
  const { showArrows, onMouseEnter, onMouseLeave } = useHoverArrows();

  const handlePlay = useCallback(
    (id: string) => {
      onPlay(id);
    },
    [onPlay]
  );

  if (songs.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ScrollableContainer showArrows={showArrows}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={listClassName}
        >
          {songs.map((song) => (
            <motion.div
              key={song.id}
              variants={itemVariants}
              className={itemClassName}
            >
              <SongItem onClick={handlePlay} data={song} />
            </motion.div>
          ))}
        </motion.div>
      </ScrollableContainer>
    </div>
  );
};

SongScrollBoard.displayName = "SongScrollBoard";

export default memo(SongScrollBoard);
