import { useEffect, useRef, useCallback } from "react";
import useEffectStore, {
  ROTATION_SPEED_VALUES,
  RotationSpeed,
} from "@/hooks/stores/useEffectStore";
import useSpatialStore from "@/hooks/stores/useSpatialStore";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import { AudioEngine } from "@/libs/audio/AudioEngine";

/**
 * オーディオエフェクト全般を管理する統合フック
 * - Spatial Audio (空間オーディオ)
 * - Slowed + Reverb
 * - 8D Audio
 * - Lo-Fi Mode
 */
const useAudioEffects = () => {
  // Stores
  const {
    isSlowedReverb,
    toggleSlowedReverb,
    is8DAudioEnabled,
    rotationSpeed,
    toggle8DAudio,
    setRotationSpeed,
    isLoFiEnabled,
    toggleLoFi,
  } = useEffectStore();

  const { isSpatialEnabled, toggleSpatialEnabled } = useSpatialStore();
  const setRate = usePlaybackRateStore((state) => state.setRate);

  // --- Slowed + Reverb Logic ---
  const previousRateRef = useRef<number | null>(null);

  useEffect(() => {
    const engine = AudioEngine.getInstance();

    if (isSlowedReverb) {
      const currentRate = usePlaybackRateStore.getState().rate;
      if (currentRate !== 0.85) {
        previousRateRef.current = currentRate;
      } else if (previousRateRef.current === null) {
        previousRateRef.current = 1.0;
      }

      setRate(0.85);
      engine.setPreservesPitch(false);
      engine.setSlowedReverbMode(true);
    } else {
      engine.setPreservesPitch(true);
      engine.setSlowedReverbMode(false);

      if (previousRateRef.current !== null) {
        setRate(previousRateRef.current);
      }
    }
  }, [isSlowedReverb, setRate]);

  // --- Spatial Audio Logic ---
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engine.setSpatialMode(isSpatialEnabled);
  }, [isSpatialEnabled]);

  // --- 8D Audio Logic ---
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    if (!engine.isInitialized) return;

    const rotationPeriod = ROTATION_SPEED_VALUES[rotationSpeed];
    engine.set8DAudioMode(is8DAudioEnabled, rotationPeriod);
  }, [is8DAudioEnabled, rotationSpeed]);

  const change8DRotationSpeed = useCallback(
    (speed: RotationSpeed) => {
      setRotationSpeed(speed);
    },
    [setRotationSpeed]
  );

  // --- Lo-Fi Logic ---
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    if (!engine.isInitialized) return;

    engine.setLoFiMode(isLoFiEnabled);
  }, [isLoFiEnabled]);

  // --- 再生開始時の再適用ロジック ---
  const applyEffects = useCallback(() => {
    const engine = AudioEngine.getInstance();
    if (!engine.isInitialized) return;

    // Spatial
    engine.setSpatialMode(isSpatialEnabled);

    // 8D Audio
    const rotationPeriod = ROTATION_SPEED_VALUES[rotationSpeed];
    engine.set8DAudioMode(is8DAudioEnabled, rotationPeriod);

    // Lo-Fi
    engine.setLoFiMode(isLoFiEnabled);

    // Slowed + Reverb (モード設定とピッチ補正のみ)
    if (isSlowedReverb) {
      engine.setSlowedReverbMode(true);
      engine.setPreservesPitch(false);
    } else {
      engine.setSlowedReverbMode(false);
      engine.setPreservesPitch(true);
    }
  }, [
    isSpatialEnabled,
    is8DAudioEnabled,
    rotationSpeed,
    isLoFiEnabled,
    isSlowedReverb,
  ]);

  // オーディオイベントリスナー
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    const audio = engine.audio;
    if (!audio) return;

    const handleDurationChange = () => {
      if (isSlowedReverb) {
        engine.setPreservesPitch(false);
      } else {
        engine.setPreservesPitch(true);
      }
    };

    const handlePlay = () => {
      if (!engine.isInitialized) {
        engine.initialize();
      }
      // 初期化直後や再生再開時にエフェクトを確実に適用
      applyEffects();
    };

    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
    };
  }, [isSlowedReverb, applyEffects]);

  return {
    // Spatial
    isSpatialEnabled,
    toggleSpatialEnabled,

    // Slowed + Reverb
    isSlowedReverb,
    toggleSlowedReverb,

    // 8D Audio
    is8DAudioEnabled,
    rotationSpeed,
    toggle8DAudio,
    change8DRotationSpeed,

    // Lo-Fi
    isLoFiEnabled,
    toggleLoFi,
  };
};

export default useAudioEffects;