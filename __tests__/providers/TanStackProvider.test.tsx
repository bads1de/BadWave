import { render, screen } from "@testing-library/react";
import TanStackProvider from "@/providers/TanStackProvider";

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
});
