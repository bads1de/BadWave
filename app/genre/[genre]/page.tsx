import React from "react";
import getSongsByGenre from "@/actions/getSongsByGenre";
import GenreContent from "./components/GenreContent";
import GenreHeader from "./components/GenreHeader";

interface genreProps {
  params: Promise<{
    genre: string;
  }>;
}

const page = async (props: genreProps) => {
  const params = await props.params;
  const { genre } = params;
  const decodedGenre = decodeURIComponent(genre);
  const songs = await getSongsByGenre(decodedGenre);

  return (
    <div className="bg-[#0a0a0f] h-full w-full overflow-hidden overflow-y-auto custom-scrollbar font-mono">
      <GenreHeader genre={decodedGenre} />
      <div className="max-w-7xl mx-auto py-10">
        <GenreContent songs={songs} />
      </div>
    </div>
  );
};

export default page;
