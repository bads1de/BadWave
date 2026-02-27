"use client";

import { useState, useEffect } from "react";
import { Song, Spotlight, Playlist } from "@/types";
import HomeHeader from "@/components/Header/HomeHeader";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";

import TrendSection from "./sections/TrendSection";
import SpotlightSection from "./sections/SpotlightSection";
import LatestReleasesSection from "./sections/LatestSection";
import ForYouSection from "./sections/ForYouSection";
import PlaylistsSection from "./sections/PlaylistsSection";
import GenreSection from "./sections/GenreSection";

interface HomeClientProps {
  songs: Song[];
  spotlightData: Spotlight[];
  playlists: Playlist[];
  recommendations: Song[];
  trendSongs: Song[];
}

const HomeContent: React.FC<HomeClientProps> = ({
  songs,
  spotlightData,
  playlists,
  recommendations,
  trendSongs,
}) => {
  const { isMobilePlayer } = useMobilePlayer();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "all" | "month" | "week" | "day"
  >("all");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex bg-[#0a0a0f] h-full overflow-hidden font-mono">
      <div className="w-full h-full overflow-y-auto custom-scrollbar relative">
        {/* 背景装飾 */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
               backgroundSize: '100px 100px'
             }} 
        />
        
        {isMobile && !isMobilePlayer && (
          <section className="relative z-10">
            <HomeHeader />
          </section>
        )}
        <main
          className={`relative z-10 px-8 py-10 pb-[100px] md:pb-12 space-y-16 max-w-[1600px] mx-auto ${
            isMobile && !isMobilePlayer ? "pt-24" : ""
          }`}
        >
          {/* システムステータスバー的な装飾 */}
          <div className="flex items-center justify-between text-[10px] text-theme-500/40 tracking-[0.5em] uppercase border-b border-theme-500/10 pb-2 mb-8">
            <span>[ SYSTEM_READY ]</span>
            <div className="flex gap-4">
              <span className="animate-pulse">STREAM_LOG: ONLINE</span>
              <span>v.2.0.4-BETA</span>
            </div>
          </div>
          {/* トレンドボードセクション */}
          <TrendSection
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            initialSongs={trendSongs}
          />

          {/* スポットライトセクション */}
          <SpotlightSection spotlightData={spotlightData} />

          {/* 最新曲セクション */}
          <LatestReleasesSection songs={songs} />

          {/* あなたへのおすすめセクション */}
          <ForYouSection recommendations={recommendations} />

          {/* パブリックプレイリストセクション */}
          <PlaylistsSection playlists={playlists} />

          {/* ジャンルボードセクション */}
          <GenreSection />
        </main>
      </div>
    </div>
  );
};

export default HomeContent;
