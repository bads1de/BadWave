"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libs/utils";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 現在ページの前後に表示するページ数 */
  siblingCount?: number;
  className?: string;
}

/**
 * ページネーションコンポーネント
 *
 * ページ番号ボタン、前へ/次へボタンを表示
 * 多すぎるページは省略記号（...）でまとめる
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const { getColorScheme } = useColorSchemeStore();
  const theme = getColorScheme();

  // ページがない場合は表示しない
  if (totalPages <= 1) return null;

  // 表示するページ番号を計算
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    // 常に最初のページを表示
    pages.push(0);

    // 計算用の範囲
    const leftSibling = Math.max(1, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 2, currentPage + siblingCount);

    // 左側の省略記号が必要か
    const showLeftDots = leftSibling > 1;
    // 右側の省略記号が必要か
    const showRightDots = rightSibling < totalPages - 2;

    if (showLeftDots) {
      pages.push("...");
    }

    // 中間のページ
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i > 0 && i < totalPages - 1) {
        pages.push(i);
      }
    }

    if (showRightDots) {
      pages.push("...");
    }

    // 常に最後のページを表示（ページが複数ある場合）
    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }

    // 重複を削除
    return Array.from(new Set(pages));
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className={cn("flex items-center justify-center gap-2 font-mono", className)}
      aria-label="Pagination"
    >
      {/* 前へボタン */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={cn(
          "flex items-center justify-center w-10 h-10 border transition-all duration-300",
          currentPage === 0
            ? "border-theme-500/10 text-theme-900 cursor-not-allowed"
            : "border-theme-500/30 text-theme-500 hover:text-white hover:border-theme-500 hover:bg-theme-500/10 hover:shadow-[0_0_10px_rgba(var(--theme-500),0.3)] cyber-glitch"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* ページ番号 */}
      <div className="flex items-center gap-1.5">
        {pageNumbers.map((pageNum, index) =>
          pageNum === "..." ? (
            <span
              key={`dots-${index}`}
              className="flex items-center justify-center w-8 h-10 text-theme-900 font-black"
            >
              //
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "flex items-center justify-center min-w-10 h-10 px-2 border transition-all duration-500 relative overflow-hidden text-xs font-black uppercase",
                pageNum === currentPage
                  ? "bg-theme-500/20 border-theme-500 text-white shadow-[0_0_15px_rgba(var(--theme-500),0.4)] cyber-glitch"
                  : "bg-transparent border-theme-500/10 text-theme-500/40 hover:text-theme-300 hover:border-theme-500/40 hover:bg-theme-500/5"
              )}
              aria-current={pageNum === currentPage ? "page" : undefined}
            >
              {pageNum === currentPage && (
                 <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white" />
              )}
              {(pageNum + 1).toString().padStart(2, '0')}
            </button>
          )
        )}
      </div>

      {/* 次へボタン */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={cn(
          "flex items-center justify-center w-10 h-10 border transition-all duration-300",
          currentPage >= totalPages - 1
            ? "border-theme-500/10 text-theme-900 cursor-not-allowed"
            : "border-theme-500/30 text-theme-500 hover:text-white hover:border-theme-500 hover:bg-theme-500/10 hover:shadow-[0_0_10px_rgba(var(--theme-500),0.3)] cyber-glitch"
        )}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};

export default React.memo(Pagination);
