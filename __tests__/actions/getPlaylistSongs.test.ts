import getPlaylistSongs from "@/actions/getPlaylistSongs";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPlaylistSongs", () => {
  let mockSupabase: any;
  let mockGetUser: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockOrder: jest.Mock;

  beforeEach(() => {
    mockGetUser = jest.fn();
    mockSingle = jest.fn();
    mockOrder = jest.fn();
    mockEq = jest.fn();

    // Setup generic chain for playlist info
    mockEq.mockImplementation(() => ({ single: mockSingle }));
    
    // Setup generic chain for playlist songs
    // Needs to handle multiple .eq calls.
    // select -> eq -> eq -> order
    const mockOrderChain = { order: mockOrder };
    const mockEqChain2 = { eq: () => mockOrderChain };
    const mockEqChain1 = { eq: () => mockEqChain2 };
    
    // Mock select. It's called twice with different params.
    const mockSelect = jest.fn().mockImplementation((query) => {
      if (query.includes("is_public")) {
        // Playlist info query
        return { eq: () => ({ single: mockSingle }) };
      } else {
        // Playlist songs query
        return { 
          eq: (field: string) => {
            if (field === "playlist_id") return { 
              eq: () => ({ order: mockOrder })
            };
            return { order: mockOrder };
          }
        };
      }
    });

    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      auth: { getUser: mockGetUser },
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("returns songs for public playlist", async () => {
    const mockPlaylist = { is_public: true, user_id: "owner-1" };
    const mockSongsData = [{ songs: { id: "1", title: "Song 1" } }];

    mockSingle.mockResolvedValue({ data: mockPlaylist, error: null });
    mockGetUser.mockResolvedValue({ data: { user: null } }); // Guest user
    mockOrder.mockResolvedValue({ data: mockSongsData, error: null });

    const result = await getPlaylistSongs("playlist-1");

    expect(result).toEqual([{ id: "1", title: "Song 1", songType: "regular" }]);
  });

  it("returns empty array for private playlist if user not owner", async () => {
    const mockPlaylist = { is_public: false, user_id: "owner-1" };

    mockSingle.mockResolvedValue({ data: mockPlaylist, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "other-user" } } });

    const result = await getPlaylistSongs("playlist-1");

    expect(result).toEqual([]);
    expect(mockOrder).not.toHaveBeenCalled(); // Songs fetch skipped
  });

  it("returns songs for private playlist if user is owner", async () => {
    const mockPlaylist = { is_public: false, user_id: "owner-1" };
    const mockSongsData = [{ songs: { id: "1", title: "Private Song" } }];

    mockSingle.mockResolvedValue({ data: mockPlaylist, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-1" } } });
    mockOrder.mockResolvedValue({ data: mockSongsData, error: null });

    const result = await getPlaylistSongs("playlist-1");

    expect(result).toEqual([{ id: "1", title: "Private Song", songType: "regular" }]);
  });
});
