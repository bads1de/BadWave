"use client";

import { memo } from "react";
import { twMerge } from "tailwind-merge";

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

// コンポーネント関数を定義
const BoxComponent: React.FC<BoxProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        `
        rounded-xl
        bg-neutral-900/40
        backdrop-blur-xl
        border
        border-white/[0.02]
        shadow-inner
        transition-all
        duration-500
        hover:shadow-lg
        hover:shadow-purple-500/[0.03]
        hover:border-purple-500/[0.05]
        `,
        className
      )}
    >
      {children}
    </div>
  );
};

// displayName を設定
BoxComponent.displayName = "Box";

// memo でラップしてエクスポート
const Box = memo(BoxComponent);

export default Box;
