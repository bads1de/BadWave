"use client";

import { useState, useRef, useEffect } from "react";
import VaporwaveTheme from "./VaporwaveTheme";
import CityPopTheme from "./CityPopTheme";
import { Pulse } from "@/types";

interface PulseClientProps {
  pulses: Pulse[];
}

/**
 * PulseClient: Pulse機能のメインクライアントコンポーネント
 * 音声再生管理、状態保持、テーマの切り替えを担当します。
 */
export default function PulseClient({ pulses }: PulseClientProps) {
  // 再生状態の管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Web Audio APIのビジュアライザー用ノード
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // ユーザーの初回アクション（再生開始）を確認
  const [hasStarted, setHasStarted] = useState(false);

  // 現在再生中のPulseインデックス
  const [currentPulseIndex, setCurrentPulseIndex] = useState(0);

  // 音声関連のRef
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // 現在のPulseデータを取得
  const currentPulse = pulses[currentPulseIndex];
  const audioSrc = currentPulse?.music_path || "/music/demo.mp3";

  /**
   * 音声の初期化と再生開始
   * ユーザーのクリック（Start Listening）で呼び出されます。
   */
  const handleStart = () => {
    if (!audioRef.current) return;

    // AudioContextの初期化（ブラウザ制限のためユーザーアクション内で行う）
    if (!audioContextRef.current) {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      audioContextRef.current = ctx;
      sourceRef.current = source;
      setAnalyser(analyserNode);
    }

    // 中断されている場合は再開
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    audioRef.current.volume = volume;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      })
      .catch((e) => console.error("Playback failed:", e));
  };

  // 音量の同期
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * 次のPulseへ移動
   */
  const handleNextPulse = () => {
    if (pulses.length > 0) {
      setCurrentPulseIndex((prev) => (prev + 1) % pulses.length);
    }
  };

  /**
   * 前のPulseへ移動
   */
  const handlePrevPulse = () => {
    if (pulses.length > 0) {
      setCurrentPulseIndex(
        (prev) => (prev - 1 + pulses.length) % pulses.length
      );
    }
  };

  /**
   * Pulseが切り替わった際の自動再生処理
   */
  useEffect(() => {
    if (hasStarted && audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Playback failed:", e));
    }
  }, [currentPulseIndex, hasStarted]);

  /**
   * 音声終了時のコールバック（自動で次へ）
   */
  const handleAudioEnded = () => {
    handleNextPulse();
  };

  /**
   * 再生・一時停止のトグル
   */
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  /**
   * スキーク（10秒戻る/進むなど）
   */
  const onSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  /**
   * 音量変更のハンドル
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  /**
   * ジャンルに基づいてテーマを判定
   * ジャンルに "city" または "pop" が含まれる場合は CityPopTheme を適用
   */
  const isCityPop =
    currentPulse?.genre?.toLowerCase().includes("city") ||
    currentPulse?.genre?.toLowerCase().includes("pop") ||
    (currentPulse?.genre || "").toLowerCase().indexOf("city") !== -1;

  // テーマコンポーネントに渡す共通プロップス
  const commonProps = {
    pulses,
    currentPulse,
    currentPulseIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    analyser,
    hasStarted,
    audioRef,
    handleStart,
    togglePlay,
    handleVolumeChange,
    onSeek,
    handleNextPulse: handleNextPulse,
    handlePrevPulse: handlePrevPulse,
  };

  return (
    <>
      {/* 隠しオーディオ要素 - 全テーマで共有 */}
      <audio
        ref={audioRef}
        src={audioSrc}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* 条件に応じてテーマを切り替え */}
      {isCityPop ? (
        <CityPopTheme {...commonProps} />
      ) : (
        <VaporwaveTheme {...commonProps} />
      )}
    </>
  );
}
