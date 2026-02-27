"use client";

import { cn } from "@/libs/utils";
import { motion } from "framer-motion";

const TREND_PERIODS = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "day" },
] as const;

type TrendPeriod = (typeof TREND_PERIODS)[number]["value"];

interface TrendPeriodSelectorProps {
  selectedPeriod: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

const TrendPeriodSelector: React.FC<TrendPeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <div className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-theme-500/30 p-1.5 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)] relative overflow-hidden group">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-r from-theme-500/5 via-transparent to-theme-500/5 opacity-50 pointer-events-none" />
      
      {TREND_PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={cn(
            "relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-500",
            "focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
            selectedPeriod === period.value
              ? "text-white bg-theme-500/20 border border-theme-500/40 rounded-lg shadow-[0_0_15px_rgba(var(--theme-500),0.3)] cyber-glitch"
              : "text-theme-500/60 hover:text-theme-300 hover:bg-theme-500/5 rounded-lg"
          )}
        >
          {selectedPeriod === period.value && (
             <motion.div 
               layoutId="active-period"
               className="absolute inset-0 border-t-2 border-theme-500/50 rounded-lg pointer-events-none"
             />
          )}
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default TrendPeriodSelector;
