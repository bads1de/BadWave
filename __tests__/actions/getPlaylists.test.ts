import getPlaylists from "@/actions/getPlaylists";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPlaylists", () => {
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

  it("should return playlists for authenticated user", async () => {
    const mockUserId = "user-123";
    const mockData = [{ id: "1", name: "My Playlist", user_id: mockUserId }];
    
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
    });
    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await getPlaylists();

    expect(mockSupabase.from).toHaveBeenCalledWith("playlists");
    expect(mockEq).toHaveBeenCalledWith("user_id", mockUserId);
    expect(result).toEqual(mockData);
  });

  it("should return empty array if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await getPlaylists();

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("should handle db error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "DB Error" },
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    await expect(getPlaylists()).rejects.toThrow("DB Error");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
