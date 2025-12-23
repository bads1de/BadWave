import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

// モックの設定
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy-key";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn().mockImplementation(() => ({
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}));

describe("updateSession", () => {
  let mockRequest: any;
  let mockSupabase: any;

  beforeEach(() => {
    mockRequest = {
      headers: new Headers(),
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
    };

    mockSupabase = {
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "test-user" } } }),
      },
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("should update session and return user", async () => {
    const result = await updateSession(mockRequest as NextRequest);

    expect(createServerClient).toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(result.user).toEqual({ id: "test-user" });
    expect(result.response).toBeDefined();
    expect(result.response.cookies).toBeDefined();
  });

  it("should handle cookie updates in setAll", async () => {
    (createServerClient as jest.Mock).mockImplementation(
      (url, key, options) => {
        // 内部でsetAllを呼び出すシミュレーション
        options.cookies.setAll([
          { name: "test-cookie", value: "test-value", options: {} },
        ]);
        return mockSupabase;
      }
    );

    const result = await updateSession(mockRequest as NextRequest);

    expect(mockRequest.cookies.set).toHaveBeenCalledWith(
      "test-cookie",
      "test-value"
    );
    expect(result.user).toEqual({ id: "test-user" });
  });
});
