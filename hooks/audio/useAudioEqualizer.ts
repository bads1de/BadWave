import { useEffect, useRef, useCallback } from "react";
import useEqualizerStore, { EQ_BANDS } from "@/hooks/stores/useEqualizerStore";

/**
 * Web Audio API を使用したイコライザー機能を提供するフック
 * audio要素にイコライザーフィルターを適用する
 *
 * @param audioRef - HTMLAudioElement への参照
 * @returns イコライザーの初期化状態
 */
const useAudioEqualizer = (
  audioRef: React.RefObject<HTMLAudioElement | null>
) => {
  const isEnabled = useEqualizerStore((state) => state.isEnabled);
  const bands = useEqualizerStore((state) => state.bands);

  // Web Audio API ノードの参照
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const isInitializedRef = useRef(false);

  /**
   * Web Audio API グラフを初期化
   * audio要素 -> イコライザーフィルター -> 出力
   */
  const initializeAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    try {
      // AudioContext の作成
      const context = new AudioContext();
      audioContextRef.current = context;

      // audio要素をソースノードとして接続
      const sourceNode = context.createMediaElementSource(audio);
      sourceNodeRef.current = sourceNode;

      // 6バンドイコライザーフィルターを作成
      const filters = EQ_BANDS.map((band, index) => {
        const filter = context.createBiquadFilter();
        if (index === 0) {
          filter.type = "lowshelf";
        } else if (index === EQ_BANDS.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
          filter.Q.value = 1.4;
        }
        filter.frequency.value = band.freq;
        filter.gain.value = 0;
        return filter;
      });
      filtersRef.current = filters;

      // ノードを直列接続: Source -> Filter1 -> Filter2 -> ... -> Destination
      let currentNode: AudioNode = sourceNode;
      filters.forEach((filter) => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      currentNode.connect(context.destination);

      isInitializedRef.current = true;
      console.log("[useAudioEqualizer] Initialized successfully");
    } catch (error) {
      console.error("[useAudioEqualizer] Initialization failed:", error);
    }
  }, [audioRef]);

  /**
   * AudioContext を resume する（ユーザー操作後に呼ぶ）
   */
  const resumeContext = useCallback(async () => {
    const context = audioContextRef.current;
    if (context && context.state === "suspended") {
      await context.resume();
    }
  }, []);

  // audio要素が利用可能になったら初期化（再生開始時にトリガー）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      if (!isInitializedRef.current) {
        initializeAudioGraph();
      }
      resumeContext();
    };

    audio.addEventListener("play", handlePlay);
    return () => audio.removeEventListener("play", handlePlay);
  }, [audioRef, initializeAudioGraph, resumeContext]);

  // ストアのゲイン変更をフィルターに反映
  useEffect(() => {
    if (!isInitializedRef.current || filtersRef.current.length === 0) return;

    filtersRef.current.forEach((filter, index) => {
      const band = bands[index];
      if (band) {
        // イコライザーが有効な場合のみゲインを適用
        filter.gain.value = isEnabled ? band.gain : 0;
      }
    });
  }, [bands, isEnabled]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
        sourceNodeRef.current = null;
        filtersRef.current = [];
        isInitializedRef.current = false;
      }
    };
  }, []);

  return {
    isInitialized: isInitializedRef.current,
    resumeContext,
  };
};

export default useAudioEqualizer;
