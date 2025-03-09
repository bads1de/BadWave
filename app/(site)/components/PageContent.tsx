"use client";

import SongItem from "@/components/Song/SongItem";
import useOnPlay from "@/hooks/player/useOnPlay";
import { Song } from "@/types";
import usePlayer from "@/hooks/player/usePlayer";

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const player = usePlayer();
  const onPlay = useOnPlay(songs);

  if (!songs) {
    return (
      <div className="mt-4 text-neutral-400">
        <h1>Loading...</h1>
      </div>
    );
  }

  const handlePlay = (id: string) => {
    onPlay(id);
    player.setId(id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {songs.map((item) => (
          <SongItem
            onClick={(id) => handlePlay(id)}
            key={item.id}
            data={item}
          />
        ))}
      </div>
    </div>
  );
};

export default PageContent;
