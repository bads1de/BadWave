import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronDown } from "react-icons/bs";
import SyncedLyrics from "../Lyrics/SyncedLyrics";

interface LyricsDrawerProps {
  showLyrics: boolean;
  toggleLyrics: () => void;
  lyrics: string;
}

const LyricsDrawer: React.FC<LyricsDrawerProps> = ({
  showLyrics,
  toggleLyrics,
  lyrics,
}) => {
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const drawerHeight = screenHeight * 0.75;

  return (
    <AnimatePresence>
      {showLyrics && (
        <motion.div
          key="lyrics-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleLyrics}
          className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md z-[60]"
        />
      )}
      {showLyrics && (
        <motion.div
          key="lyrics-drawer"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              toggleLyrics();
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-[70] font-mono"
          style={{
            height: `${drawerHeight}px`,
            touchAction: "none",
          }}
        >
          <div className="w-full h-full bg-[#0a0a0f] border-t-2 border-theme-500/40 shadow-[0_-15px_50px_rgba(0,0,0,0.9),0_-5px_20px_rgba(var(--theme-500),0.15)] overflow-hidden relative flex flex-col">
            {/* スキャンライン / グリッド装飾 */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />

            {/* HUDコーナー */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-theme-500/40 pointer-events-none z-20" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-theme-500/40 pointer-events-none z-20" />

            {/* ハンドルエリア */}
            <div className="relative h-14 flex items-center justify-center border-b border-theme-500/10 shrink-0">
              <div className="absolute inset-0 bg-theme-500/5" />
              {/* テクニカルハンドル */}
              <div className="w-16 h-1 bg-theme-500/30 rounded-none relative">
                <div
                  className="absolute inset-0 bg-theme-500 animate-pulse"
                  style={{ width: "30%" }}
                />
              </div>

              <div className="absolute left-6 text-[8px] text-theme-500/40 uppercase tracking-[0.4em] font-black">
                [ STREAM_SYNC_DRAWER ]
              </div>

              <button
                onClick={toggleLyrics}
                className="absolute right-4 p-2 text-theme-500 hover:text-white transition-colors"
              >
                <BsChevronDown size={20} />
              </button>
            </div>

            {/* 歌詞コンテンツエリア */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
              <div className="mb-6 flex justify-between items-center border-l-2 border-theme-500 pl-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-theme-500/60 uppercase tracking-widest">
                    // DECRYPTING_SIGNAL
                  </p>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                    SIGNAL_LYRICS
                  </h2>
                </div>
                <div className="text-[8px] text-theme-500/20 text-right uppercase">
                  encryption_level: high
                  <br />
                  sync_status: optimal
                </div>
              </div>

              <div className="relative pt-4">
                <SyncedLyrics lyrics={lyrics} />
              </div>
            </div>

            {/* フッター装飾 */}
            <div className="h-10 border-t border-theme-500/10 flex items-center justify-center px-6 bg-theme-500/5">
              <div className="w-full flex justify-between items-center text-[7px] text-theme-500/20 uppercase tracking-[0.2em] font-bold">
                <span>protocol: lyrics_v4.2</span>
                <span className="animate-pulse">tracking_signal: active</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyricsDrawer;
