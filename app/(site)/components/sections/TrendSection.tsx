import React from "react";
import TrendBoard from "@/components/Trend/TrendBoard";
import TrendPeriodSelector from "@/components/Trend/TrendPeriodSelector";

interface TrendSectionProps {
  selectedPeriod: "all" | "month" | "week" | "day";
  onPeriodChange: (period: "all" | "month" | "week" | "day") => void;
}

/**
 * トレンドセクションコンポーネント
 * 
 * @param selectedPeriod - 選択された期間
 * @param onPeriodChange - 期間変更時のコールバック
 */
const TrendSection: React.FC<TrendSectionProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Trending Now
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Most popular songs this {selectedPeriod}
          </p>
        </div>
        <TrendPeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
        />
      </div>
      <TrendBoard
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
      />
    </section>
  );
};

export default React.memo(TrendSection);
