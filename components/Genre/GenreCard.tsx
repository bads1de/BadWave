import Link from "next/link";
import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface GenreCardProps {
  genre: string;
  color: string;
}

const GenreCard: React.FC<GenreCardProps> = memo(({ genre }) => {
  // ジャンルに基づいて背景グラデーションを設定 - メモ化
  const gradient = useMemo(() => {
    switch (genre) {
      case "Retro Wave":
        return "bg-gradient-to-br from-[#FF0080] via-[#7928CA] to-[#4A00E0]"; // レトロな紫とピンク
      case "Electro House":
        return "bg-gradient-to-r from-[#00F5A0] to-[#00D9F5]"; // エレクトロニックな青緑
      case "Nu Disco":
        return "bg-gradient-to-r from-[#FFD700] via-[#FF6B6B] to-[#FF1493]"; // ディスコ調の金とピンク
      case "City Pop":
        return "bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#EC4899]"; // 都会的な紫とピンク
      case "Tropical House":
        return "bg-gradient-to-r from-[#00B4DB] to-[#0083B0]"; // トロピカルな青
      case "Vapor Wave":
        return "bg-gradient-to-br from-[#FF61D2] via-[#FE9090] to-[#FF9C7D]"; // ヴェイパーウェイブ調のピンクとオレンジ
      case "r&b":
        return "bg-gradient-to-r from-[#6A0DAD] via-[#9370DB] to-[#D4AF37]"; // R&B調の深い紫と金
      case "Chill House":
        return "bg-gradient-to-r from-[#43cea2] via-[#185a9d] to-[#6DD5FA]"; // リラックスした青緑と水色
      default:
        return "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"; // デフォルトのダークグラデーション
    }
  }, [genre]);

  // ジャンルに基づいてアイコンを設定 - メモ化
  const icon = useMemo(() => {
    switch (genre) {
      case "Retro Wave":
        return "🌆";
      case "Electro House":
        return "⚡";
      case "Nu Disco":
        return "💿";
      case "City Pop":
        return "🏙️";
      case "Tropical House":
        return "🌴";
      case "Vapor Wave":
        return "📼";
      case "r&b":
        return "🎤";
      case "Chill House":
        return "🎧";
      default:
        return "🎵";
    }
  }, [genre]);

  // 背景画像のパスを取得する関数を追加 - メモ化
  const backgroundImage = useMemo(() => {
    switch (genre) {
      case "Retro Wave":
        return "/images/Retro.jpg";
      case "Electro House":
        return "/images/ElectroHouse.jpg";
      case "Nu Disco":
        return "/images/NuDisco.jpg";
      case "City Pop":
        return "/images/CityPop.jpg";
      case "Tropical House":
        return "/images/TropicalHouse.jpg";
      case "Vapor Wave":
        return "/images/VaporWave.jpg";
      case "r&b":
        return "/images/R&B.jpg";
      case "Chill House":
        return "/images/ChillHouse.jpg";
      default:
        return "/images/DefaultMusic.jpg";
    }
  }, [genre]);

  return (
    <Link href={`/genre/${genre}`}>
      <motion.div
        whileHover={{
          scale: 1.02,
        }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer group font-mono"
      >
        <div
          className={`relative w-80 h-48 rounded-none overflow-hidden border border-white/10 group-hover:border-theme-500/60 transition-all duration-500 bg-[#0a0a0f] shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(var(--theme-500),0.2)] cyber-glitch`}
        >
          {/* 背景画像 */}
          {backgroundImage && (
            <div className="absolute inset-0">
              <Image
                src={backgroundImage}
                alt={genre}
                fill
                className="object-cover opacity-20 grayscale group-hover:opacity-40 group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                sizes="320px"
              />
            </div>
          )}

          {/* スキャンライン / グリッド */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
               }} 
          />

          {/* HUDコーナー */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-theme-500 transition-colors" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20 group-hover:border-theme-500 transition-colors" />

          {/* コンテンツコンテナ */}
          <div className="relative h-full p-6 flex flex-col justify-between z-10">
            <div>
              <p className="text-[8px] text-theme-500 tracking-[0.4em] uppercase mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                [ SECTOR_IDENTIFIED ]
              </p>
              <div className="flex items-center space-x-3">
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-500">{icon}</span>
                <h2 className="text-white text-xl font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:text-theme-300 transition-colors">
                  {genre}
                </h2>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="h-px w-24 bg-gradient-to-r from-theme-500 to-transparent" />
              <div className="text-[10px] text-theme-500/40 uppercase tracking-tighter group-hover:text-theme-500 transition-colors">
                 ACCESS_INDEX: 0x{genre.length.toString(16).toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* オーバーレイ */}
          <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none`} />
        </div>
      </motion.div>
    </Link>
  );
});

// 表示名を設定
GenreCard.displayName = "GenreCard";

export default GenreCard;
