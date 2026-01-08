import React from "react";
import { SlidersVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useEqualizerStore from "@/hooks/stores/useEqualizerStore";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import EqualizerControl from "../Equalizer/EqualizerControl";

// HEXカラーをRGBに変換するヘルパー関数
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16
    )}`;
  }
  return "124, 58, 237"; // デフォルト値（violet-600）
};

const EqualizerButton: React.FC = () => {
  const isEqualizerEnabled = useEqualizerStore((state) => state.isEnabled);
  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();

  // カラースキームからアクセントカラーを取得
  const accentFrom = hasHydrated ? colorScheme.colors.accentFrom : "#7c3aed";
  const accentFromRgb = hexToRgb(accentFrom);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`cursor-pointer transition-all duration-300 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${
            isEqualizerEnabled ? "" : "text-neutral-400 hover:text-white"
          }`}
          style={
            isEqualizerEnabled
              ? {
                  color: accentFrom,
                  filter: `drop-shadow(0 0 8px rgba(${accentFromRgb}, 0.5))`,
                }
              : undefined
          }
        >
          <SlidersVertical size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="w-auto p-0 border-none bg-transparent"
      >
        <EqualizerControl />
      </PopoverContent>
    </Popover>
  );
};

export default EqualizerButton;
