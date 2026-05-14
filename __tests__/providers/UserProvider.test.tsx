import { render, screen } from "@testing-library/react";
import UserProvider from "@/providers/UserProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/hooks/auth/useUser", () => ({
  MyUserContextProvider: ({ children }: any) => children,
  useUser: () => ({ user: null, isLoading: false }),
}));

describe("providers/UserProvider", () => {
  it("子要素をレンダリングする", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <div data-testid="child">Hello</div>
        </UserProvider>
      </QueryClientProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("複数の子要素をレンダリングする", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <span data-testid="child1">First</span>
          <span data-testid="child2">Second</span>
        </UserProvider>
      </QueryClientProvider>
    );
    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });
});
