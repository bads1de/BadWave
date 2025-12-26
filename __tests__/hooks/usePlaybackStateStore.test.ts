import usePlaybackStateStore, {
  POSITION_SAVE_INTERVAL_MS,
} from "@/hooks/stores/usePlaybackStateStore";
import { act, renderHook } from "@testing-library/react";

// Zustand の persist ミドルウェアをモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("usePlaybackStateStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // ストアの状態をリセット
    usePlaybackStateStore.setState({
      songId: null,
      position: 0,
      playlist: [],
      timestamp: 0,
      isRestoring: false,
    });
  });

  it("デフォルトの状態が空であること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());
    expect(result.current.songId).toBeNull();
    expect(result.current.position).toBe(0);
    expect(result.current.playlist).toEqual([]);
    expect(result.current.isRestoring).toBe(false);
  });

  it("savePlaybackStateで再生状態を保存できること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    act(() => {
      result.current.savePlaybackState("song-123", 45.5, ["song-1", "song-2"]);
    });

    expect(result.current.songId).toBe("song-123");
    expect(result.current.position).toBe(45.5);
    expect(result.current.playlist).toEqual(["song-1", "song-2"]);
    expect(result.current.timestamp).toBeGreaterThan(0);
  });

  it("updatePositionで再生位置のみを更新できること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    // 最初に曲を設定
    act(() => {
      result.current.savePlaybackState("song-123", 10, ["song-1"]);
    });

    // 位置のみを更新
    act(() => {
      result.current.updatePosition(30.5);
    });

    expect(result.current.songId).toBe("song-123");
    expect(result.current.position).toBe(30.5);
  });

  it("updatePositionは曲IDがない場合は何もしないこと", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    act(() => {
      result.current.updatePosition(30.5);
    });

    expect(result.current.position).toBe(0);
  });

  it("clearPlaybackStateで状態をクリアできること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    // 状態を設定
    act(() => {
      result.current.savePlaybackState("song-123", 45.5, ["song-1", "song-2"]);
    });

    // クリア
    act(() => {
      result.current.clearPlaybackState();
    });

    expect(result.current.songId).toBeNull();
    expect(result.current.position).toBe(0);
    expect(result.current.playlist).toEqual([]);
  });

  it("プレイリストを省略すると既存のプレイリストが維持されること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    // 最初にプレイリストを設定
    act(() => {
      result.current.savePlaybackState("song-123", 10, ["song-1", "song-2"]);
    });

    // プレイリストを省略して更新
    act(() => {
      result.current.savePlaybackState("song-456", 20);
    });

    expect(result.current.songId).toBe("song-456");
    expect(result.current.position).toBe(20);
    expect(result.current.playlist).toEqual(["song-1", "song-2"]);
  });

  it("POSITION_SAVE_INTERVAL_MSが5000msであること", () => {
    expect(POSITION_SAVE_INTERVAL_MS).toBe(5000);
  });

  it("setIsRestoringで復元中フラグを設定できること", () => {
    const { result } = renderHook(() => usePlaybackStateStore());

    expect(result.current.isRestoring).toBe(false);

    act(() => {
      result.current.setIsRestoring(true);
    });

    expect(result.current.isRestoring).toBe(true);

    act(() => {
      result.current.setIsRestoring(false);
    });

    expect(result.current.isRestoring).toBe(false);
  });
});
