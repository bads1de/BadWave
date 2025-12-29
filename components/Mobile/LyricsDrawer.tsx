import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronDown } from "react-icons/bs";

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
  const drawerHeight = screenHeight * 0.7;

  return (
    <AnimatePresence>
      {showLyrics && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              toggleLyrics();
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            height: `${drawerHeight}px`,
            touchAction: "none",
          }}
        >
          <div className="w-full h-full bg-black bg-opacity-80 backdrop-blur-md rounded-t-2xl shadow-lg overflow-hidden custom-scrollbar">
            <div className="relative h-full overflow-y-auto p-6">
              <div className="absolute top-2 left-0 right-0 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-white opacity-50" />
              </div>
              <button
                onClick={toggleLyrics}
                className="absolute top-4 right-4 text-white text-2xl"
              >
                <BsChevronDown />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                歌詞
              </h2>
              <pre className="whitespace-pre-wrap text-white text-base leading-relaxed">
                {lyrics}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyricsDrawer;
