import { Pulse } from "@/types";
import { createClient } from "@/libs/supabase/server";

// モックの作成
jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

import getPulses from "@/actions/getPulses";

describe("getPulses", () => {
  // テスト用のモックデータ
  const mockPulses: Pulse[] = [
    {
      id: "1",
      title: "Test Pulse 1",
      genre: "Synthwave",
      music_path: "/test1.mp3",
    },
    {
      id: "2",
      title: "Test Pulse 2",
      genre: "Chillwave",
      music_path: "/test2.mp3",
    },
  ];

  // モックのセットアップ
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("データベースからPulseを取得する", async () => {
    mockSupabase.order.mockResolvedValue({
      data: mockPulses,
      error: null,
    });

    const result = await getPulses();

    expect(mockSupabase.from).toHaveBeenCalledWith("pulses");
    expect(mockSupabase.select).toHaveBeenCalledWith("*");
    expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toEqual(mockPulses);
  });

  it("Pulseが存在しない場合は空配列を返す", async () => {
    mockSupabase.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await getPulses();

    expect(result).toEqual([]);
  });

  it("データがnullの場合は空配列を返す", async () => {
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getPulses();

    expect(result).toEqual([]);
  });

  it("データベースエラーが発生した場合はエラーをスローする", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockSupabase.order.mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });

    await expect(getPulses()).rejects.toThrow("Database connection failed");

    consoleSpy.mockRestore();
  });
});
