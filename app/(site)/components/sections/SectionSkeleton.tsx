import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeader from "@/components/common/SectionHeader";

type SectionType =
  | "trend"
  | "spotlight"
  | "latest"
  | "forYou"
  | "playlists"
  | "genre";

interface SectionSkeletonProps {
  title?: string;
  description?: string;
  height?: string;
  type?: SectionType;
}

interface SkeletonSectionProps {
  title: string;
  description: string;
}

/**
 * セクションのスケルトンローディングコンポーネント
 *
 * @param title - セクションタイトル
 * @param description - セクション説明
 * @param height - スケルトンの高さ（typeが指定されていない場合のみ使用）
 * @param type - セクションタイプ（指定するとそのセクション専用のスケルトンが表示される）
 */

// トレンドセクション用スケルトン
const TrendSectionSkeleton: React.FC<SkeletonSectionProps> = ({ title, description }) => (
  <section className="relative">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <SectionHeader title={title} subtitle={description} className="animate-pulse" />
      <div
        data-testid="trend-period-selector-skeleton"
        className="flex space-x-2 bg-theme-900/20 p-1 border border-theme-500/20"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 bg-theme-500/10 border border-theme-500/10 rounded-none" />
        ))}
      </div>
    </div>
    <div className="flex space-x-4 overflow-hidden p-6 bg-[#0a0a0f]/40 border border-theme-500/10 rounded-2xl relative">
      {/* HUD装飾コーナー */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-theme-500/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-theme-500/20" />
      
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          data-testid="trend-card-skeleton"
          className="min-w-[320px] bg-theme-900/20 border border-theme-500/10"
        >
          <Skeleton className="w-full h-64 rounded-none bg-theme-500/5" />
          <div className="p-4 space-y-3 font-mono">
            <Skeleton className="h-6 w-3/4 bg-theme-500/10" />
            <Skeleton className="h-4 w-1/2 bg-theme-500/5" />
            <div className="pt-3 border-t border-theme-500/10 flex justify-between">
               <Skeleton className="h-3 w-1/4 bg-theme-500/5" />
               <Skeleton className="h-2 w-2 rounded-full bg-theme-500/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// スポットライトセクション用スケルトン
const SpotlightSectionSkeleton: React.FC<SkeletonSectionProps> = ({ title, description }) => (
  <section>
    <SectionHeader title={title} subtitle={description} className="animate-pulse" />
    <div className="flex space-x-4 overflow-hidden p-6 bg-[#0a0a0f]/40 border border-theme-500/10 rounded-xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          data-testid="spotlight-card-skeleton"
          className="flex-none w-40 relative aspect-[9/16]"
        >
          <Skeleton className="w-full h-full rounded-none bg-theme-500/10 border border-theme-500/20 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.1)]" />
        </div>
      ))}
    </div>
  </section>
);

// 曲カードスケルトン（Latest, ForYou共通）
const SongCardsSkeleton: React.FC<SkeletonSectionProps> = ({ title, description }) => (
  <section>
    <SectionHeader title={title} subtitle={description} className="animate-pulse" />
    <div className="flex space-x-4 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          data-testid="song-card-skeleton"
          className="min-w-[200px] w-[200px] bg-[#0a0a0f]/40 border border-theme-500/10 rounded-xl p-3"
        >
          <Skeleton className="aspect-square w-full rounded-lg bg-theme-500/5 border border-theme-500/10" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-5 w-full bg-theme-500/10" />
            <Skeleton className="h-3 w-2/3 bg-theme-500/5" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

// プレイリストセクション用スケルトン
const PlaylistsSectionSkeleton: React.FC<SkeletonSectionProps> = ({ title, description }) => (
  <section>
    <SectionHeader title={title} subtitle={description} className="animate-pulse" />
    <div className="flex space-x-4 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          data-testid="playlist-card-skeleton"
          className="min-w-[200px] max-w-[200px] bg-[#0a0a0f]/40 border border-theme-500/10 rounded-xl p-4"
        >
          <Skeleton className="aspect-square w-full rounded-lg bg-theme-500/5" />
          <div className="mt-4 space-y-2 font-mono">
            <Skeleton className="h-4 w-full bg-theme-500/10" />
            <Skeleton className="h-2 w-1/2 bg-theme-500/5" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ジャンルセクション用スケルトン
const GenreSectionSkeleton: React.FC<SkeletonSectionProps> = ({ title, description }) => (
  <section>
    <SectionHeader title={title} subtitle={description} className="animate-pulse" />
    <div className="flex space-x-4 overflow-hidden p-8 bg-[#0a0a0f]/60 border-y border-theme-500/10">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          data-testid="genre-card-skeleton"
          className="min-w-[150px] h-32"
        >
          <Skeleton className="w-full h-full rounded-none bg-theme-500/5 border border-theme-500/20 shadow-[0_0_10px_rgba(var(--theme-500),0.1)]" />
        </div>
      ))}
    </div>
  </section>
);

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title = "LOADING...",
  description = "INITIALIZING_STREAM",
  height = "h-64",
  type,
}) => {
  const headerProps = { title, description };

  // タイプに応じたスケルトンを返す
  if (type === "trend") return <TrendSectionSkeleton {...headerProps} />;
  if (type === "spotlight") return <SpotlightSectionSkeleton {...headerProps} />;
  if (type === "latest" || type === "forYou") return <SongCardsSkeleton {...headerProps} />;
  if (type === "playlists") return <PlaylistsSectionSkeleton {...headerProps} />;
  if (type === "genre") return <GenreSectionSkeleton {...headerProps} />;

  // タイプが指定されていない場合は汎用的なスケルトンを返す
  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={description}
        className="animate-pulse"
      />
      <Skeleton className={`w-full ${height}`} />
    </section>
  );
};

export default SectionSkeleton;
