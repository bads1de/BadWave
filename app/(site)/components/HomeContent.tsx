"use client";

import { useState, useEffect } from "react";
import PageContent from "./PageContent";
import TrendBoard from "@/components/TrendBoard";
import { Song, Spotlight } from "@/types";
import GenreBoard from "@/components/Genre/GenreBoard";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import dynamic from "next/dynamic";
// import { videoIds } from "@/constants";
import SpotlightBoard from "@/components/SpotlightBoard";
import HomeHeader from "@/components/HomeHeader";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";
// import ScrollableContainer from "@/components/ScrollableContainer";
import { cn } from "@/libs/utils";

// const YouTubePlayer = dynamic(() => import("@/components/YouTubePlayer"), {
//   ssr: false,
// });

const TREND_PERIODS = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "day" },
] as const;

interface HomeClientProps {
  songs: Song[];
  spotlightData: Spotlight[];
}

const HomeContent: React.FC<HomeClientProps> = ({ songs, spotlightData }) => {
  const { isMobilePlayer } = useMobilePlayer();
  // const [showVideoArrows, setShowVideoArrows] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
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

  // const changeVideo = (direction: "prev" | "next") => {
  //   setCurrentVideoIndex((prevIndex) => {
  //     if (direction === "prev") {
  //       return prevIndex > 0 ? prevIndex - 1 : videoIds.length - 1;
  //     } else {
  //       return prevIndex < videoIds.length - 1 ? prevIndex + 1 : 0;
  //     }
  //   });
  // };

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

              <div className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900/40 backdrop-blur-xl border border-white/[0.02] p-1">
                {TREND_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() =>
                      setSelectedPeriod(
                        period.value as "all" | "month" | "week" | "day"
                      )
                    }
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2",
                      "disabled:pointer-events-none disabled:opacity-50",
                      selectedPeriod === period.value
                        ? "bg-gradient-to-br rounded-xl from-purple-500/20 to-purple-900/20 border border-purple-500/30 text-white shadow-lg shadow-purple-500/20"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <TrendBoard
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </section>

          {/* ユーチューブプレイヤーセクション */}
          {/* <section>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Featured Videos
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Watch the latest music videos
            </p>
            <div
              onMouseEnter={() => setShowVideoArrows(true)}
              onMouseLeave={() => setShowVideoArrows(false)}
            >
              {isMobile ? (
                <div className="w-full">
                  <YouTubePlayer
                    name={videoIds[currentVideoIndex].name}
                    videoId={videoIds[currentVideoIndex].videoId}
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => changeVideo("prev")}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => changeVideo("next")}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <ScrollableContainer showArrows={showVideoArrows}>
                  {videoIds.map((video) => (
                    <div key={video.id} className="w-1/3 shrink-0">
                      <YouTubePlayer
                        name={video.name}
                        videoId={video.videoId}
                      />
                    </div>
                  ))}
                </ScrollableContainer>
              )}
            </div>
          </section> */}

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
