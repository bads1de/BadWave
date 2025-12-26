import { render, waitFor } from "@testing-library/react";
import PlaybackStateProvider from "@/providers/PlaybackStateProvider";
import usePlayer from "@/hooks/player/usePlayer";
import usePlaybackStateStore from "@/hooks/stores/usePlaybackStateStore";

// モック
jest.mock("@/hooks/player/usePlayer");
jest.mock("@/hooks/stores/usePlaybackStateStore");

const mockSetId = jest.fn();
const mockSetIds = jest.fn();

describe("PlaybackStateProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      setId: mockSetId,
      setIds: mockSetIds,
    });
  });

  it("保存された再生状態がない場合は何もしないこと", () => {
    (usePlaybackStateStore as unknown as jest.Mock).mockReturnValue({
      songId: null,
      playlist: [],
      hasHydrated: true,
    });

    render(
      <PlaybackStateProvider>
        <div>Test Child</div>
      </PlaybackStateProvider>
    );

    expect(mockSetId).not.toHaveBeenCalled();
    expect(mockSetIds).not.toHaveBeenCalled();
  });

  it("ハイドレーション前は復元しないこと", () => {
    (usePlaybackStateStore as unknown as jest.Mock).mockReturnValue({
      songId: "song-123",
      playlist: ["song-1", "song-2"],
      hasHydrated: false,
    });

    render(
      <PlaybackStateProvider>
        <div>Test Child</div>
      </PlaybackStateProvider>
    );

    expect(mockSetId).not.toHaveBeenCalled();
    expect(mockSetIds).not.toHaveBeenCalled();
  });

  it("保存された再生状態がある場合にプレイヤーを設定すること", async () => {
    (usePlaybackStateStore as unknown as jest.Mock).mockReturnValue({
      songId: "song-123",
      playlist: ["song-1", "song-2", "song-3"],
      hasHydrated: true,
    });

    render(
      <PlaybackStateProvider>
        <div>Test Child</div>
      </PlaybackStateProvider>
    );

    await waitFor(() => {
      expect(mockSetIds).toHaveBeenCalledWith(["song-1", "song-2", "song-3"]);
      expect(mockSetId).toHaveBeenCalledWith("song-123");
    });
  });

  it("プレイリストが空の場合はsetIdsを呼ばないこと", async () => {
    (usePlaybackStateStore as unknown as jest.Mock).mockReturnValue({
      songId: "song-123",
      playlist: [],
      hasHydrated: true,
    });

    render(
      <PlaybackStateProvider>
        <div>Test Child</div>
      </PlaybackStateProvider>
    );

    await waitFor(() => {
      expect(mockSetIds).not.toHaveBeenCalled();
      expect(mockSetId).toHaveBeenCalledWith("song-123");
    });
  });

  it("子コンポーネントをレンダリングすること", () => {
    (usePlaybackStateStore as unknown as jest.Mock).mockReturnValue({
      songId: null,
      playlist: [],
      hasHydrated: true,
    });

    const { getByText } = render(
      <PlaybackStateProvider>
        <div>Test Child Content</div>
      </PlaybackStateProvider>
    );

    expect(getByText("Test Child Content")).toBeInTheDocument();
  });
});
