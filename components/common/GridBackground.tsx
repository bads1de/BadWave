import React from "react";
import { twMerge } from "tailwind-merge";

interface GridBackgroundProps {
  /** グリッド1マスのサイズ (backgroundSize) */
  cellSize?: string;
  /** グリッド線の色 (rgba() のRGB部分。例: "var(--theme-500)" / "239, 68, 68") */
  color?: string;
  /** グリッド線1本あたりの不透明度 */
  lineOpacity?: number;
  /** 背景全体の不透明度 */
  opacity?: number;
  /** 追加クラス (fixed など)。position の上書きに使用する */
  className?: string;
}

/**
 * Cyberpunk風のグリッド背景装飾
 *
 * 各画面で使い回されていた linear-gradient のグリッドを共通化する。
 * 親要素に position: relative を前提とした装飾レイヤー。
 */
const GridBackground: React.FC<GridBackgroundProps> = ({
  cellSize = "40px 40px",
  color = "var(--theme-500)",
  lineOpacity = 0.2,
  opacity = 0.1,
  className,
}) => {
  return (
    <div
      className={twMerge("absolute inset-0 pointer-events-none", className)}
      style={{
        opacity,
        backgroundImage: `linear-gradient(rgba(${color}, ${lineOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(${color}, ${lineOpacity}) 1px, transparent 1px)`,
        backgroundSize: cellSize,
      }}
    />
  );
};

export default GridBackground;
