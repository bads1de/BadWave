import getPlaylistSongs from "@/actions/getPlaylistSongs";
import PlaylistPageContent from "./components/PlaylistPageContent";
import getPlaylistsImage from "@/actions/getPlaylistsImage";
import { Song } from "@/types";

type CombinedSong = Song & { songType: "regular" };

const PlaylistPage = async (
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    id: playlistId
  } = params;

  const playlistTitle = searchParams.title as string;
  const imageUrl = await getPlaylistsImage(playlistId);
  const songs = await getPlaylistSongs(playlistId);

  return (
    <PlaylistPageContent
      playlistId={playlistId}
      playlistTitle={playlistTitle}
      songs={songs as CombinedSong[]}
      imageUrl={imageUrl}
    />
  );
};

export default PlaylistPage;
