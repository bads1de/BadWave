"use client";

import React from "react";

interface UploadSubmitButtonProps {
  /** 送信中かどうか */
  isLoading: boolean;
  /** 通常時のラベル */
  label: string;
  /** 送信中のラベル */
  loadingLabel: string;
  /** 通常時に表示するアイコン */
  icon: React.ReactNode;
  /** 追加のクラス（col-span-full など） */
  className?: string;
}

/**
 * アップロード系モーダル共通の送信ボタン。
 *
 * スピナー・スキャンライン・グリッチ表現を1箇所にまとめ、
 * 各モーダルではラベルとアイコンだけを差し替える。
 */
const UploadSubmitButton: React.FC<UploadSubmitButtonProps> = ({
  isLoading,
  label,
  loadingLabel,
  icon,
  className = "",
}) => {
  return (
    <button
      disabled={isLoading}
      type="submit"
      className={`relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.5em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] disabled:opacity-50 cyber-glitch ${className}`}
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingLabel}
          </>
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </div>
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
    </button>
  );
};

export default React.memo(UploadSubmitButton);
