"use client";

import { Song } from "@/types";
import SongListContent, {
  SongListEmptyState,
} from "@/components/Song/SongListContent";
import { memo } from "react";

interface LikedContentProps {
  songs: Song[];
  playlistId?: string;
  playlistUserId?: string;
}

const LikedContent: React.FC<LikedContentProps> = memo(
  ({ songs, playlistId, playlistUserId }) => (
    <SongListContent
      songs={songs}
      playlistId={playlistId}
      playlistUserId={playlistUserId}
      reverse={!!playlistId}
      showOptions
      emptyState={
        <SongListEmptyState message="[ ! ] NO_SONGS_DETECTED_IN_DATABASE" />
      }
    />
  )
);

// displayName を設定
LikedContent.displayName = "LikedContent";

export default LikedContent;
