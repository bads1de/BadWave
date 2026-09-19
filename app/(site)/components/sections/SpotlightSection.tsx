import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import { Spotlight } from "@/types";
import SpotlightBoard from "@/components/SpotlightBoard";

interface SpotlightSectionProps {
  spotlightData: Spotlight[];
}

/**
 * スポットライトセクションコンポーネント
 * 
 * @param spotlightData - スポットライトデータ
 */
const SpotlightSection: React.FC<SpotlightSectionProps> = ({ 
  spotlightData 
}) => {
  return (
    <section className="relative">
      <SectionHeader
        title="SPOTLIGHT_SCAN"
        subtitle="PRIORITY_ASSET_HIGHLIGHT_v2.0"
      />
      <div className="relative p-6 bg-[#0a0a0f]/60 border border-theme-500/10 rounded-xl overflow-hidden group">
         {/* 装飾用HUDライン */}
         <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-theme-500/10 group-hover:border-theme-500/30 transition-colors pointer-events-none" />
         
         <SpotlightBoard spotlightData={spotlightData} />
      </div>
    </section>
  );
};

export default React.memo(SpotlightSection);
