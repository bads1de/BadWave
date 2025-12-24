import { renderHook } from "@testing-library/react";
import usePlayHistory from "@/hooks/player/usePlayHistory";
import { createClient } from "@/libs/supabase/client";

jest.mock("@/libs/supabase/client", () => {
  const mockFrom = jest.fn().mockReturnValue({
    insert: jest.fn(() => Promise.resolve({ error: null })),
  });

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
    })),
  };
});

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(() => ({
    userDetails: { id: "test-user-id" },
  })),
}));

describe("usePlayHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("songIdが空文字列の場合、再生履歴を記録しないこと", async () => {
    const mockFrom = jest.fn();
    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });

    const { result } = renderHook(() => usePlayHistory());
    await result.current.recordPlay("");

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("再生履歴を正常に記録できること", async () => {
    const mockSongId = "test-song-id";
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ error: null })),
    });

    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });

    const { result } = renderHook(() => usePlayHistory());
    await result.current.recordPlay(mockSongId);

    expect(mockFrom).toHaveBeenCalledWith("play_history");
    expect(mockFrom("play_history").insert).toHaveBeenCalledWith({
      user_id: "test-user-id",
      song_id: mockSongId,
    });
  });

  it("ユーザーがログインしていない場合、再生履歴を記録しないこと", async () => {
    require("@/hooks/auth/useUser").useUser.mockImplementationOnce(() => ({
      userDetails: null,
    }));

    const mockFrom = jest.fn();
    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });

    const { result } = renderHook(() => usePlayHistory());
    await result.current.recordPlay("test-song-id");

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("Supabaseのエラーを適切に処理できること", async () => {
    const mockError = { message: "Database error" };
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const mockInsert = jest.fn(() => Promise.resolve({ error: mockError }));
    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
    });

    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });

    const { result } = renderHook(() => usePlayHistory());
    await result.current.recordPlay("test-song-id");

    expect(mockFrom).toHaveBeenCalledWith("play_history");
    expect(mockInsert).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "再生の記録中にエラーが発生しました:",
      mockError
    );

    consoleSpy.mockRestore();
  });
});
