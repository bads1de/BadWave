import { createClient } from "@/libs/supabase/server";

// next/headers のモック
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    setAll: jest.fn(),
  })),
}));

// @supabase/ssr のモック
const mockCreateServerClient = jest.fn(() => ({
  auth: { getSession: jest.fn() },
  from: jest.fn(() => ({ select: jest.fn() })),
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

describe("libs/supabase/server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
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
});
