import React from "react";
import getSongsByGenre from "@/actions/getSongsByGenre";
import GenreContent from "./components/GenreContent";
import Header from "@/components/Header";

interface Props {
  params: Promise<{
    genre: string;
  }>;
}

const page = async (props: Props) => {
  const params = await props.params;

  const {
    genre
  } = params;

  const decodedGenre = decodeURIComponent(genre);
  const songs = await getSongsByGenre(decodedGenre);
  return (
    <div className="bg-[#0d0d0d] rounded-lg w-full h-full overflow-hidden overflow-y-auto custom-scrollbar">
      <Header>
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">{decodedGenre}</h1>
        </div>
      </Header>
      <GenreContent songs={songs} />
    </div>
  );
};

export default page;
