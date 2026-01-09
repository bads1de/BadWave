import getLikedSongs from "@/actions/getLikedSongs";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getLikedSongs", () => {
  let mockSupabase: any;
  let mockGetUser: jest.Mock;
  let mockEq: jest.Mock;
  let mockOrder: jest.Mock;

  beforeEach(() => {
    mockGetUser = jest.fn();
    mockOrder = jest.fn();
    mockEq = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return liked songs for authenticated user", async () => {
    const mockUserId = "user-123";
    const mockData = [
      {
        songs: {
          id: "song-1",
          title: "Liked Song 1",
          author: "Author 1",
        },
      },
    ];

    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
    });

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await getLikedSongs();

    expect(mockSupabase.from).toHaveBeenCalledWith("liked_songs_regular");
    expect(mockEq).toHaveBeenCalledWith("user_id", mockUserId);
    expect(result).toEqual([
      {
        id: "song-1",
        title: "Liked Song 1",
        author: "Author 1",
        songType: "regular",
      },
    ]);
  });

  it("should return empty array if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await getLikedSongs();

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("should return empty array if no liked songs found", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockOrder.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getLikedSongs();

    expect(result).toEqual([]);
  });

  it("should throw error on db failure", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "DB Error" },
    });
    
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getLikedSongs()).rejects.toThrow("DB Error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
