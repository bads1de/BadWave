import { useEffect } from "react";
import useEqualizerStore from "@/hooks/stores/useEqualizerStore";
import { AudioEngine } from "@/libs/audio/AudioEngine";

/**
 * AudioEngineのイコライザーノードを制御するフック
 * AudioEngineはuseAudioPlayerで初期化されるため、ここでは状態の反映のみを行う
 */
const useAudioEqualizer = () => {
  const isEnabled = useEqualizerStore((state) => state.isEnabled);
  const bands = useEqualizerStore((state) => state.bands);

  // ストアのゲイン変更を反映
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    // フィルターがまだ生成されていない場合はスキップ（初期化待ち）
    if (!engine.isInitialized || engine.filters.length === 0) return;

    engine.filters.forEach((filter, index) => {
      const band = bands[index];
      if (band) {
        filter.gain.value = isEnabled ? band.gain : 0;
      }
    });
  }, [bands, isEnabled]);

  return {
    isInitialized: AudioEngine.getInstance().isInitialized,
  };
};

export default useAudioEqualizer;
