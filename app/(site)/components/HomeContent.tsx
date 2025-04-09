"use client";

import { useState, useEffect, useMemo } from "react";
import { Song, Spotlight, Playlist } from "@/types";
import HomeHeader from "@/components/Header/HomeHeader";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";
import dynamic from "next/dynamic";
import SectionSkeleton from "./sections/SectionSkeleton";

// メモ化されたセクションコンポーネント
import TrendSection from "./sections/TrendSection";
import LatestSection from "./sections/LatestSection";

// 動的インポートによるコード分割
const SpotlightSection = dynamic(() => import("./sections/SpotlightSection"), {
  loading: () => (
    <SectionSkeleton
      title="Spotlight"
      description="Featured artists and songs"
    />
  ),
  ssr: false,
});

const LatestReleasesSection = dynamic(
  () => import("./sections/LatestSection"),
  {
    loading: () => (
      <SectionSkeleton
        title="Latest Releases"
        description="Fresh new music just for you"
      />
    ),
    ssr: false,
  }
);

const ForYouSection = dynamic(() => import("./sections/ForYouSection"), {
  loading: () => (
    <SectionSkeleton
      title="For You"
      description="Personalized recommendations based on your taste"
    />
  ),
  ssr: false,
});

const PlaylistsSection = dynamic(() => import("./sections/PlaylistsSection"), {
  loading: () => (
    <SectionSkeleton
      title="Featured Playlists"
      description="Explore playlists shared by the community"
    />
  ),
  ssr: false,
});

const GenreSection = dynamic(() => import("./sections/GenreSection"), {
  loading: () => (
    <SectionSkeleton
      title="Browse by Genre"
      description="Discover music by genre"
    />
  ),
  ssr: false,
});

interface HomeClientProps {
  songs: Song[];
  spotlightData: Spotlight[];
  playlists: Playlist[];
  recommendations: Song[];
}

const HomeContent: React.FC<HomeClientProps> = ({
  songs,
  spotlightData,
  playlists,
  recommendations,
}) => {
  const { isMobilePlayer } = useMobilePlayer();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "all" | "month" | "week" | "day"
  >("all");

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // メモ化されたコンテンツ - クライアントサイドレンダリング時のみ表示
  const content = useMemo(() => {
    if (!isClient) return null;

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
            {/* トレンドボードセクション - メモ化済み */}
            <TrendSection
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />

            {/* スポットライトセクション - コード分割 */}
            <SpotlightSection spotlightData={spotlightData} />

            {/* 最新曲セクション - コード分割 */}
            <LatestReleasesSection songs={songs} />

            {/* あなたへのおすすめセクション - コード分割 */}
            <ForYouSection recommendations={recommendations} />

            {/* パブリックプレイリストセクション - コード分割 */}
            <PlaylistsSection playlists={playlists} />

            {/* ジャンルボードセクション - コード分割 */}
            <GenreSection />
          </main>
        </div>
      </div>
    );
  }, [
    isClient,
    isMobile,
    isMobilePlayer,
    selectedPeriod,
    spotlightData,
    songs,
    recommendations,
    playlists,
  ]);

  return content;
};

export default HomeContent;
