"use client";

import { forwardRef, memo } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// forwardRef でラップされたコンポーネントを定義
const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {/* 背景のグロー効果 */}
        <div className="absolute inset-0 bg-theme-500/5 opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-md -z-10" />
        
        <input
          type={type}
          className={twMerge(
            `
          w-full
          rounded-none
          bg-[#0a0a0f]/80
          border
          border-theme-500/20
          px-4
          py-3
          text-sm
          font-mono
          text-theme-300
          placeholder:text-theme-900
          disabled:cursor-not-allowed
          disabled:opacity-50
          focus:outline-none
          group-hover:border-theme-500/40
          focus:border-theme-500/60
          transition-all
          duration-300
          shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]
          focus:shadow-[0_0_15px_rgba(var(--theme-500),0.1),inset_0_0_15px_rgba(var(--theme-500),0.05)]
          `,
            className
          )}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/0 group-focus-within:border-theme-500/60 transition-colors pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/0 group-focus-within:border-theme-500/60 transition-colors pointer-events-none" />
      </div>
    );
  }
);

// displayName を設定
InputComponent.displayName = "Input";

// memo でラップしてエクスポート
const Input = memo(InputComponent);

export default Input;
