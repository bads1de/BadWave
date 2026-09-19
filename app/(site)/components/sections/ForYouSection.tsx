import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import { Song } from "@/types";
import ForYouBoard from "@/components/ForYou/ForYouBoard";

interface ForYouSectionProps {
  recommendations: Song[];
}

/**
 * あなたへのおすすめセクションコンポーネント
 * 
 * @param recommendations - おすすめ曲データ
 */
const ForYouSection: React.FC<ForYouSectionProps> = ({ 
  recommendations 
}) => {
  return (
    <section className="relative">
      <SectionHeader
        title="FOR_YOU_OPERATOR"
        subtitle="ALGORITHM_RECOMMENDATIONS_READY"
      />
      <div className="relative p-6 bg-[#0a0a0f]/40 border border-theme-500/10 rounded-xl shadow-[inset_0_0_20px_rgba(var(--theme-500),0.05)]">
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/20 pointer-events-none rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-theme-500/20 pointer-events-none rounded-bl-xl" />
        
        <ForYouBoard recommendations={recommendations} />
      </div>
    </section>
  );
};

export default React.memo(ForYouSection);
