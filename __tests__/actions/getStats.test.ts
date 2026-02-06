import { getListeningStats } from "@/actions/getStats";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getStats", () => {
  let mockSupabase: any;
  let mockRpc: jest.Mock;
  let mockGetUser: jest.Mock;

  beforeEach(() => {
    mockGetUser = jest.fn();
    mockRpc = jest.fn();
    
    mockSupabase = {
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return null if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Auth Error" },
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const result = await getListeningStats();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should return user stats on success", async () => {
    const mockUser = { id: "user-123" };
    const mockStats = {
      total_plays: 100,
      total_play_time_minutes: 300,
      favorite_genres: [{ genre: "Pop", count: 50 }],
      most_played_songs: [],
      hourly_activity: [],
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: mockStats,
      error: null,
    });

    const result = await getListeningStats("week");

    expect(mockRpc).toHaveBeenCalledWith("get_user_stats", expect.objectContaining({
      target_user_id: mockUser.id,
      user_timezone: "Asia/Tokyo",
    }));
    expect(result).toEqual(mockStats);
  });

  it("should handle rpc error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "RPC Error" },
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const result = await getListeningStats();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("統計データの取得に失敗しました:", "RPC Error");
    consoleSpy.mockRestore();
  });
});
