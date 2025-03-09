"use client";

import { useState } from "react";
import GenreCard from "./GenreCard";
import ScrollableContainer from "@/components/ScrollableContainer";

export interface GenreData {
  id: number;
  name: string;
  color: string;
}

interface GenreBoardProps {
  className?: string;
}

const genreData: GenreData[] = [
  { id: 1, name: "Retro Wave", color: "bg-purple-500" },
  { id: 2, name: "Electro House", color: "bg-blue-500" },
  { id: 3, name: "Nu Disco", color: "bg-red-500" },
  { id: 4, name: "City Pop", color: "bg-green-500" },
  { id: 5, name: "Tropical House", color: "bg-yellow-500" },
  { id: 6, name: "Vapor Wave", color: "bg-indigo-500" },
  { id: 7, name: "Trance", color: "bg-pink-500" },
  { id: 8, name: "Drum and Bass", color: "bg-orange-500" },
];

const GenreBoard: React.FC<GenreBoardProps> = ({ className = "" }) => {
  const [showArrows, setShowArrows] = useState(false);

  return (
    <div
      className={`${className}`}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <ScrollableContainer showArrows={showArrows}>
        {genreData.map((genre) => (
          <GenreCard key={genre.id} genre={genre.name} color={genre.color} />
        ))}
      </ScrollableContainer>
    </div>
  );
};

export default GenreBoard;
