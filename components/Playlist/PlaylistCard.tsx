"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Playlist } from "@/types";
import { motion } from "framer-motion";
import { memo, ReactNode, useCallback } from "react";
import { DURATIONS } from "@/constants";
import { twMerge } from "tailwind-merge";

type PlaylistCardAnimation = "rise" | "scale";

interface PlaylistCardProps {
  playlist: Playlist;
  /** クリック時の遷移先 */
  href: string;
  /** 入場アニメーションの遅延に使うインデックス */
  index?: number;
  /** 入場アニメーションの長さ */
  duration?: number;
  /** 1件ごとの遅延量 */
  delayStep?: number;
  /** 入場アニメーションの種類 */
  animation?: PlaylistCardAnimation;
  /** 外側ラッパーの追加クラス */
  className?: string;
  /** カード本体の追加クラス（余白・角丸・ホバー演出などの差分） */
  cardClassName?: string;
  /** アートワーク枠の追加クラス（余白・枠線などの差分） */
  artworkClassName?: string;
  /** アートワークのクラス（モノクロ→カラー等の差分） */
  imageClassName?: string;
  /** next/image の sizes */
  sizes?: string;
  /** アートワークに重ねる装飾（グラデーション等） */
  imageOverlay?: ReactNode;
  /** アートワークより上に差し込む要素（HUD のステータス行など） */
  header?: ReactNode;
  /** カード本体の末尾に差し込む要素（タイトル・メタ情報・HUD装飾など） */
  children?: ReactNode;
}

const GRID_SIZES =
  "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw";

/**
 * プレイリストカードの共通シェル
 *
 * プレイリスト一覧 / 検索結果で重複していた
 * 「motion ラッパー + カード枠 + アートワーク」を共通化し、
 * ページごとに異なる装飾や情報ブロックはスロット(props)で差し込む。
 *
 * クラスは tailwind-merge で結合するため、呼び出し側のクラスで既定値を上書きできる。
 */
const PlaylistCard: React.FC<PlaylistCardProps> = memo(
  ({
    playlist,
    href,
    index = 0,
    duration = DURATIONS.NORMAL,
    delayStep = 0.05,
    animation = "rise",
    className,
    cardClassName,
    artworkClassName,
    imageClassName,
    sizes = GRID_SIZES,
    imageOverlay,
    header,
    children,
  }) => {
    const router = useRouter();
    // 横スクロール表示は拡大、グリッド表示は下からふわっと現れる
    const isScale = animation === "scale";

    const handleClick = useCallback(() => {
      router.push(href);
    }, [router, href]);

    return (
      <motion.div
        initial={isScale ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: 20 }}
        animate={isScale ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration, delay: index * delayStep }}
        className={twMerge("group relative cursor-pointer", className)}
        onClick={handleClick}
      >
        {/* HUD装飾背後 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-theme-500/20 via-theme-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm rounded-none" />

        {/* Main Card Container */}
        <div
          className={twMerge(
            "relative bg-[#0a0a0f] border border-theme-500/20 rounded-none p-4 transform transition-all duration-500 group-hover:-translate-y-2 group-hover:border-theme-500/60 group-hover:shadow-[0_10px_30px_rgba(var(--theme-500),0.15)] overflow-hidden",
            cardClassName
          )}
        >
          {/* 角のアクセント */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/0 group-hover:border-theme-500/40 transition-colors pointer-events-none rounded-none" />

          {header}

          {/* Image Container */}
          <div
            className={twMerge(
              "relative aspect-square w-full overflow-hidden rounded-none mb-4 border border-theme-500/10",
              artworkClassName
            )}
          >
            <Image
              src={playlist.image_path || "/images/playlist.png"}
              alt={playlist.title}
              fill
              className={twMerge(
                "object-cover transition-transform duration-700 group-hover:scale-125 group-hover:opacity-80",
                imageClassName
              )}
              sizes={sizes}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-theme-900/80" />
            {imageOverlay}
          </div>

          {children}
        </div>
      </motion.div>
    );
  }
);

// displayName を設定
PlaylistCard.displayName = "PlaylistCard";

export default PlaylistCard;
