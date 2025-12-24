import { useRef, useCallback, useMemo, useEffect } from "react";
import { Song } from "@/types";
import usePlayer from "./usePlayer";
import { createClient } from "@/libs/supabase/client";
import usePlayHistory from "./usePlayHistory";

const DEFAULT_COOLDOWN = 300; // クールダウンを300msに短縮

/**
 * 曲の再生を管理するカスタムフック
 *
 * @param {Song[]} songs - 再生対象の曲リスト
 * @returns {function} 曲を再生する関数
 */
const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const supabase = useMemo(() => createClient(), []);
  const cooldownRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPlayRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const playHistory = usePlayHistory();

  // 再生処理のメイン関数（非同期でバックグラウンド実行）
  const processPlayAsync = useCallback(
    async (id: string) => {
      try {
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
    [supabase, playHistory]
  );

  // ペンディング中の再生を処理
  const processPendingPlay = useCallback(() => {
    if (pendingPlayRef.current && !isProcessingRef.current) {
      const pendingId = pendingPlayRef.current;
      pendingPlayRef.current = null;

      // 即座にプレイヤー状態を更新
      player.setIds(songs.map((song) => song.id));
      player.setId(pendingId);

      // バックグラウンドで再生カウント等を処理
      processPlayAsync(pendingId);
    }
  }, [player, songs, processPlayAsync]);

  const onPlay = useCallback(
    (id: string) => {
      // 常に最新のクリックを保存
      pendingPlayRef.current = id;

      // クールダウン中の場合は終了（タイマーで後から処理される）
      if (cooldownRef.current) {
        return;
      }

      // 処理中フラグを立てる
      isProcessingRef.current = true;
      cooldownRef.current = true;

      // 即座にプレイヤー状態を更新（UIのレスポンスを優先）
      player.setIds(songs.map((song) => song.id));
      player.setId(id);
      pendingPlayRef.current = null;

      // バックグラウンドで再生カウント等を処理（awaitしない）
      processPlayAsync(id).finally(() => {
        isProcessingRef.current = false;
      });

      // クールダウン後にペンディング中の再生を処理
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        cooldownRef.current = false;
        processPendingPlay();
      }, DEFAULT_COOLDOWN);
    },
    [player, songs, processPlayAsync, processPendingPlay]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return onPlay;
};

export default useOnPlay;
