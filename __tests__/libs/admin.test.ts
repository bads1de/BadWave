import { getAdminUserIds, isAdmin } from "@/libs/admin";

// 環境変数のモック用
const originalEnv = process.env;

describe("admin", () => {
  beforeEach(() => {
    jest.resetModules();
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
});
