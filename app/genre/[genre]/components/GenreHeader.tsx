"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { DURATIONS } from "@/constants";

interface GenreHeaderProps {
  genre: string;
}

const GenreHeader: React.FC<GenreHeaderProps> = ({ genre }) => {
  const getGradient = () => {
    // 大文字小文字を区別せずに比較するために小文字に変換
    const genreLower = genre.toLowerCase();

    switch (genreLower) {
      case "retro wave":
        return "bg-gradient-to-br from-[#FF0080] via-[#7928CA] to-[#4A00E0]";
      case "electro house":
        return "bg-gradient-to-r from-[#00F5A0] to-[#00D9F5]";
      case "nu disco":
        return "bg-gradient-to-r from-[#FFD700] via-[#FF6B6B] to-[#FF1493]";
      case "city pop":
        return "bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#EC4899]";
      case "tropical house":
        return "bg-gradient-to-r from-[#00B4DB] to-[#0083B0]";
      case "vapor wave":
        return "bg-gradient-to-br from-[#FF61D2] via-[#FE9090] to-[#FF9C7D]";
      case "r&b":
        return "bg-gradient-to-r from-[#6A0DAD] via-[#9370DB] to-[#D4AF37]";
      case "chill house":
        return "bg-gradient-to-r from-[#43cea2] via-[#185a9d] to-[#6DD5FA]";
      default:
        return "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900";
    }
  };

  const getIcon = () => {
    // 大文字小文字を区別せずに比較するために小文字に変換
    const genreLower = genre.toLowerCase();

    switch (genreLower) {
      case "retro wave":
        return "🌆";
      case "electro house":
        return "⚡";
      case "nu disco":
        return "💿";
      case "city pop":
        return "🏙️";
      case "tropical house":
        return "🌴";
      case "vapor wave":
        return "📼";
      case "r&b":
        return "🎤";
      case "chill house":
        return "🎧";
      default:
        return "🎵";
    }
  };

  const getBackgroundImage = () => {
    // 大文字小文字を区別せずに比較するために小文字に変換
    const genreLower = genre.toLowerCase();

    switch (genreLower) {
      case "retro wave":
        return "/images/Retro.jpg";
      case "electro house":
        return "/images/ElectroHouse.jpg";
      case "nu disco":
        return "/images/NuDisco.jpg";
      case "city pop":
        return "/images/CityPop.jpg";
      case "tropical house":
        return "/images/TropicalHouse.jpg";
      case "vapor wave":
        return "/images/VaporWave.jpg";
      case "r&b":
        return "/images/R&B.jpg";
      case "chill house":
        return "/images/ChillHouse.jpg";
      default:
        return "/images/DefaultMusic.jpg";
    }
  };

  return (
    <div className="relative w-full h-[250px] overflow-hidden border-b border-theme-500/20 font-mono">
      <div className="absolute inset-0">
        <Image
          src={getBackgroundImage()}
          alt={genre}
          fill
          className="object-cover opacity-20 grayscale scale-110"
          sizes="100vw"
        />
      </div>
      
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />

      {/* グラデーションオーバーレイ */}
      <div className={`absolute inset-0 ${getGradient()} opacity-10`} />
      
      {/* コンテンツ */}
      <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-end pb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DURATIONS.NORMAL }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 text-[10px] text-theme-500 tracking-[0.5em] uppercase animate-pulse">
             <span className="w-2 h-2 bg-theme-500 rounded-full" />
             [ GENRE_SECTOR_IDENTIFIED ]
          </div>
          
          <div className="flex items-center gap-x-6">
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] cyber-glitch">{getIcon()}</span>
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)]">
                {genre}
              </h1>
              <div className="h-1 w-32 bg-theme-500/40 shadow-[0_0_10px_rgba(var(--theme-500),0.5)] mt-2" />
            </div>
          </div>
          
          <div className="text-[10px] text-theme-500/40 uppercase tracking-widest mt-4">
             // SECTOR_INDEX: 0x{genre.length.toString(16).toUpperCase()} // SIGNAL_STRENGTH: OPTIMAL
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GenreHeader;
