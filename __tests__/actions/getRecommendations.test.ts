import * as React from "react";
import getRecommendations from "@/actions/getRecommendations";
import { createClient } from "@/libs/supabase/server";

// モックの作成
jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("getRecommendations", () => {
  // テスト用のモックデータ
  const mockUser = { id: "test-user-id" };
  const mockRecommendations = [
    {
      id: "song2",
      title: "Song 2",
      author: "Author 2",
      song_path: "path/to/song2",
      image_path: "path/to/image2",
      genre: "Pop",
      count: "20",
      like_count: "15",
      created_at: "2023-01-02",
      recommendation_score: "0.9",
    },
    {
      id: "song1",
      title: "Song 1",
      author: "Author 1",
      song_path: "path/to/song1",
      image_path: "path/to/image1",
      genre: "Rock",
      count: "10",
      like_count: "5",
      created_at: "2023-01-01",
      recommendation_score: "0.8",
    },
    {
      id: "song3",
      title: "Song 3",
      author: "Author 3",
      song_path: "path/to/song3",
      image_path: "path/to/image3",
      genre: "Jazz",
      count: "5",
      like_count: "2",
      created_at: "2023-01-03",
      recommendation_score: "0.7",
    },
  ];

  // モックのセットアップ
  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
    rpc: jest
      .fn()
      .mockResolvedValue({ data: mockRecommendations, error: null }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("ユーザーIDがない場合は空の配列を返す", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
    });
    const result = await getRecommendations();
    expect(result).toEqual([]);
  });

  it("推薦曲を取得して推薦スコアでソートする", async () => {
    const result = await getRecommendations();

    // RPCが正しいパラメータで呼び出されたことを確認
    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_recommendations", {
      p_user_id: mockUser.id,
      p_limit: 10,
    });

    // 結果が推薦スコアの降順でソートされていることを確認
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("song2"); // 最も高いスコア (0.9)
    expect(result[1].id).toBe("song1"); // 2番目に高いスコア (0.8)
    expect(result[2].id).toBe("song3"); // 最も低いスコア (0.7)
  });

  it("RPCがエラーを返した場合は空の配列を返す", async () => {
    (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error("Test error"),
    });
    const result = await getRecommendations();
    expect(result).toEqual([]);
  });

  it("データが空の場合は空の配列を返す", async () => {
    (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: [],
      error: null,
    });
    const result = await getRecommendations();
    expect(result).toEqual([]);
  });

  it("データが配列でない場合は空の配列を返す", async () => {
    (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: null,
    });
    const result = await getRecommendations();
    expect(result).toEqual([]);
  });

  it("例外が発生した場合は空の配列を返す", async () => {
    (mockSupabase.rpc as jest.Mock).mockRejectedValueOnce(
      new Error("Test exception")
    );
    const result = await getRecommendations();
    expect(result).toEqual([]);
  });
});
