import { useCallback } from "react";
import { globalAudioPlayerRef } from "@/hooks/audio/useAudioWave";

/**
 * オーディオのグローバルな制御を行うためのカスタムフック
 * 
 * メインプレイヤーと波形プレイヤー（Pulseページなど）の間の
 * 相互作用を管理するために使用します。
 */
export const useAudioControl = () => {
  /**
   * メインプレイヤーを停止（一時停止）する関数
   */
  const stopMainPlayer = useCallback(() => {
    // 再生状態を更新
    if (globalAudioPlayerRef.pauseMainPlayer) {
      globalAudioPlayerRef.pauseMainPlayer();
    }

    // 実際のオーディオ要素を停止
    if (globalAudioPlayerRef.mainPlayerAudioRef) {
      globalAudioPlayerRef.mainPlayerAudioRef.pause();
    }
  }, []);

  /**
   * 現在のアクティブなプレイヤーを取得
   */
  const getActivePlayer = useCallback(() => {
    return globalAudioPlayerRef.activePlayer;
  }, []);

  /**
   * アクティブなプレイヤーを設定
   */
  const setActivePlayer = useCallback((player: "main" | "wave" | null) => {
    globalAudioPlayerRef.activePlayer = player;
  }, []);

  return {
    stopMainPlayer,
    getActivePlayer,
    setActivePlayer,
  };
};

export default useAudioControl;
