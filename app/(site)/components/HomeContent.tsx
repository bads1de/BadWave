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
    <div className="flex bg-[#0d0d0d] h-full overflow-hidden">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        {isMobile && !isMobilePlayer && (
          <section>
            <HomeHeader />
          </section>
        )}
        <main
          className={`px-6 py-8 pb-[70px] md:pb-8 space-y-8 ${
            isMobile && !isMobilePlayer ? "pt-24" : ""
          }`}
        >
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
