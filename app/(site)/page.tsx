import getSongs from "@/actions/getSongs";
import HomeContent from "./components/HomeContent";
import getSpotlight from "@/actions/getSpotlight";
import getPublicPlaylists from "@/actions/getPublicPlaylists";
import getRecommendations from "@/actions/getRecommendations";

export default async function Home() {
  const [songs, spotlightData, playlists, recommendations] = await Promise.all([
    getSongs(),
    getSpotlight(),
    getPublicPlaylists(),
    getRecommendations(),
  ]);

  return (
    <HomeContent
      songs={songs}
      spotlightData={spotlightData}
      playlists={playlists}
      recommendations={recommendations}
    />
  );
}
