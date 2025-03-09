import React from "react";
import SongContent from "./components/SongContent";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const SongPage = async (props: Props) => {
  const params = await props.params;

  const {
    id: songId
  } = params;

  return (
    <div className="bg-[#0d0d0d] rounded-lg w-full h-full overflow-hidden overflow-y-auto custom-scrollbar">
      <SongContent songId={songId} />
    </div>
  );
};

export default SongPage;
