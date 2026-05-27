import { createClient } from "@/libs/supabase/server";

// Track the cookies config passed to createServerClient
let capturedConfig: { cookies: { getAll: () => any[]; setAll: (cookies: any[]) => void } } | undefined;

// next/headers のモック
const mockCookieStore = {
  getAll: jest.fn(() => []),
  set: jest.fn(),
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

// @supabase/ssr のモック
const mockCreateServerClient = jest.fn((_url: string, _anonKey: string, options: any) => {
  capturedConfig = options;
  return {
    auth: { getSession: jest.fn() },
    from: jest.fn(() => ({ select: jest.fn() })),
  };
});

jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

describe("libs/supabase/server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    capturedConfig = undefined;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("createClientがSupabaseサーバークライアントを返す", async () => {
    const client = await createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it("正しい環境変数でcreateServerClientを呼び出す", async () => {
    await createClient();
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  describe("cookies.getAll", () => {
    it("cookieStore.getAllを呼び出して結果を返す", async () => {
      const mockCookiesArray = [{ name: "session", value: "abc123" }];
      mockCookieStore.getAll.mockReturnValue(mockCookiesArray);

      await createClient();
      const getAll = capturedConfig!.cookies.getAll;

      const result = getAll();
      expect(result).toEqual(mockCookiesArray);
      expect(mockCookieStore.getAll).toHaveBeenCalled();
    });
  });

  describe("cookies.setAll", () => {
    it("cookiesToSetの各アイテムでcookieStore.setを呼び出す", async () => {
      await createClient();
      const setAll = capturedConfig!.cookies.setAll;

      const cookiesToSet = [
        { name: "test", value: "value1", options: { path: "/" } },
        { name: "test2", value: "value2", options: {} },
      ];

      setAll(cookiesToSet);

      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.set).toHaveBeenCalledWith("test", "value1", { path: "/" });
      expect(mockCookieStore.set).toHaveBeenCalledWith("test2", "value2", {});
    });

    it("cookieStore.setがエラーをスローしてもキャッチして無視する", async () => {
      mockCookieStore.set.mockImplementationOnce(() => {
        throw new Error("Cookie store error");
      });

      await createClient();
      const setAll = capturedConfig!.cookies.setAll;

      // エラーをスローせず無視することを確認
      expect(() => {
        setAll([{ name: "test", value: "value", options: {} }]);
      }).not.toThrow();

      expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    });
  });
});
