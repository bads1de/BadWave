import { getAdminUserIds, isAdmin, isCurrentUserAdmin, requireAdmin } from "@/libs/admin";

// Mock supabase server
const mockGetUser = jest.fn<Promise<{ data: { user: { id: string } | null }; error: Error | null }>, []>();
const mockCreateClient = jest.fn(() => ({
  auth: {
    getUser: mockGetUser,
  },
}));

jest.mock("@/libs/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

const originalEnv = process.env;

describe("admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAdminUserIds", () => {
    it("ADMIN_USER_IDSが設定されていない場合は空配列を返す", () => {
      delete process.env.ADMIN_USER_IDS;
      const result = getAdminUserIds();
      expect(result).toEqual([]);
    });

    it("単一のユーザーIDを正しく解析する", () => {
      process.env.ADMIN_USER_IDS = "user-123";
      const result = getAdminUserIds();
      expect(result).toEqual(["user-123"]);
    });

    it("カンマ区切りの複数のユーザーIDを正しく解析する", () => {
      process.env.ADMIN_USER_IDS = "user-123,user-456,user-789";
      const result = getAdminUserIds();
      expect(result).toEqual(["user-123", "user-456", "user-789"]);
    });

    it("余分な空白を除去する", () => {
      process.env.ADMIN_USER_IDS = "user-123, user-456 , user-789";
      const result = getAdminUserIds();
      expect(result).toEqual(["user-123", "user-456", "user-789"]);
    });
  });

  describe("isAdmin", () => {
    beforeEach(() => {
      process.env.ADMIN_USER_IDS = "admin-001,admin-002";
    });

    it("管理者ユーザーIDの場合はtrueを返す", () => {
      expect(isAdmin("admin-001")).toBe(true);
      expect(isAdmin("admin-002")).toBe(true);
    });

    it("管理者でないユーザーIDの場合はfalseを返す", () => {
      expect(isAdmin("user-123")).toBe(false);
      expect(isAdmin("random-id")).toBe(false);
    });

    it("空文字列の場合はfalseを返す", () => {
      expect(isAdmin("")).toBe(false);
    });

    it("ADMIN_USER_IDSが設定されていない場合はfalseを返す", () => {
      delete process.env.ADMIN_USER_IDS;
      expect(isAdmin("admin-001")).toBe(false);
    });
  });

  describe("isCurrentUserAdmin", () => {
    beforeEach(() => {
      process.env.ADMIN_USER_IDS = "admin-001,admin-002";
    });

    it("管理者ユーザーの場合はtrueを返す", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-001" } },
        error: null,
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(true);
      expect(mockCreateClient).toHaveBeenCalled();
      expect(mockGetUser).toHaveBeenCalled();
    });

    it("一般ユーザーの場合はfalseを返す", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    it("getUserがエラーを返した場合はfalseを返す", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("認証エラー"),
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    it("ユーザーが存在しない場合はfalseを返す", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    it("getUserが例外をスローした場合はfalseを返す", async () => {
      mockGetUser.mockRejectedValue(new Error("Network error"));

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });
  });

  describe("requireAdmin", () => {
    beforeEach(() => {
      process.env.ADMIN_USER_IDS = "admin-001";
    });

    it("管理者の場合はエラーをスローしない", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-001" } },
        error: null,
      });

      await expect(requireAdmin()).resolves.not.toThrow();
    });

    it("管理者でない場合はエラーをスローする", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      await expect(requireAdmin()).rejects.toThrow("管理者権限が必要です");
    });
  });
});
