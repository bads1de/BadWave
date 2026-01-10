import { useEffect, useRef, useCallback } from "react";
import useEqualizerStore, { EQ_BANDS } from "@/hooks/stores/useEqualizerStore";
import useSpatialStore from "@/hooks/stores/useSpatialStore";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";

/**
 * Web Audio API を使用したオーディオエフェクト機能を提供するフック
 * audio要素にイコライザーと空間オーディオフィルターを適用する
 *
 * @param audioRef - HTMLAudioElement への参照
 * @returns 初期化状態とコンテキスト制御関数
 */
const useAudioEqualizer = (
  audioRef: React.RefObject<HTMLAudioElement | null>
) => {
  const isEqEnabled = useEqualizerStore((state) => state.isEnabled);
  const bands = useEqualizerStore((state) => state.bands);
  const isSpatialEnabled = useSpatialStore((state) => state.isSpatialEnabled);
  const isSlowedReverb = usePlaybackRateStore((state) => state.isSlowedReverb);

  // Web Audio API ノードの参照
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const spatialFilterRef = useRef<BiquadFilterNode | null>(null);
  const reverbGainNodeRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const isInitializedRef = useRef(false);

  /**
   * インパルス応答を生成する (リバーブ用)
   */
  const setupImpulseResponse = useCallback(
    (context: AudioContext, convolver: ConvolverNode) => {
      const sampleRate = context.sampleRate;
      const length = sampleRate * 3; // 3秒
      const impulse = context.createBuffer(2, length, sampleRate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const decay = Math.pow((length - i) / length, 2);
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
      }

      convolver.buffer = impulse;
    },
    []
  );

  /**
   * Web Audio API グラフを初期化
   * audio要素 -> EQ -> Spatial -> Master -> Dest
   *                   |-> Reverb -> Dest
   */
  const initializeAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    try {
      // AudioContext の作成
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      audioContextRef.current = context;

      // audio要素をソースノードとして接続
      const sourceNode = context.createMediaElementSource(audio);
      sourceNodeRef.current = sourceNode;

      // --- EQ Filters ---
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

      // --- Spatial Nodes ---
      // LowPassフィルタで高音を削り、こもった音を作る
      const spatialFilter = context.createBiquadFilter();
      spatialFilter.type = "lowpass";
      spatialFilter.frequency.value = 22050; // デフォルトは全通
      spatialFilter.Q.value = 1.0;
      spatialFilterRef.current = spatialFilter;

      // リバーブ用
      const convolver = context.createConvolver();
      const reverbGainNode = context.createGain();
      reverbGainNode.gain.value = 0;
      convolverRef.current = convolver;
      reverbGainNodeRef.current = reverbGainNode;

      setupImpulseResponse(context, convolver);

      // マスターゲイン
      const masterGain = context.createGain();
      masterGain.gain.value = 1;
      masterGainRef.current = masterGain;

      // --- 接続 (Routing) ---
      let currentNode: AudioNode = sourceNode;

      // EQ接続
      filters.forEach((filter) => {
        currentNode.connect(filter);
        currentNode = filter;
      });

      // Spatial Filter 接続
      currentNode.connect(spatialFilter);

      // Main Path: Spatial -> Master -> Dest
      spatialFilter.connect(masterGain);
      masterGain.connect(context.destination);

      // Reverb Path: Spatial -> ReverbGain -> Convolver -> Dest
      spatialFilter.connect(reverbGainNode);
      reverbGainNode.connect(convolver);
      convolver.connect(context.destination);

      isInitializedRef.current = true;
      console.log(
        "[useAudioEqualizer] Initialized successfully with Spatial Audio"
      );
    } catch (error) {
      console.error("[useAudioEqualizer] Initialization failed:", error);
    }
  }, [audioRef, setupImpulseResponse]);

  /**
   * AudioContext を resume する（ユーザー操作後に呼ぶ）
   */
  const resumeContext = useCallback(async () => {
    const context = audioContextRef.current;
    if (context && context.state === "suspended") {
      await context.resume();
    }
  }, []);

  // audio要素が利用可能になったら初期化
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

  // ストアのEQゲイン変更を反映
  useEffect(() => {
    if (!isInitializedRef.current || filtersRef.current.length === 0) return;

    filtersRef.current.forEach((filter, index) => {
      const band = bands[index];
      if (band) {
        filter.gain.value = isEqEnabled ? band.gain : 0;
      }
    });
  }, [bands, isEqEnabled]);

  // Spatial Mode (ダンスホール効果) および Reverb の反映
  useEffect(() => {
    const spatialFilter = spatialFilterRef.current;
    const reverbGainNode = reverbGainNodeRef.current;
    const context = audioContextRef.current;

    if (
      !isInitializedRef.current ||
      !spatialFilter ||
      !reverbGainNode ||
      !context
    )
      return;

    const now = context.currentTime;

    // リバーブ量の決定
    // Spatialモード優先(0.8)、次にSlowed+Reverb(0.6)、それ以外は0
    let targetReverbGain = 0;
    if (isSpatialEnabled) {
      targetReverbGain = 0.8;
    } else if (isSlowedReverb) {
      targetReverbGain = 0.6;
    }

    // Spatial (Lowpass) の設定
    if (isSpatialEnabled) {
      // ON: 800Hz以上をカット
      try {
        spatialFilter.frequency.cancelScheduledValues(now);
        spatialFilter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      } catch (e) {
        spatialFilter.frequency.value = 800;
      }
    } else {
      // OFF: 22050Hz (全通)
      try {
        spatialFilter.frequency.cancelScheduledValues(now);
        spatialFilter.frequency.exponentialRampToValueAtTime(22050, now + 0.2);
      } catch (e) {
        spatialFilter.frequency.value = 22050;
      }
    }

    // Reverb Gain の設定
    try {
      reverbGainNode.gain.cancelScheduledValues(now);
      reverbGainNode.gain.setTargetAtTime(targetReverbGain, now, 0.1);
    } catch (e) {
      reverbGainNode.gain.value = targetReverbGain;
    }
  }, [isSpatialEnabled, isSlowedReverb]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
        sourceNodeRef.current = null;
        filtersRef.current = [];
        spatialFilterRef.current = null;
        convolverRef.current = null;
        reverbGainNodeRef.current = null;
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
