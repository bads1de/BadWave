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

  it("should get next song ID in shuffle mode using shuffledIds order", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3", "4", "5"];

    act(() => {
      result.current.setIds(ids);
      result.current.setId("1");
      result.current.toggleShuffle();
    });

    const { shuffledIds } = result.current;
    const currentShuffleIndex = shuffledIds.indexOf("1");
    const expectedNext = shuffledIds[(currentShuffleIndex + 1) % shuffledIds.length];

    expect(result.current.getNextSongId()).toBe(expectedNext);
  });

  it("should get previous song ID in shuffle mode using shuffledIds order", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3", "4", "5"];

    act(() => {
      result.current.setIds(ids);
      result.current.setId("1");
      result.current.toggleShuffle();
    });

    const { shuffledIds } = result.current;
    const currentShuffleIndex = shuffledIds.indexOf("1");
    const expectedPrev = shuffledIds[(currentShuffleIndex - 1 + shuffledIds.length) % shuffledIds.length];

    expect(result.current.getPreviousSongId()).toBe(expectedPrev);
  });

  it("should wrap around shuffled list correctly", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3"];

    act(() => {
      result.current.setIds(ids);
      result.current.toggleShuffle();
    });

    const { shuffledIds } = result.current;

    // Set to last item in shuffled list
    act(() => {
      result.current.setId(shuffledIds[shuffledIds.length - 1]);
    });
    // Next should wrap to first
    expect(result.current.getNextSongId()).toBe(shuffledIds[0]);

    // Set to first item in shuffled list
    act(() => {
      result.current.setId(shuffledIds[0]);
    });
    // Previous should wrap to last
    expect(result.current.getPreviousSongId()).toBe(shuffledIds[shuffledIds.length - 1]);
  });

  it("should return undefined for next/previous when ids is empty", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.getNextSongId()).toBeUndefined();
    expect(result.current.getPreviousSongId()).toBeUndefined();
  });

  it("should return undefined when activeId not found in shuffle mode", () => {
    const { result } = renderHook(() => usePlayer());

    act(() => {
      result.current.setIds(["1", "2", "3"]);
      result.current.toggleShuffle();
      // activeId is still undefined after toggleShuffle
    });

    expect(result.current.getNextSongId()).toBeUndefined();
    expect(result.current.getPreviousSongId()).toBeUndefined();
  });

  it("should persist player state to localStorage", () => {
    const { result } = renderHook(() => usePlayer());
    const ids = ["1", "2", "3"];

    act(() => {
      result.current.setIds(ids);
      result.current.setId("2");
      result.current.toggleRepeat();
    });

    const stored = JSON.parse(localStorage.getItem("badwave-player") || "{}");
    expect(stored.state.ids).toEqual(ids);
    expect(stored.state.activeId).toBe("2");
    expect(stored.state.isRepeating).toBe(true);
  });

  it("should not persist isLoading", () => {
    const { result } = renderHook(() => usePlayer());

    act(() => {
      result.current.setIsLoading(true);
    });

    const stored = JSON.parse(localStorage.getItem("badwave-player") || "{}");
    expect(stored.state.isLoading).toBeUndefined();
  });
});