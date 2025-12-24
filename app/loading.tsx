"use client";

import { PulseLoader } from "react-spinners";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div
      className="h-full flex items-center justify-center rounded-xl"
      style={{
        background:
          "linear-gradient(to bottom right, rgba(24, 24, 27, 0.8), rgba(var(--theme-900), 0.2), rgba(24, 24, 27, 0.8))",
      }}
    >
      <div className="relative">
        {/* バックグラウンドのblur */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(var(--theme-500), 0.1)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(var(--theme-600), 0.1)" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4 p-8"
        >
          {/* ローディングアニメーション */}
          <PulseLoader
            color="var(--primary-color)"
            size={15}
            speedMultiplier={0.8}
          />
          {/* ローディングテキスト */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-neutral-400"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Loading;
