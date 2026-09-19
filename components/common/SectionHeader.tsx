import React from "react";
import { twMerge } from "tailwind-merge";

interface SectionHeaderProps {
  /** セクションの見出し */
  title: string;
  /** 見出し下のサブタイトル (先頭に "// " が付与される) */
  subtitle: string;
  /** 見出し全体のラッパー (余白やレイアウト調整用) */
  className?: string;
  /** 左側の発光バーのクラス */
  barClassName?: string;
  /** タイトルのクラス */
  titleClassName?: string;
}

/**
 * 各セクション共通のヘッダー
 *
 * 発光バー + 大文字タイトル + "// サブタイトル" という
 * 共通レイアウトを一元化する。セクションごとの差異はクラスで上書きする。
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className,
  barClassName,
  titleClassName,
}) => {
  return (
    <div
      className={twMerge("flex items-center gap-x-4 mb-6 group/header", className)}
    >
      <div
        className={twMerge(
          "h-10 w-1 bg-theme-500 shadow-[0_0_15px_rgba(var(--theme-500),0.8)] animate-pulse",
          barClassName
        )}
      />
      <div>
        <h2
          className={twMerge(
            "text-3xl font-bold text-white tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]",
            titleClassName
          )}
        >
          {title}
        </h2>
        <p className="text-[10px] text-theme-500/60 mt-1 font-mono tracking-widest uppercase">
          {"// "}
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default SectionHeader;
