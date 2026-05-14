import { renderHook, act } from "@testing-library/react";
import useSpotlightModal from "@/hooks/modal/useSpotlightModal";

describe("hooks/modal/useSpotlightModal", () => {
  const mockSpotlight = {
    id: "spotlight-1",
    title: "Test Spotlight",
    author: "Test Author",
    genre: "Test Genre",
    description: "Test Description",
    video_path: "/videos/test.mp4",
    image_path: "/images/test.jpg",
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    const { result } = renderHook(() => useSpotlightModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("初期状態ではモーダルが閉じており、selectedItemがnullである", () => {
    const { result } = renderHook(() => useSpotlightModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("onOpenで選択したアイテムと共にモーダルが開く", () => {
    const { result } = renderHook(() => useSpotlightModal());
    act(() => {
      result.current.onOpen(mockSpotlight);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toEqual(mockSpotlight);
  });

  it("onCloseでモーダルが閉じ、selectedItemがnullになる", () => {
    const { result } = renderHook(() => useSpotlightModal());
    act(() => {
      result.current.onOpen(mockSpotlight);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });
});
