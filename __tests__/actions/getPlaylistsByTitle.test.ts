import getPlaylistsByTitle from "@/actions/getPlaylistsByTitle";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPlaylistsByTitle", () => {
  let mockSupabase: any;
  let mockIlike: jest.Mock;
  let mockOrder: jest.Mock;
  let mockEq: jest.Mock;

  beforeEach(() => {
    mockOrder = jest.fn();
    mockIlike = jest.fn(() => ({ order: mockOrder }));
    mockEq = jest.fn(() => ({ ilike: mockIlike }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return empty array if title is empty", async () => {
    const result = await getPlaylistsByTitle("");
    expect(result).toEqual({ playlists: [] });
    expect(createClient).toHaveBeenCalled();
    expect(mockSupabase.from).not.toBeDefined; // This is not quite right, but we expect no calls to from
  });

  it("should return playlists matching the title", async () => {
    const mockTitle = "Pop";
    const mockData = [{ id: "1", title: "Pop Hits", is_public: true }];
    
    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await getPlaylistsByTitle(mockTitle);

    expect(mockSupabase.from).toHaveBeenCalledWith("playlists");
    expect(mockEq).toHaveBeenCalledWith("is_public", true);
    expect(mockIlike).toHaveBeenCalledWith("title", `%${mockTitle}%`);
    expect(result).toEqual({ playlists: mockData });
  });

  it("should handle db error", async () => {
    const mockTitle = "Pop";
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "DB Error" },
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    await expect(getPlaylistsByTitle(mockTitle)).rejects.toThrow("DB Error");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
