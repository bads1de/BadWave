"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { Pulse } from "@/types";

interface CityPopThemeProps {
  pulses: Pulse[];
  currentPulse: Pulse | undefined;
  currentPulseIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  analyser: AnalyserNode | null;
  hasStarted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleStart: () => void;
  togglePlay: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (seconds: number) => void;
  handleNextPulse: () => void;
  handlePrevPulse: () => void;
}

/**
 * CityPopTheme: 80年代シティポップをテーマにしたビジュアルプレイヤー
 * パステルカラー、幾何学模様、CDプレイヤー、ビジュアライザーを特徴としています。
 */
const CityPopTheme: React.FC<CityPopThemeProps> = ({
  pulses,
  currentPulse,
  currentPulseIndex,
  isPlaying,
  hasStarted,
  togglePlay,
  onSeek,
  handleNextPulse,
  handlePrevPulse,
  handleStart,
  analyser,
}) => {
  const trackTitle = currentPulse?.title || "Unknown Track";
  const trackGenre = currentPulse?.genre || "City Pop";

  // CD回転アニメーション用のRef
  const cdRef = useRef<HTMLDivElement>(null);

  // オーディオビジュアライザー用のCanvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * ビジュアライザーの描画ロジック
   * 音声の周波数データを取得し、CDの周囲にバーを描画します。
   */
  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;

    const draw = () => {
      if (!ctx || !canvas) return;
      animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      if (canvas.width === 0 || canvas.height === 0) return;

      // 描画のリセット
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 半径の計算（レスポンシブ対応）
      const isDesktop = window.innerWidth >= 768;
      const cdRadius = isDesktop ? 225 : 150;
      const startRadius = cdRadius + 20;

      ctx.translate(centerX, centerY);

      ctx.beginPath();
      const barCount = 120;
      const angleStep = (Math.PI * 2) / barCount;

      // 円形のバーを描画
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i + 4] || 0;
        const barHeight = Math.max(0, (value / 255) * 60);

        const angle = i * angleStep;

        ctx.moveTo(
          Math.cos(angle) * startRadius,
          Math.sin(angle) * startRadius
        );
        ctx.lineTo(
          Math.cos(angle) * (startRadius + barHeight),
          Math.sin(angle) * (startRadius + barHeight)
        );
      }

      ctx.lineCap = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 105, 180, 0.6)"; // シティポップらしいピンク
      ctx.stroke();

      // 内側のリング（低音に反応して光る）
      const avgVol = dataArray.slice(0, 20).reduce((a, b) => a + b) / 20;
      if (avgVol > 100) {
        ctx.beginPath();
        ctx.arc(0, 0, startRadius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${(avgVol - 100) / 400})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
    draw();

    return () => cancelAnimationFrame(animationId);
  }, [analyser]);

  /**
   * ウィンドウリサイズ時のCanvasサイズ調整
   */
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const size = Math.max(window.innerWidth, window.innerHeight);
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        canvasRef.current.style.width = `${size}px`;
        canvasRef.current.style.height = `${size}px`;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#FFFBEB] overflow-hidden flex flex-col font-sans text-gray-800">
      {/* 動的な背景パターン */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* パステルグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-pink-100 to-cyan-200 opacity-90" />

        {/* ドットパターン */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ff69b4 2px, transparent 2.5px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* スクロールする背景テキスト */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
          <div className="absolute top-[10%] -left-[10%] text-[20vw] font-black leading-none text-blue-500 whitespace-nowrap animate-slide-slow">
            CITY POP SUMMER WAVE
          </div>
          <div className="absolute bottom-[10%] -right-[10%] text-[20vw] font-black leading-none text-pink-500 whitespace-nowrap animate-slide-delayed">
            PLASTIC LOVE 1984
          </div>
        </div>

        {/* 幾何学模様（アニメーション付き） */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow" />
        <div className="absolute top-1/2 right-20 w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow" />

        {/* コンフェッティ / アイコン */}
        <div className="absolute top-[15%] right-[10%] rotate-12 drop-shadow-lg">
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            className="text-cyan-400 opacity-80 animate-wiggle"
          >
            <path
              d="M10 50 Q 25 25, 50 50 T 90 50"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="absolute bottom-[25%] left-[8%] -rotate-12 drop-shadow-lg">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="text-pink-400 opacity-80 animate-wiggle-reverse"
          >
            <polygon
              points="50,10 90,90 10,90"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="absolute top-[30%] left-[20%] text-yellow-500 opacity-60 animate-spin-slow">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <rect
              x="0"
              y="0"
              width="60"
              height="60"
              transform="rotate(45 30 30)"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 初期オーバーレイ（再生開始） */}
      {!hasStarted && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm cursor-pointer"
          onClick={handleStart}
        >
          <div className="bg-white px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h1 className="text-4xl font-black tracking-widest text-black">
              START LISTENING
            </h1>
          </div>
        </div>
      )}

      {/* メインレイアウト */}
      <div
        className={`relative z-10 flex flex-col md:flex-row h-full items-center justify-center w-full max-w-7xl mx-auto p-8 pb-24 transition-opacity duration-1000 ${
          hasStarted ? "opacity-100" : "opacity-50 blur-sm"
        }`}
      >
        {/* 左側: 帯（デスクトップのみ） */}
        <div className="hidden md:flex flex-col h-[80%] w-24 bg-gray-900 text-white shadow-[10px_10px_30px_rgba(0,0,0,0.2)] mr-16 relative overflow-hidden flex-shrink-0 z-20">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
          <div className="flex-1 flex flex-col items-center py-8 writing-vertical-rl text-orientation-mixed">
            <span className="text-xs font-mono tracking-widest mb-4 opacity-70">
              STEREO SOUND
            </span>
            <h2 className="text-3xl font-black tracking-widest whitespace-nowrap text-yellow-300 drop-shadow-md">
              {trackTitle}
            </h2>
            <span className="mt-8 text-lg font-bold tracking-wider">
              {trackGenre}
            </span>
          </div>
          <div className="p-4 text-center border-t border-gray-700">
            <span className="text-2xl font-black">¥2,800</span>
          </div>
        </div>

        {/* 中央: CDプレイヤー */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[600px] relative">
          {/* CDコンテナ */}
          <div className="relative group perspective-1000 z-10">
            {/* ビジュアライザーCanvas - CDの背後に配置 */}
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
            />

            {/* 光のハロー効果 */}
            <div className="absolute inset-0 bg-white/40 rounded-full scale-110 transform blur-md" />

            {/* CD */}
            <div
              ref={cdRef}
              className={`relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] rounded-full shadow-2xl border-[6px] border-white overflow-hidden bg-gray-100 transition-transform duration-[2s] ease-linear`}
              style={{
                animation: isPlaying ? "spin 8s linear infinite" : "none",
                boxShadow: isPlaying
                  ? "0 0 50px rgba(255,105,180,0.4)"
                  : "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              {/* アルバムアート */}
              <div className="absolute inset-0">
                <Image
                  src="/images/city_pop_cd.png"
                  alt="City Pop CD"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* 中央の穴 / 反射 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/95 rounded-full border-4 border-gray-200 flex items-center justify-center shadow-inner">
                <div className="w-5 h-5 bg-transparent rounded-full border-2 border-gray-400/50" />
              </div>

              {/* シャイン効果 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/10 pointer-events-none rounded-full" />
            </div>

            {/* 浮遊する音符アニメーション */}
            {isPlaying && (
              <>
                <div className="absolute -top-10 -right-5 text-4xl animate-bounce-custom delay-100 text-pink-500">
                  🎵
                </div>
                <div className="absolute top-20 -right-16 text-3xl animate-bounce-custom delay-300 text-cyan-500">
                  ✨
                </div>
                <div className="absolute -bottom-5 -left-10 text-4xl animate-bounce-custom delay-700 text-yellow-500">
                  ♪
                </div>
              </>
            )}
          </div>

          {/* モバイル用タイトル表示 */}
          <div className="mt-8 text-center md:hidden z-20">
            <h2 className="text-2xl font-black text-gray-800 tracking-wider mix-blend-multiply">
              {trackTitle}
            </h2>
            <p className="text-pink-500 font-bold">{trackGenre}</p>
          </div>

          {/* コントロールパネル - ポップなメンフィススタイル */}
          <div className="mt-12 flex items-center gap-6 md:gap-8 bg-white/90 backdrop-blur px-10 py-5 rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black z-20 relative">
            <button
              onClick={handlePrevPulse}
              className="text-gray-900 hover:text-pink-500 transition-transform active:scale-95"
            >
              <MdSkipPrevious size={32} />
            </button>

            <button
              onClick={() => onSeek(-10)}
              className="text-gray-900 hover:text-cyan-500 transition-transform active:scale-95"
            >
              <FaStepBackward size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 rounded-full border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
            >
              {isPlaying ? (
                <FaPause size={24} className="text-black" />
              ) : (
                <FaPlay size={24} className="text-black ml-1" />
              )}
            </button>

            <button
              onClick={() => onSeek(10)}
              className="text-gray-900 hover:text-cyan-500 transition-transform active:scale-95"
            >
              <FaStepForward size={20} />
            </button>

            <button
              onClick={handleNextPulse}
              className="text-gray-900 hover:text-pink-500 transition-transform active:scale-95"
            >
              <MdSkipNext size={32} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .writing-vertical-rl {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 10s ease-in-out infinite reverse;
        }
        .animate-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }
        .animate-wiggle-reverse {
          animation: wiggle 4s ease-in-out infinite reverse;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .animate-bounce-custom {
          animation: bounceCustom 2s infinite;
        }
        .animate-slide-slow {
          animation: slideLeft 30s linear infinite;
        }
        .animate-slide-delayed {
          animation: slideRight 35s linear infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(12deg);
          }
          50% {
            transform: rotate(-12deg);
          }
        }
        @keyframes bounceCustom {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes slideLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes slideRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(50%);
          }
        }
      `}</style>
    </div>
  );
};

export default CityPopTheme;
