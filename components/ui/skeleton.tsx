import * as React from "react";
import { cn } from "@/libs/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-theme-500/10 border border-theme-500/10 rounded-none",
        className
      )}
      {...props}
    >
      {/* スキャンライン・アニメーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-500/20 to-transparent h-[100%] w-full animate-scanline-skeleton pointer-events-none" />
      
      {/* 背景の微細なノイズ */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(circle, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
             backgroundSize: '4px 4px'
           }} 
      />
    </div>
  );
}

export { Skeleton };
