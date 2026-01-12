import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import usePlayer from "@/hooks/player/usePlayer";
import { isMobile } from "react-device-detect";
import useAudioWaveStore, {
  globalAudioPlayerRef,
} from "@/hooks/audio/useAudioWave";
import useVolumeStore from "@/hooks/stores/useVolumeStore";
import usePlaybackStateStore, {
  POSITION_SAVE_INTERVAL_MS,
} from "@/hooks/stores/usePlaybackStateStore";
import useLatestRef from "@/hooks/utils/useLatestRef";
import { AudioEngine } from "@/libs/audio/AudioEngine";

/**
 * オーディオプレイヤーの状態と操作を管理するカスタムフック
 *
 * @param {string} songUrl - 再生する曲のURL
 * @returns {Object} プレイヤーの状態と操作関数を含むオブジェクト
 */
const useAudioPlayer = (songUrl: string) => {
  const player = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // モバイルは固定値1を使用、デスクトップはストアから取得
  const [mobileVolume, setMobileVolume] = useState(1);
  const { volume: storedVolume, setVolume: setStoredVolume } = useVolumeStore();

  // モバイルかデスクトップかで使用するボリュームを切り替え
  const volume = isMobile ? mobileVolume : storedVolume;
  const setVolume = isMobile ? setMobileVolume : setStoredVolume;

  const isRepeating = usePlayer((state) => state.isRepeating);
  const isShuffling = usePlayer((state) => state.isShuffling);

  // 波形プレイヤーの停止関数を取得
  const pauseWavePlayer = useAudioWaveStore((state) => state.pause);

  // 再生状態の保存用
  const {
    savePlaybackState,
    updatePosition,
    songId: savedSongId,
    position: savedPosition,
    hasHydrated: playbackStateHydrated,
    isRestoring,
    setIsRestoring,
  } = usePlaybackStateStore();
  const lastSaveTimeRef = useRef<number>(0);
  const hasRestoredRef = useRef<boolean>(false);

  // --- useLatestRef: イベントリスナー内から最新の状態を参照するため ---
  const isRestoringRef = useLatestRef(isRestoring);

  // AudioEngineからaudio要素を取得
  const engine = AudioEngine.getInstance();
  const audio = engine.audio;

  // 初期化時にAudioEngineを初期化
  useEffect(() => {
    if (!engine.isInitialized) {
      engine.initialize();
    }
  }, [engine]);

  // グローバル参照にメインプレイヤーの情報を登録
  useEffect(() => {
    globalAudioPlayerRef.mainPlayerAudioRef = audio;
    globalAudioPlayerRef.pauseMainPlayer = () => setIsPlaying(false);

    return () => {
      globalAudioPlayerRef.mainPlayerAudioRef = null;
      globalAudioPlayerRef.pauseMainPlayer = null;
    };
  }, [audio]);

  const handlePlay = useCallback(() => {
    // 再生を開始する場合、波形プレイヤーを停止する
    if (!isPlaying) {
      pauseWavePlayer();
      globalAudioPlayerRef.activePlayer = "main";
      // 復元中フラグをクリア（以降は通常の自動再生を許可）
      if (isRestoring) {
        setIsRestoring(false);
      }
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, pauseWavePlayer, isRestoring, setIsRestoring]);

  const handleSeek = useCallback(
    (time: number) => {
      if (audio) {
        audio.currentTime = time;
        setCurrentTime(time);
        // シーク時に再生位置を保存
        const activeId = player.activeId;
        if (activeId) {
          savePlaybackState(activeId, time, player.ids);
        }
      }
    },
    [player.activeId, player.ids, savePlaybackState, audio]
  );

  // 次の曲を再生する関数
  const onPlayNext = useCallback(() => {
    const nextSongId = player.getNextSongId();
    if (nextSongId) {
      player.setId(nextSongId);
    }
  }, [player]);

  // onPlayNextをRef経由で参照
  const onPlayNextRef = useRef(onPlayNext);

  // 前の曲を再生する関数
  const onPlayPrevious = useCallback(() => {
    if (isRepeating) {
      if (audio) {
        audio.currentTime = 0;
      }
    } else {
      const prevSongId = player.getPreviousSongId();
      if (prevSongId) {
        player.setId(prevSongId);
      }
    }
  }, [isRepeating, player, audio]);

  // リピート切り替え関数
  const toggleRepeat = useCallback(() => {
    player.toggleRepeat();
  }, [player]);

  // シャッフル切り替え関数
  const toggleShuffle = useCallback(() => {
    player.toggleShuffle();
  }, [player]);

  useEffect(() => {
    onPlayNextRef.current = onPlayNext;
  }, [onPlayNext]);

  // audio.loopをisRepeatingと同期（リピート時はブラウザネイティブで処理）
  useEffect(() => {
    if (audio) {
      audio.loop = isRepeating;
    }
  }, [isRepeating, audio]);

  // オーディオ要素のイベントリスナーを設定
  useEffect(() => {
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    // audio.loop=true の時は ended イベントが発火しないため、次曲処理のみ
    const handleEnded = () => {
      onPlayNextRef.current();
    };

    const handleCanPlayThrough = () => {
      if (!isRestoringRef.current) {
        audio.play().catch((e) => console.error("Auto-play failed:", e));
      }
    };

    const handlePlayEvent = () => {
        setIsPlaying(true);
        engine.resumeContext();
    };

    const handlePause = () => {
      setIsPlaying(false);
      const activeId = player.activeId;
      if (activeId) {
        savePlaybackState(activeId, audio.currentTime, player.ids);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songUrl, audio]);

  useEffect(() => {
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => console.error("Play failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  useEffect(() => {
    if (!audio) return;
    audio.volume = volume;
  }, [volume, audio]);

  useEffect(() => {
    if (!audio || !songUrl) return;

    // 前の曲を停止してリセット
    audio.pause();
    setCurrentTime(0);
    setDuration(0);

    // 新しいソースを設定
    audio.src = songUrl;
    audio.currentTime = 0;

    // 明示的にロードして再生を開始
    audio.load();
  }, [songUrl, audio]);

  // 定期的な再生位置の保存（5秒ごと、デバウンス）
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const activeId = player.activeId;
      if (audio && activeId) {
        const now = Date.now();
        if (now - lastSaveTimeRef.current >= POSITION_SAVE_INTERVAL_MS) {
          updatePosition(audio.currentTime);
          lastSaveTimeRef.current = now;
        }
      }
    }, POSITION_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPlaying, player.activeId, updatePosition, audio]);

  // ページ離脱時に再生位置を保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      const activeId = player.activeId;
      if (audio && activeId) {
        savePlaybackState(activeId, audio.currentTime, player.ids);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [player.activeId, player.ids, savePlaybackState, audio]);

  // 保存された再生位置から復元
  useEffect(() => {
    if (
      !audio ||
      !playbackStateHydrated ||
      hasRestoredRef.current ||
      !savedSongId ||
      !player.activeId
    ) {
      return;
    }

    // 保存された曲と現在の曲が一致する場合のみ復元
    if (savedSongId === player.activeId && savedPosition > 0) {
      const handleCanPlay = () => {
        if (!hasRestoredRef.current && savedPosition > 0) {
          audio.currentTime = savedPosition;
          hasRestoredRef.current = true;
        }
      };

      audio.addEventListener("canplay", handleCanPlay, { once: true });
      return () => audio.removeEventListener("canplay", handleCanPlay);
    }
  }, [playbackStateHydrated, savedSongId, savedPosition, player.activeId, audio]);

  const formatTime = useMemo(() => {
    return (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
  }, []);

  const formattedCurrentTime = useMemo(
    () => formatTime(currentTime),
    [currentTime, formatTime]
  );

  const formattedDuration = useMemo(
    () => formatTime(duration),
    [duration, formatTime]
  );

  return {
    formattedCurrentTime,
    formattedDuration,
    currentTime,
    duration,
    isPlaying,
    isRepeating,
    isShuffling,
    handlePlay,
    handleSeek,
    onPlayNext,
    onPlayPrevious,
    toggleRepeat,
    toggleShuffle,
  };
};

export default useAudioPlayer;