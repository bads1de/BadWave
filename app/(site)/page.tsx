import getSongs from "@/actions/getSongs";
import HomeContent from "./components/HomeContent";
import getSpotlight from "@/actions/getSpotlight";
import getPublicPlaylists from "@/actions/getPublicPlaylists";

export default async function Home() {
  const songs = await getSongs();
  const spotlightData = await getSpotlight();
  const playlists = await getPublicPlaylists();

  return (
    <HomeContent
      songs={songs}
      spotlightData={spotlightData}
      playlists={playlists}
    />
  );
}
