"use client";

import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/libs/utils";

interface EqSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  /** カラースキームのアクセントカラー（From） */
  accentFrom?: string;
  /** カラースキームのアクセントカラー（To） */
  accentTo?: string;
}

/**
 * 縦型イコライザースライダー
 * -12dB ~ +12dB の範囲でゲイン調整
 */
const EqSlider: React.FC<EqSliderProps> = ({
  value,
  onChange,
  label,
  min = -12,
  max = 12,
  step = 1,
  className,
  accentFrom = "#7c3aed",
  accentTo = "#ec4899",
}) => {
  // HEXカラーをRGBに変換するヘルパー関数
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(
        result[2],
        16
      )}, ${parseInt(result[3], 16)}`;
    }
    return "124, 58, 237"; // デフォルト値（violet-600）
  };

  const accentFromRgb = hexToRgb(accentFrom);
  const accentToRgb = hexToRgb(accentTo);

  return (
    <div
      className={cn("flex flex-col items-center gap-2 select-none", className)}
    >
      {/* ゲイン値表示 */}
      <span className="text-xs font-mono text-neutral-400 w-8 text-center">
        {value > 0 ? `+${value}` : value}
      </span>

      {/* 縦型スライダー */}
      <SliderPrimitive.Root
        className="relative flex flex-col items-center w-6 h-24 touch-none"
        orientation="vertical"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
      >
        <SliderPrimitive.Track className="relative w-1.5 h-full rounded-full bg-neutral-700 overflow-hidden">
          <SliderPrimitive.Range
            className="absolute w-full rounded-full"
            style={{
              // 0dBの位置を中央に、そこからゲインに応じて伸縮
              bottom:
                value >= 0 ? "50%" : `${50 - (Math.abs(value) / 12) * 50}%`,
              top: value >= 0 ? `${50 - (value / 12) * 50}%` : "50%",
              background: `linear-gradient(to top, ${accentFrom}80, ${accentTo})`,
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block w-4 h-4 rounded-full",
            "bg-white shadow-lg",
            "transition-all duration-150",
            "hover:scale-110",
            "focus:outline-none focus:ring-offset-2 focus:ring-offset-[#121212]"
          )}
          style={{
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: accentFrom,
            boxShadow: `0 0 0 0 rgba(${accentFromRgb}, 0)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 10px rgba(${accentFromRgb}, 0.5)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 0 rgba(${accentFromRgb}, 0)`;
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(${accentToRgb}, 0.5)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 0 rgba(${accentFromRgb}, 0)`;
          }}
        />
      </SliderPrimitive.Root>

      {/* 周波数ラベル */}
      <span className="text-xs text-neutral-400 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export default EqSlider;
