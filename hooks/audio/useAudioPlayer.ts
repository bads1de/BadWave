import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import usePlayer from "@/hooks/player/usePlayer";
import { isMobile } from "react-device-detect";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import useAudioWaveStore, {
  globalAudioPlayerRef,
} from "@/hooks/audio/useAudioWave";
import useVolumeStore from "@/hooks/stores/useVolumeStore";
import usePlaybackStateStore, {
  POSITION_SAVE_INTERVAL_MS,
} from "@/hooks/stores/usePlaybackStateStore";

/**
 * オーディオプレイヤーの状態と操作を管理するカスタムフック
 *
 * @param {string} songUrl - 再生する曲のURL
 * @returns {Object} プレイヤーの状態と操作関数を含むオブジェクト
 * @property {React.ComponentType} Icon - 再生/一時停止アイコン
 * @property {React.ComponentType} VolumeIcon - 音量アイコン
 * @property {string} formattedCurrentTime - フォーマットされた現在の再生時間
 * @property {string} formattedDuration - フォーマットされた曲の長さ
 * @property {function} toggleMute - ミュート切り替え関数
 * @property {number} volume - 現在の音量
 * @property {function} setVolume - 音量設定関数
 * @property {React.RefObject} audioRef - オーディオ要素への参照
 * @property {number} currentTime - 現在の再生時間（秒）
 * @property {number} duration - 曲の長さ（秒）
 * @property {boolean} isPlaying - 再生中かどうか
 * @property {boolean} isRepeating - リピート再生中かどうか
 * @property {boolean} isShuffling - シャッフル再生中かどうか
 * @property {function} handlePlay - 再生/一時停止切り替え関数
 * @property {function} handleSeek - シーク操作関数
 * @property {function} onPlayNext - 次の曲を再生する関数
 * @property {function} onPlayPrevious - 前の曲を再生する関数
 * @property {function} toggleRepeat - リピート切り替え関数
 * @property {function} toggleShuffle - シャッフル切り替え関数
 */
const useAudioPlayer = (songUrl: string) => {
  const player = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // モバイルは固定値1を使用、デスクトップはストアから取得
  const [mobileVolume, setMobileVolume] = useState(1);
  const { volume: storedVolume, setVolume: setStoredVolume } = useVolumeStore();

  // モバイルかデスクトップかで使用するボリュームを切り替え
  const volume = isMobile ? mobileVolume : storedVolume;
  const setVolume = isMobile ? setMobileVolume : setStoredVolume;

  const audioRef = useRef<HTMLAudioElement>(null);
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
  } = usePlaybackStateStore();
  const lastSaveTimeRef = useRef<number>(0);
  const hasRestoredRef = useRef<boolean>(false);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  // グローバル参照にメインプレイヤーの情報を登録
  useEffect(() => {
    globalAudioPlayerRef.mainPlayerAudioRef = audioRef.current;
    globalAudioPlayerRef.pauseMainPlayer = () => setIsPlaying(false);

    return () => {
      globalAudioPlayerRef.mainPlayerAudioRef = null;
      globalAudioPlayerRef.pauseMainPlayer = null;
    };
  }, []);

  const handlePlay = useCallback(() => {
    // 再生を開始する場合、波形プレイヤーを停止する
    if (!isPlaying) {
      pauseWavePlayer();
      globalAudioPlayerRef.activePlayer = "main";
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, pauseWavePlayer]);

  const handleSeek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        // シーク時に再生位置を保存
        const activeId = player.activeId;
        if (activeId) {
          savePlaybackState(activeId, time, player.ids);
        }
      }
    },
    [player.activeId, player.ids, savePlaybackState]
  );

  // 次の曲を再生する関数
  const onPlayNext = useCallback(() => {
    if (isRepeating) {
      player.toggleRepeat();
    }
    const nextSongId = player.getNextSongId();
    if (nextSongId) {
      player.setId(nextSongId);
    }
  }, [isRepeating, player]);

  // 前の曲を再生する関数
  const onPlayPrevious = useCallback(() => {
    if (isRepeating) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      const prevSongId = player.getPreviousSongId();
      if (prevSongId) {
        player.setId(prevSongId);
      }
    }
  }, [isRepeating, player]);

  // リピート切り替え関数
  const toggleRepeat = useCallback(() => {
    player.toggleRepeat();
  }, [player]);

  // シャッフル切り替え関数
  const toggleShuffle = useCallback(() => {
    player.toggleShuffle();
  }, [player]);

  // オーディオ要素のイベントリスナーを設定
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        onPlayNext();
      }
    };
    const handleCanPlayThrough = () => audio.play();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      // 一時停止時に再生位置を保存
      const activeId = player.activeId;
      if (activeId) {
        savePlaybackState(activeId, audio.currentTime, player.ids);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [songUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
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
  }, [songUrl]);

  // 定期的な再生位置の保存（5秒ごと、デバウンス）
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;
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
  }, [isPlaying, player.activeId, updatePosition]);

  // ページ離脱時に再生位置を保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      const audio = audioRef.current;
      const activeId = player.activeId;
      if (audio && activeId) {
        savePlaybackState(activeId, audio.currentTime, player.ids);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [player.activeId, player.ids, savePlaybackState]);

  // 保存された再生位置から復元
  useEffect(() => {
    const audio = audioRef.current;
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
  }, [playbackStateHydrated, savedSongId, savedPosition, player.activeId]);

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

  const handleVolumeClick = useCallback(() => {
    setShowVolumeSlider((prev) => !prev);
  }, []);

  return {
    Icon,
    VolumeIcon,
    formattedCurrentTime,
    formattedDuration,
    volume,
    setVolume,
    showVolumeSlider,
    setShowVolumeSlider,
    handleVolumeClick,
    audioRef,
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
