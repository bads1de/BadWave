import getSongs from "@/actions/getSongs";
import HomeContent from "./components/HomeContent";
import getSpotlight from "@/actions/getSpotlight";

export default async function Home() {
  const songs = await getSongs();
  const spotlightData = await getSpotlight();

  return <HomeContent songs={songs} spotlightData={spotlightData} />;
}
