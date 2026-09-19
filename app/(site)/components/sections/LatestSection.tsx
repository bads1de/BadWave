import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import Link from "next/link";
import { Song } from "@/types";
import LatestBoard from "@/components/Latest/LatestBoard";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";

interface LatestSectionProps {
  songs: Song[];
}

/**
 * 最新リリースセクションコンポーネント
 *
 * @param songs - 曲データ
 */
const LatestSection: React.FC<LatestSectionProps> = ({ songs }) => {
  return (
    <section className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 group/header px-1 sm:px-2">
        <SectionHeader
          title="LATEST_RELEASES"
          subtitle="FRESH_DATA_STREAM_v4.2"
          className="mb-0"
          titleClassName="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-[0.1em] md:tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]"
        />
        <Link
          href={ROUTES.SONGS_ALL}
          className="flex items-center self-start md:self-auto gap-2 text-xs font-mono uppercase tracking-[0.2em] text-theme-500 hover:text-white transition-all duration-300 group border border-theme-500/20 px-4 py-2 bg-theme-500/5 hover:bg-theme-500/20 hover:border-theme-500/50 hover:shadow-[0_0_10px_rgba(var(--theme-500),0.3)] cyber-glitch"
        >
          [ VIEW_ALL ]
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
      <div className="relative">
        {/* 背景装飾 */}
        <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theme-500/20 to-transparent" />
        <LatestBoard songs={songs} />
      </div>
    </section>
  );
};

export default React.memo(LatestSection);
