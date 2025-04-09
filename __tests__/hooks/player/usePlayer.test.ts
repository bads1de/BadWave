import { act, renderHook } from "@testing-library/react";
import usePlayer from "@/hooks/player/usePlayer";

describe("usePlayer", () => {
  beforeEach(() => {
    // 各テストの前にstoreをリセット
    const { result } = renderHook(() => usePlayer());
    act(() => {
      result.current.reset();
    });
  });

  describe("基本機能", () => {
    it("初期値が正しく設定されていること", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.ids).toEqual([]);
      expect(result.current.activeId).toBeUndefined();
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.isShuffling).toBe(false);
      expect(result.current.shuffledIds).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("activeIdを設定できること", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setId("test-id");
      });

      expect(result.current.activeId).toBe("test-id");
    });

    it("idsを設定できること", () => {
      const { result } = renderHook(() => usePlayer());
      const testIds = ["1", "2", "3"];

      act(() => {
        result.current.setIds(testIds);
      });

      expect(result.current.ids).toEqual(testIds);
    });
  });

  describe("再生コントロール", () => {
    it("リピートをトグルできること", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.toggleRepeat();
      });

      expect(result.current.isRepeating).toBe(true);

      act(() => {
        result.current.toggleRepeat();
      });

      expect(result.current.isRepeating).toBe(false);
    });

    it("シャッフルをトグルし、シャッフルされたプレイリストを作成できること", () => {
      const { result } = renderHook(() => usePlayer());
      const testIds = ["1", "2", "3", "4", "5"];

      act(() => {
        result.current.setIds(testIds);
        result.current.toggleShuffle();
      });

      expect(result.current.isShuffling).toBe(true);
      expect(result.current.shuffledIds).toHaveLength(testIds.length);
      expect(result.current.shuffledIds).not.toEqual(testIds);
    });
  });

  describe("ナビゲーション", () => {
    const setupPlaylist = (result: any) => {
      act(() => {
        result.current.setIds(["1", "2", "3"]);
        result.current.setId("2");
      });
    };

    it("通常モードで次の曲のIDを取得できること", () => {
      const { result } = renderHook(() => usePlayer());
      setupPlaylist(result);

      const nextId = result.current.getNextSongId();
      expect(nextId).toBe("3");
    });

    it("通常モードで前の曲のIDを取得できること", () => {
      const { result } = renderHook(() => usePlayer());
      setupPlaylist(result);

      const previousId = result.current.getPreviousSongId();
      expect(previousId).toBe("1");
    });
  });
});
