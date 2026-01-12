import { useEffect, RefObject } from "react";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";

/**
 * オーディオ要素に再生速度を適用するカスタムフック
 *
 * @param audioRef - HTMLAudioElement への参照
 *
 * @description
 * ストアの状態に基づいて以下の設定を行う：
 * - 通常モード: preservesPitch = true（ピッチを維持）
 * - Slowed + Reverb モード: playbackRate = 0.85, preservesPitch = false（ピッチを下げる）
 */
const usePlaybackRate = (audioRef: RefObject<HTMLAudioElement | null>) => {
  const rate = usePlaybackRateStore((state) => state.rate);

  // 再生速度を適用
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
  }, [audioRef, rate]);

  // ソース変更時に再生速度を再適用
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleDurationChange = () => {
      audio.playbackRate = rate;
    };

    audio.addEventListener("durationchange", handleDurationChange);
    return () => {
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [audioRef, rate]);

  return { rate };
};

export default usePlaybackRate;
