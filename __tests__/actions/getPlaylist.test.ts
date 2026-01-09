import getPlaylist from "@/actions/getPlaylist";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPlaylist", () => {
  let mockSupabase: any;
  let mockSingle: jest.Mock;
  let mockEq: jest.Mock;

  beforeEach(() => {
    mockSingle = jest.fn();
    mockEq = jest.fn(() => ({ single: mockSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return playlist if found", async () => {
    const mockPlaylist = { id: "123", name: "My Playlist" };
    mockSingle.mockResolvedValue({ data: mockPlaylist, error: null });

    const result = await getPlaylist("123");

    expect(mockEq).toHaveBeenCalledWith("id", "123");
    expect(result).toEqual(mockPlaylist);
  });

  it("should return null if playlist not found (PGRST116)", async () => {
    mockSingle.mockResolvedValue({ 
      data: null, 
      error: { code: "PGRST116", message: "Not found" } 
    });

    const result = await getPlaylist("999");

    expect(result).toBeNull();
  });

  it("should throw error for other errors", async () => {
    mockSingle.mockResolvedValue({ 
      data: null, 
      error: { code: "500", message: "DB Error" } 
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getPlaylist("fail")).rejects.toThrow("DB Error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
