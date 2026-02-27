"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { AudioEngine } from "@/libs/audio/AudioEngine";

interface LrcLine {
  time: number; // 秒
  text: string;
}

// LRC形式かどうかを判定（ファイル内のどこかにタイムスタンプがあればOK）
const isLrcFormat = (lyrics: string): boolean => {
  return /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lyrics);
};

// LRC文字列をパース
const parseLrc = (lrc: string): LrcLine[] => {
  const lines = lrc.split("\n");
  const result: LrcLine[] = [];

  for (const line of lines) {
    // [mm:ss.xx] または [mm:ss.xxx] 形式にマッチ
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms =
        match[3].length === 2
          ? parseInt(match[3], 10) * 10
          : parseInt(match[3], 10);
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();

      // メタデータ行（[ti:...], [ar:...] など）はスキップ
      if (text && !text.startsWith("[")) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

interface SyncedLyricsProps {
  lyrics: string;
}

const SyncedLyrics: React.FC<SyncedLyricsProps> = ({ lyrics }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  // AudioEngineから現在の再生時間を購読
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    const audio = engine.audio;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // LRCかどうかを判定
  const isLrc = useMemo(() => isLrcFormat(lyrics), [lyrics]);

  // LRCをパース
  const lrcLines = useMemo(() => {
    if (!isLrc) return [];
    return parseLrc(lyrics);
  }, [lyrics, isLrc]);

  // 現在の行を特定
  const currentLineIndex = useMemo(() => {
    if (lrcLines.length === 0) return -1;

    // currentTimeより小さい最大のtimeを持つ行を探す
    let index = -1;
    for (let i = 0; i < lrcLines.length; i++) {
      if (lrcLines[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lrcLines, currentTime]);

  // 現在の行にスムーズスクロール
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex]);

  // LRC形式でない場合は普通のテキスト表示
  if (!isLrc) {
    return (
      <p
        className="whitespace-pre-wrap text-neutral-200 text-lg font-medium leading-relaxed tracking-wide text-center"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
      >
        {lyrics}
      </p>
    );
  }

  // LRC形式の場合は同期表示
  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 py-12 relative">
      {/* 歌詞エリア専用のスキャンライン */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {lrcLines.map((line, index) => {
        const isActive = index === currentLineIndex;
        const isPast = index < currentLineIndex;

        return (
          <div
            key={index}
            className="flex items-center gap-x-4 w-full px-6 transition-all duration-500"
          >
            {/* タイムスタンプ装飾 */}
            <span className={`font-mono text-[10px] tracking-tighter transition-colors duration-500 ${isActive ? "text-theme-500" : "text-theme-900/40"}`}>
              [{Math.floor(line.time / 60).toString().padStart(2, '0')}:{Math.floor(line.time % 60).toString().padStart(2, '0')}]
            </span>
            
            <p
              ref={isActive ? activeLineRef : null}
              className={`
                flex-1 text-left font-mono uppercase tracking-widest transition-all duration-500 ease-out
                ${
                  isActive
                    ? "text-white text-xl md:text-2xl font-bold drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)] cyber-glitch"
                    : isPast
                      ? "text-theme-500/30 text-base md:text-lg italic"
                      : "text-theme-900/60 text-base md:text-lg"
                }
              `}
            >
              {isActive && <span className="mr-2 text-theme-500 animate-pulse">{">"}</span>}
              {line.text}
            </p>
          </div>
        );
      })}
      
      {/* 終端インジケーター */}
      <div className="mt-8 text-[10px] font-mono text-theme-500/20 uppercase tracking-[0.5em]">
        --- END_OF_STREAM ---
      </div>
    </div>
  );
};

export default SyncedLyrics;
