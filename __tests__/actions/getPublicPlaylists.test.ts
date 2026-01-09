import getPublicPlaylists from "@/actions/getPublicPlaylists";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPublicPlaylists", () => {
  let mockSupabase: any;
  let mockLimit: jest.Mock;
  let mockOrder: jest.Mock;
  let mockEq: jest.Mock;

  beforeEach(() => {
    mockLimit = jest.fn();
    mockOrder = jest.fn(() => ({ limit: mockLimit }));
    mockEq = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return public playlists", async () => {
    const mockData = [{ id: "1", name: "Public Playlist", is_public: true }];
    mockLimit.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await getPublicPlaylists();

    expect(mockSupabase.from).toHaveBeenCalledWith("playlists");
    expect(mockEq).toHaveBeenCalledWith("is_public", true);
    expect(mockOrder).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(6); // Default limit
    expect(result).toEqual(mockData);
  });

  it("should accept custom limit", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getPublicPlaylists(10);

    expect(mockLimit).toHaveBeenCalledWith(10);
  });
});
