import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Song } from "@/types";
import usePlayer from "./usePlayer";
import { createClient } from "@/libs/supabase/client";
import usePlayHistory from "./usePlayHistory";

const DEFAULT_COOLDOWN = 1000;

// デバウンス関数を定義（クリーンアップを考慮）
const createDebounce = (wait: number) => {
  let timeout: NodeJS.Timeout;

  return (func: (...args: any[]) => void) => {
    const debounced = (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };

    debounced.clear = () => clearTimeout(timeout);
    return debounced;
  };
};

/**
 * 曲の再生を管理するカスタムフック
 *
 * @param {Song[]} songs - 再生対象の曲リスト
 * @returns {function} 曲を再生する関数
 */
// プレイヤーの再生イベントを処理するカスタムフック
const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const supabase = useMemo(() => createClient(), []);
  const [lastPlayTime, setLastPlayTime] = useState<number>(0);
  const cooldownRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPlayRef = useRef<string | null>(null);
  const playHistory = usePlayHistory();

  // 再生処理のメイン関数
  const processPlay = useCallback(
    async (id: string) => {
      try {
        // プレイヤーの状態を設定（setIdsを先に呼び出してからsetId）
        player.setIds(songs.map((song) => song.id));
        player.setId(id);

        // songデータを取得
        const { data: songData, error: selectError } = await supabase
          .from("songs")
          .select("count")
          .eq("id", id)
          .single();

        if (selectError || !songData) throw selectError;

        // カウントをインクリメント
        const { data: incrementedCount, error: incrementError } =
          await supabase.rpc("increment", { x: songData.count });

        if (incrementError) throw incrementError;

        // インクリメントされたカウントでsongを更新
        const { error: updateError } = await supabase
          .from("songs")
          .update({ count: incrementedCount })
          .eq("id", id);

        if (updateError) throw updateError;

        // 再生履歴を記録
        await playHistory.recordPlay(id);
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    },
    [player, songs, supabase, playHistory]
  );

  const onPlay = useCallback(
    async (id: string) => {
      const currentTime = Date.now();

      // クールダウン中の場合、再生をペンディングする
      if (cooldownRef.current) {
        pendingPlayRef.current = id;
        return;
      }

      // 前回の再生からクールダウン時間が経過していない場合、再生をペンディングする
      if (currentTime - lastPlayTime < DEFAULT_COOLDOWN) {
        pendingPlayRef.current = id;
        return;
      }

      // クールダウンフラグを設定し、最終再生時間を更新
      cooldownRef.current = true;
      setLastPlayTime(currentTime);

      // 再生を開始し、処理を実行
      player.play();
      await processPlay(id);

      // クールダウン後の処理
      timerRef.current = setTimeout(async () => {
        cooldownRef.current = false;
        if (pendingPlayRef.current) {
          const pendingId = pendingPlayRef.current;
          pendingPlayRef.current = null;
          await onPlay(pendingId);
        }
      }, DEFAULT_COOLDOWN);
    },
    [lastPlayTime, player, processPlay]
  );

  // デバウンス関数をメモ化
  const debounce = useMemo(() => createDebounce(DEFAULT_COOLDOWN), []);

  // デバウンスされた再生関数
  const debouncedOnPlay = useMemo(() => debounce(onPlay), [debounce, onPlay]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (debouncedOnPlay.clear) debouncedOnPlay.clear();
    };
  }, [debouncedOnPlay]);

  return debouncedOnPlay;
};

export default useOnPlay;
