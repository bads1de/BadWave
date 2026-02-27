"use client";

import { twMerge } from "tailwind-merge";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        `
        relative
        h-fit
        bg-[#0a0a0f]/80
        backdrop-blur-md
        border-b
        border-theme-500/30
        shadow-[0_4px_20px_rgba(var(--theme-500),0.1)]
        after:content-['']
        after:absolute
        after:bottom-[-1px]
        after:left-0
        after:w-full
        after:h-[1px]
        after:bg-gradient-to-r
        after:from-transparent
        after:via-theme-500
        after:to-transparent
        `,
        className
      )}
    >
      <div className="w-full px-6 py-4 relative overflow-hidden">
        {/* 装飾的なHUDライン */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-theme-500/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-theme-500/10 pointer-events-none" />
        
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-x-2 md:gap-x-4"></div>
          <div className="flex items-center gap-x-2 md:gap-x-4">
            <div className="flex justify-between items-center gap-x-4"></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

// displayName を設定
Header.displayName = "Header";

export default Header;
