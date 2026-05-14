import { createClient } from "@/libs/supabase/client";

// @supabase/ssr のモック
const mockCreateBrowserClient = jest.fn(() => ({
  auth: { getSession: jest.fn(), onAuthStateChange: jest.fn() },
  from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() })),
}));

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: any[]) => mockCreateBrowserClient(...args),
}));

describe("libs/supabase/client", () => {
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

  it("createClientがSupabaseクライアントを返す", () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});
