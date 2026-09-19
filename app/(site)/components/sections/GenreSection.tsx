import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import GenreBoard from "@/components/Genre/GenreBoard";

/**
 * ジャンルセクションコンポーネント
 */
const GenreSection: React.FC = () => {
  return (
    <section className="relative">
      <SectionHeader
        title="GENRE_EXPLORER"
        subtitle="DATABASE_INDEX_READY"
      />
      <div className="relative p-8 bg-[#0a0a0f]/60 border-y border-theme-500/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
         {/* スキャンライン的な横線 */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-500/30 to-transparent pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-500/30 to-transparent pointer-events-none" />
         
         <GenreBoard />
      </div>
    </section>
  );
};

export default React.memo(GenreSection);
