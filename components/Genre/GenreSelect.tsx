"use client";

import { genres } from "@/constants";
import * as RadixSelect from "@radix-ui/react-select";
import { BsChevronDown } from "react-icons/bs";
import { twMerge } from "tailwind-merge";

interface GenreSelectProps {
  disabled?: boolean;
  onGenreChange: (genres: string) => void;
  value?: string;
}

const GenreSelect: React.FC<GenreSelectProps> = ({
  disabled,
  onGenreChange,
  value,
}) => {
  return (
    <RadixSelect.Root
      defaultValue={value}
      onValueChange={onGenreChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={twMerge(
          "flex items-center justify-between w-full rounded-none px-4 py-3 font-mono",
          "bg-[#0a0a0f] border border-theme-500/20",
          "hover:border-theme-500/50 focus:border-theme-500",
          "transition-all duration-500 group relative shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]",
          "text-xs font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cyber-glitch"
        )}
      >
        <RadixSelect.Value
          placeholder="[ SELECT_SECTOR ]"
          className="text-theme-500 group-hover:text-theme-300"
        />
        <RadixSelect.Icon>
          <BsChevronDown
            size={14}
            className="text-theme-500 group-hover:text-white transition-transform duration-500 group-data-[state=open]:rotate-180"
          />
        </RadixSelect.Icon>
        
        {/* 角の装飾 */}
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-theme-500/40 group-hover:border-theme-500 transition-colors" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-theme-500/40 group-hover:border-theme-500 transition-colors" />
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className="overflow-hidden bg-[#0a0a0f]/95 backdrop-blur-xl rounded-none border border-theme-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_15px_rgba(var(--theme-500),0.1)] z-[9999] animate-in fade-in zoom-in-95 duration-200">
          {/* スキャンライン */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
          
          <RadixSelect.Viewport className="p-1.5 relative z-10">
            <div className="w-full max-h-[300px] overflow-x-auto custom-scrollbar font-mono">
              <div className="px-3 py-2 text-[8px] text-theme-500/40 border-b border-theme-500/10 mb-1 tracking-widest uppercase">
                 // SECTOR_INDEX_AVAILABLE
              </div>
              {genres.map((genre) => (
                <RadixSelect.Item
                  key={genre.id}
                  value={genre.id}
                  className={twMerge(
                    "relative flex items-center px-8 py-2 rounded-none text-[10px] uppercase tracking-widest",
                    "text-theme-500 hover:text-white",
                    "focus:bg-theme-500/20 focus:text-white focus:outline-none",
                    "cursor-pointer transition-all duration-300 cyber-glitch"
                  )}
                >
                  <RadixSelect.ItemText>
                    {genre.name}
                  </RadixSelect.ItemText>
                  <div className="absolute left-3 w-1 h-1 bg-theme-500/40 rounded-full opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                </RadixSelect.Item>
              ))}
            </div>
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default GenreSelect;
