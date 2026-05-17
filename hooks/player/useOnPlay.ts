import { useCallback } from "react";
import { Song } from "@/types";
import usePlayer from "./usePlayer";
import { createClient } from "@/libs/supabase/client";
import usePlayHistory from "./usePlayHistory";
import { useDebouncedCallback } from "use-debounce";

const DEFAULT_COOLDOWN = 1000;

/**
 * 曲の再生を管理するカスタムフック
 *
 * @param {Song[]} songs - 再生対象の曲リスト
 * @returns {function} 曲を再生する関数
 */
const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const supabase = createClient();
  const playHistory = usePlayHistory();

  // 再生処理のメイン関数
  const processPlay = useCallback(
    async (id: string) => {
      try {
        player.setIds(songs.map((song) => song.id));
        player.setId(id);

        // 改善: 1回のRPC呼び出しでアトミックにカウントアップ
        const { error: rpcError } = await supabase.rpc(
          "increment_song_play_count",
          { song_id: id }
        );

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw rpcError;
        }

        // 再生履歴を記録
        await playHistory.recordPlay(id);
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    },
    [player, songs, supabase, playHistory]
  );

  const onPlay = useCallback(
    (id: string) => {
      player.play();
      processPlay(id);
    },
    [player, processPlay]
  );

  // デバウンスされた再生関数を返す（初回は即時実行、以降はデバウンス）
  return useDebouncedCallback(onPlay, DEFAULT_COOLDOWN, { leading: true, trailing: false });
};

export default useOnPlay;
