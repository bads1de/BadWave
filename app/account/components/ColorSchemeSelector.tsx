"use client";

import { colorSchemes } from "@/constants/colorSchemes";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import { motion } from "framer-motion";
import { HiCheck } from "react-icons/hi";

const ColorSchemeSelector = () => {
  const { colorSchemeId, setColorScheme } = useColorSchemeStore();

  return (
    <div className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-xl border border-theme-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-none p-5 md:p-8 font-mono group">
      {/* 背景装飾 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* HUDコーナー */}
      <div className="absolute top-0 right-0 w-6 md:w-8 h-6 md:h-8 border-t border-r border-theme-500/40" />
      <div className="absolute bottom-0 left-0 w-6 md:w-8 h-6 md:h-8 border-b border-l border-theme-500/40" />

      <div className="relative z-10">
        <div className="mb-6 md:mb-8 border-l-4 border-theme-500 pl-4">
          <p className="text-[10px] text-theme-500/60 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1">
            [ SYSTEM_PREFERENCE_ENGINE ]
          </p>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]">
            CHROMATIC_OVERRIDE
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorSchemes.map((scheme) => {
            const isSelected = colorSchemeId === scheme.id;

            return (
              <motion.button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                className={`
                  relative overflow-hidden rounded-none p-4 md:p-5 text-left transition-all duration-500
                  ${
                    isSelected
                      ? "border border-theme-500/60 bg-theme-500/10 shadow-[0_0_20px_rgba(var(--theme-500),0.2)]"
                      : "bg-[#0a0a0f] border border-theme-500/10 hover:border-theme-500/40 hover:bg-theme-500/5"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* カラープレビュー (Terminal Style) */}
                <div className="relative mb-4 group/preview">
                  <div
                    className="w-full h-20 rounded-none shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border border-theme-500/20"
                    style={{
                      background: scheme.previewGradient,
                    }}
                  />
                  {/* スキャンライン */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
                </div>

                {/* スキーム名 */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs uppercase tracking-widest truncate">
                      {scheme.name}
                    </h4>
                    <p className="text-[10px] text-theme-500/60 mt-1 uppercase tracking-tight truncate">
                      {scheme.description}
                    </p>
                  </div>

                  {/* 選択インジケーター */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center w-6 h-6 border border-theme-500 bg-theme-500/20 shadow-[0_0_10px_rgba(var(--theme-500),0.5)]"
                    >
                      <HiCheck className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* 背景装飾パーツ (角) */}
                {isSelected && (
                  <>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500" />
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColorSchemeSelector;
