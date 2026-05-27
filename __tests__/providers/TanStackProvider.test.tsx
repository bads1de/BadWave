import { render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import TanStackProvider from "@/providers/TanStackProvider";

// react-hot-toast をモック
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import toast from "react-hot-toast";

describe("providers/TanStackProvider", () => {
  it("子要素をレンダリングする", () => {
    render(
      <TanStackProvider>
        <div data-testid="child">Child Content</div>
      </TanStackProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("複数の子要素をレンダリングする", () => {
    render(
      <TanStackProvider>
        <span data-testid="child1">First</span>
        <span data-testid="child2">Second</span>
      </TanStackProvider>
    );
    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });

  it("クエリエラー時に console.error と toast.error が呼ばれる", async () => {
    const errorMessage = "Test query error";

    const ErrorComponent = () => {
      useQuery({
        queryKey: ["test-error"],
        queryFn: () => Promise.reject(new Error(errorMessage)),
      });
      return <div data-testid="error-component">Error</div>;
    };

    render(
      <TanStackProvider>
        <ErrorComponent />
      </TanStackProvider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
        })
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
