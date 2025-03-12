"use client";

import { useState, useEffect } from "react";
import { Song, Spotlight, Playlist } from "@/types";
import PageContent from "./PageContent";
import HomeHeader from "@/components/HomeHeader";
import TrendBoard from "@/components/TrendBoard";
import TrendPeriodSelector from "@/components/TrendPeriodSelector";
import GenreBoard from "@/components/Genre/GenreBoard";
import SpotlightBoard from "@/components/SpotlightBoard";
import PublicPlaylistBoard from "@/components/Playlist/PublicPlaylistBoard";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";

interface HomeClientProps {
  songs: Song[];
  spotlightData: Spotlight[];
  playlists: Playlist[];
}

const HomeContent: React.FC<HomeClientProps> = ({
  songs,
  spotlightData,
  playlists,
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

  if (!isClient) {
    return null;
  }

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
                onPeriodChange={setSelectedPeriod}
              />
            </div>
            <TrendBoard
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </section>

          {/* パブリックプレイリストセクション */}
          <section>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Featured Playlists
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Explore playlists shared by the community
            </p>
            <PublicPlaylistBoard playlists={playlists} />
          </section>

          {/* スポットライトセクション */}
          <section>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Spotlight
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Featured artists and songs
            </p>
            <SpotlightBoard spotlightData={spotlightData} />
          </section>

          {/* ジャンルボードセクション */}
          <section>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Browse by Genre
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Discover music by genre
            </p>
            <GenreBoard />
          </section>

          {/* 最新曲セクション */}
          <section>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Latest Releases
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Fresh new music just for you
            </p>
            <PageContent songs={songs} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomeContent;
