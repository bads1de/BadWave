import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ThemeProvider from "@/providers/ThemeProvider";

// next-themes is not installed - use virtual mock
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}), { virtual: true });

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    colorSchemeId: "neon",
    hasHydrated: true,
    setHasHydrated: jest.fn(),
  }),
}));

describe("providers/ThemeProvider", () => {
  it("子要素をレンダリングする", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
