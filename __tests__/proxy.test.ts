import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";
import { updateSession } from "@/libs/supabase/middleware";

// モックの設定
jest.mock("@/libs/supabase/middleware", () => ({
  updateSession: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

describe("Proxy", () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      nextUrl: {
        pathname: "/",
      },
      url: "http://localhost:3000/",
    };
  });

  it("認証済みユーザーが保護されたルートにアクセスした場合、レスポンスをそのまま返すこと", async () => {
    mockRequest.nextUrl.pathname = "/account";
    const mockResponse = { type: "response" };
    (updateSession as jest.Mock).mockResolvedValue({
      response: mockResponse,
      user: { id: "user-123" },
    });

    const result = await proxy(mockRequest as NextRequest);

    expect(result).toBe(mockResponse);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("未認証ユーザーが保護されたルートにアクセスした場合、ホームページにリダイレクトすること", async () => {
    mockRequest.nextUrl.pathname = "/liked";
    const mockResponse = { type: "response" };
    (updateSession as jest.Mock).mockResolvedValue({
      response: mockResponse,
      user: null,
    });

    await proxy(mockRequest as NextRequest);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/" })
    );
  });

  it("未認証ユーザーが公開ルートにアクセスした場合、レスポンスをそのまま返すこと", async () => {
    mockRequest.nextUrl.pathname = "/search";
    const mockResponse = { type: "response" };
    (updateSession as jest.Mock).mockResolvedValue({
      response: mockResponse,
      user: null,
    });

    const result = await proxy(mockRequest as NextRequest);

    expect(result).toBe(mockResponse);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
