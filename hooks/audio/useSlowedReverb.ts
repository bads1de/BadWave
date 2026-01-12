import { useEffect, useRef, RefObject } from "react";
import useEffectStore from "@/hooks/stores/useEffectStore";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";

/**
 * Slowed + Reverb 効果を適用するフック (Web版)
 * - 再生速度を0.85倍にする
 * - ピッチ補正を無効にする
 * - リバーブの適用は useAudioEqualizer 側で行われる
 */
const useSlowedReverb = (audioRef: RefObject<HTMLAudioElement | null>) => {
  const isSlowedReverb = useEffectStore((state) => state.isSlowedReverb);
  const setRate = usePlaybackRateStore((state) => state.setRate);

  // 元の速度を保持するためのRef
  const previousRateRef = useRef<number>(1.0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isSlowedReverb) {
      // 現在の速度を保存して、0.85倍に設定
      previousRateRef.current = usePlaybackRateStore.getState().rate;
      if (previousRateRef.current === 0.85) {
        previousRateRef.current = 1.0;
      }

      setRate(0.85);

      // ピッチ補正をOFF
      // @ts-ignore
      audio.preservesPitch = false;
      // @ts-ignore
      audio.mozPreservesPitch = false;
      // @ts-ignore
      audio.webkitPreservesPitch = false;
    } else {
      // ピッチ補正をONに戻す
      // @ts-ignore
      audio.preservesPitch = true;
      // @ts-ignore
      audio.mozPreservesPitch = true;
      // @ts-ignore
      audio.webkitPreservesPitch = true;

      // 速度を1.0に戻す
      setRate(1.0);
    }
  }, [isSlowedReverb, setRate, audioRef]);

  // Audioソースが変わった時などにピッチ補正設定がリセットされるための再適用
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleDurationChange = () => {
      if (isSlowedReverb) {
        // @ts-ignore
        audio.preservesPitch = false;
        // @ts-ignore
        audio.mozPreservesPitch = false;
        // @ts-ignore
        audio.webkitPreservesPitch = false;
      } else {
        // @ts-ignore
        audio.preservesPitch = true;
        // @ts-ignore
        audio.mozPreservesPitch = true;
        // @ts-ignore
        audio.webkitPreservesPitch = true;
      }
    };

    audio.addEventListener("durationchange", handleDurationChange);
    return () => {
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [isSlowedReverb, audioRef]);
};

export default useSlowedReverb;
