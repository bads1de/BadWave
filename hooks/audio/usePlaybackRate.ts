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
  const isSlowedReverb = usePlaybackRateStore((state) => state.isSlowedReverb);

  // 再生速度を適用
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetRate = isSlowedReverb ? 0.85 : rate;
    audio.playbackRate = targetRate;

    // preservesPitch プロパティの設定
    // Slowed + Reverb モードではピッチを下げるため false に設定
    // @ts-ignore - preservesPitch はまだ標準化されていないプロパティ
    audio.preservesPitch = !isSlowedReverb;
    // @ts-ignore - Firefox 向けのプレフィックス
    audio.mozPreservesPitch = !isSlowedReverb;
    // @ts-ignore - Safari 向けのプレフィックス
    audio.webkitPreservesPitch = !isSlowedReverb;
  }, [audioRef, rate, isSlowedReverb]);

  // ソース変更時に再生速度を再適用
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleDurationChange = () => {
      const targetRate = isSlowedReverb ? 0.85 : rate;
      audio.playbackRate = targetRate;

      // @ts-ignore
      audio.preservesPitch = !isSlowedReverb;
      // @ts-ignore
      audio.mozPreservesPitch = !isSlowedReverb;
      // @ts-ignore
      audio.webkitPreservesPitch = !isSlowedReverb;
    };

    audio.addEventListener("durationchange", handleDurationChange);
    return () => {
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [audioRef, rate, isSlowedReverb]);

  return { rate };
};

export default usePlaybackRate;
