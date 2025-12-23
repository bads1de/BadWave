import { renderHook, waitFor } from "@testing-library/react";
import { MyUserContextProvider, useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";

// モックの設定
jest.mock("@/libs/supabase/client");
jest.mock("@tanstack/react-query", () => {
  const originalModule = jest.requireActual("@tanstack/react-query");
  return Object.assign({}, originalModule, {
    useQuery: jest.fn(),
  });
});

describe("useUser", () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  };

  const mockSubscription = {
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MyUserContextProvider>{children}</MyUserContextProvider>
  );

  it("初期状態ではユーザーはnullであること", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });
  });

  it("セッションが存在する場合、ユーザー情報が取得されること", async () => {
    const mockUser = { id: "test-user" };
    const mockSession = { user: mockUser, access_token: "test-token" };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe("test-token");
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("詳細情報の取得がローディング中の場合、isLoadingがtrueになること", async () => {
    const mockUser = { id: "test-user" };
    const mockSession = { user: mockUser, access_token: "test-token" };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true, // 詳細情報の読み込み中
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(true);
    });
  });

  it("コンテキスト外で使用された場合、エラーをスローすること", () => {
    // console.errorを一時的に抑制（Reactのエラーログが出ないようにするため）
    const originalError = console.error;
    console.error = jest.fn();

    try {
      renderHook(() => useUser());
    } catch (error: any) {
      expect(error.message).toBe(
        "useUser must be used within a MyUserContextProvider"
      );
    }

    console.error = originalError;
  });
});
