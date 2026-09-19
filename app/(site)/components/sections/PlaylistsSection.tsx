import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import { Playlist } from "@/types";
import PublicPlaylistBoard from "@/components/Playlist/PublicPlaylistBoard";

interface PlaylistsSectionProps {
  playlists: Playlist[];
}

/**
 * プレイリストセクションコンポーネント
 * 
 * @param playlists - プレイリストデータ
 */
const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({ 
  playlists 
}) => {
  return (
    <section className="relative">
      <SectionHeader
        title="FEATURED_PLAYLISTS"
        subtitle="COMMUNITY_DATA_SYNC_SUCCESS"
      />
      <div className="relative">
        <PublicPlaylistBoard playlists={playlists} />
        {/* HUD装飾背景 */}
        <div className="absolute top-0 right-0 w-32 h-px bg-gradient-to-l from-theme-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-theme-500/30 to-transparent" />
      </div>
    </section>
  );
};

export default React.memo(PlaylistsSection);
