import React from "react";

interface SectionSkeletonProps {
  title?: string;
  description?: string;
  height?: string;
}

/**
 * セクションのスケルトンローディングコンポーネント
 * 
 * @param title - セクションタイトル
 * @param description - セクション説明
 * @param height - スケルトンの高さ
 */
const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ 
  title = "Loading...", 
  description = "Please wait", 
  height = "h-64" 
}) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
        {title}
      </h2>
      <p className="text-sm text-neutral-400 mb-6">
        {description}
      </p>
      <div className={`w-full ${height} bg-neutral-900 animate-pulse rounded-lg`} />
    </section>
  );
};

export default SectionSkeleton;
