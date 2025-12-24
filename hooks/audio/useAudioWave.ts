import { create } from "zustand";

/**
 * グローバルなオーディオプレイヤー参照
 * 複数のオーディオプレイヤーが同時に再生されないように管理するための共有参照
 */
export const globalAudioPlayerRef = {
  // 現在アクティブなプレイヤータイプ（"main" = 既存プレイヤー, "wave" = 波形プレイヤー）
  activePlayer: null as "main" | "wave" | null,
  // メインプレイヤーのオーディオ要素への参照
  mainPlayerAudioRef: null as HTMLAudioElement | null,
  // メインプレイヤーを一時停止するコールバック
  pauseMainPlayer: null as (() => void) | null,
};

interface AudioWaveState {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  audioElement: HTMLAudioElement | null;
  source: MediaElementAudioSourceNode | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentSongId: string | null;
  audioUrl: string | null;
  isEnded: boolean;
  initializeAudio: (audioUrl: string, songId: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  cleanup: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsEnded: (isEnded: boolean) => void;
}

/**
 * オーディオ波形データを管理するカスタムフック
 *
 * @returns {Object} オーディオ波形の状態と操作関数
 * @property {AudioContext|null} audioContext - Web Audio APIのコンテキスト
 * @property {AnalyserNode|null} analyser - オーディオ分析用ノード
 * @property {HTMLAudioElement|null} audioElement - オーディオ要素
 * @property {MediaElementAudioSourceNode|null} source - メディアソースノード
 * @property {number} currentTime - 現在の再生時間（秒）
 * @property {number} duration - 曲の長さ（秒）
 * @property {boolean} isPlaying - 再生中かどうか
 * @property {string|null} currentSongId - 現在の曲ID
 * @property {string|null} audioUrl - オーディオURL
 * @property {boolean} isEnded - 再生終了したかどうか
 * @property {function} initializeAudio - オーディオの初期化関数
 * @property {function} play - 再生関数
 * @property {function} pause - 一時停止関数
 * @property {function} seek - シーク関数
 * @property {function} cleanup - クリーンアップ関数
 * @property {function} setIsPlaying - 再生状態設定関数
 * @property {function} setIsEnded - 終了状態設定関数
 */
const useAudioWaveStore = create<AudioWaveState>((set, get) => ({
  audioContext: null,
  analyser: null,
  audioElement: null,
  source: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  currentSongId: null,
  audioUrl: null,
  isEnded: false,

  /**
   * オーディオを初期化する関数
   * 新しいオーディオURLと曲IDを設定し、AudioContextとAnalyserを作成します
   *
   * @param audioUrl - 再生するオーディオファイルのURL
   * @param songId - 曲の一意識別子
   */
  initializeAudio: async (audioUrl: string, songId: string) => {
    const state = get();

    // 既存のオーディオがある場合はクリーンアップする
    if (state.audioElement) {
      state.cleanup();
    }

    // 新しいAudioContextを作成
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    // オーディオ要素を作成して設定
    const audioElement = new Audio(audioUrl);
    audioElement.crossOrigin = "anonymous";
    audioElement.volume = 0.1;

    // オーディオノードを接続
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // イベントリスナーを設定
    // 再生時間が更新されたときのイベントリスナー
    audioElement.addEventListener("timeupdate", () => {
      set({ currentTime: audioElement.currentTime });
    });

    // メタデータが読み込まれたときのイベントリスナー
    audioElement.addEventListener("loadedmetadata", () => {
      set({ duration: audioElement.duration });
    });

    // 再生が終了したときのイベントリスナー
    audioElement.addEventListener("ended", () => {
      set({ isPlaying: false, isEnded: true });
    });

    // 状態を更新
    set({
      audioContext,
      analyser,
      audioElement,
      source,
      currentSongId: songId,
      audioUrl,
      isEnded: false,
    });
  },

  /**
   * オーディオを再生する関数
   * 一時停止されていた場合はコンテキストを再開し、再生を開始します
   * オーディオ要素が準備完了するまで待機してから再生します
   * 他のプレイヤー（メインプレイヤー）が再生中の場合は停止します
   */
  play: async () => {
    const { audioElement, audioContext } = get();

    if (audioElement && audioContext) {
      try {
        // メインプレイヤーが再生中の場合は停止する
        if (globalAudioPlayerRef.pauseMainPlayer) {
          globalAudioPlayerRef.pauseMainPlayer();
        }
        if (globalAudioPlayerRef.mainPlayerAudioRef) {
          globalAudioPlayerRef.mainPlayerAudioRef.pause();
        }
        // アクティブプレイヤーを波形プレイヤーに設定
        globalAudioPlayerRef.activePlayer = "wave";

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // オーディオ要素が再生可能な状態かチェック
        // readyState: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
        if (audioElement.readyState < 2) {
          // オーディオがまだ読み込まれていない場合、canplayイベントを待つ
          await new Promise<void>((resolve, reject) => {
            const handleCanPlay = () => {
              audioElement.removeEventListener("canplay", handleCanPlay);
              audioElement.removeEventListener("error", handleError);
              resolve();
            };
            const handleError = () => {
              audioElement.removeEventListener("canplay", handleCanPlay);
              audioElement.removeEventListener("error", handleError);
              reject(new Error("オーディオの読み込みに失敗しました"));
            };
            audioElement.addEventListener("canplay", handleCanPlay);
            audioElement.addEventListener("error", handleError);
          });
        }

        await audioElement.play();
        set({ isPlaying: true, isEnded: false });
      } catch (error) {
        console.error("オーディオ再生エラー:", error);
        // エラー時は再生状態をfalseに設定
        set({ isPlaying: false });
      }
    }
  },

  /**
   * オーディオを一時停止する関数
   * 再生中のオーディオを停止し、再生状態を更新します
   */
  pause: () => {
    const { audioElement } = get();

    if (audioElement) {
      audioElement.pause();
      set({ isPlaying: false });
    }
  },

  /**
   * 特定の時間位置にシークする関数
   *
   * @param time - シーク先の時間（秒）
   */
  seek: (time: number) => {
    const { audioElement } = get();

    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  /**
   * オーディオリソースをクリーンアップする関数
   * オーディオ要素を停止し、AudioContextを閉じ、すべての状態をリセットします
   */
  cleanup: () => {
    const state = get();

    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.src = "";
      state.audioElement.load();
    }

    if (state.audioContext) {
      state.audioContext.close();
    }
    // すべての状態をリセット
    set({
      audioContext: null,
      analyser: null,
      audioElement: null,
      source: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      currentSongId: null,
      audioUrl: null,
      isEnded: false,
    });
  },

  /**
   * 再生状態を設定する関数
   *
   * @param isPlaying - 再生中かどうかのフラグ
   */
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  /**
   * 終了状態を設定する関数
   *
   * @param isEnded - 再生が終了したかどうかのフラグ
   */
  setIsEnded: (isEnded) => set({ isEnded }),
}));

export default useAudioWaveStore;
