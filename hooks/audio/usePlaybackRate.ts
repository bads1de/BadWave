import { useEffect } from "react";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import { AudioEngine } from "@/libs/audio/AudioEngine";

/**
 * オーディオ要素に再生速度を適用するカスタムフック
 * AudioEngine の audio 要素に対して playbackRate を設定する
 */
const usePlaybackRate = () => {
  const rate = usePlaybackRateStore((state) => state.rate);

  // 再生速度を適用
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    const audio = engine.audio;
    if (!audio) return;

    audio.playbackRate = rate;
  }, [rate]);

  // ソース変更時に再生速度を再適用
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    const audio = engine.audio;
    if (!audio) return;

    const handleDurationChange = () => {
      audio.playbackRate = rate;
    };

    audio.addEventListener("durationchange", handleDurationChange);
    return () => {
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [rate]);

  return { rate };
};

export default usePlaybackRate;