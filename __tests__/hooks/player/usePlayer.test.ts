import { renderHook, act } from "@testing-library/react";
import usePlayer from "@/hooks/player/usePlayer";

describe("hooks/player/usePlayer", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => usePlayer());
    act(() => {
      result.current.reset();
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePlayer());
    expect(result.current.ids).toEqual([]);
    expect(result.current.activeId).toBeUndefined();
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.isShuffling).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should set active ID", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => {
      result.current.setId("1");
    });
    expect(result.current.activeId).toBe("1");
  });

  it("should set IDs list", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3"];
    act(() => {
      result.current.setIds(ids);
    });
    expect(result.current.ids).toEqual(ids);
  });

  it("should toggle repeat", () => {
    const { result } = renderHook(() => usePlayer());
    expect(result.current.isRepeating).toBe(false);
    act(() => {
      result.current.toggleRepeat();
    });
    expect(result.current.isRepeating).toBe(true);
    act(() => {
      result.current.toggleRepeat();
    });
    expect(result.current.isRepeating).toBe(false);
  });

  it("should toggle shuffle and generate shuffled IDs", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3", "4", "5"];
    act(() => {
      result.current.setIds(ids);
      result.current.toggleShuffle();
    });
    expect(result.current.isShuffling).toBe(true);
    expect(result.current.shuffledIds).toHaveLength(ids.length);
    expect(result.current.shuffledIds).not.toEqual(ids); // Likely not equal, but technically possible to be same order
    expect(result.current.shuffledIds.sort()).toEqual(ids.sort()); // Same elements
  });

  it("should get next song ID correctly", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3"];
    
    act(() => {
      result.current.setIds(ids);
      result.current.setId("1");
    });

    // Normal sequence
    expect(result.current.getNextSongId()).toBe("2");

    act(() => {
      result.current.setId("3");
    });
    // Loop back to start
    expect(result.current.getNextSongId()).toBe("1");

    // Repeat mode
    act(() => {
      result.current.toggleRepeat();
    });
    expect(result.current.getNextSongId()).toBe("3"); // Should stay on same song
  });

  it("should get previous song ID correctly", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3"];
    
    act(() => {
      result.current.setIds(ids);
      result.current.setId("2");
    });

    // Normal sequence
    expect(result.current.getPreviousSongId()).toBe("1");

    act(() => {
      result.current.setId("1");
    });
    // Loop back to end
    expect(result.current.getPreviousSongId()).toBe("3");
  });
});