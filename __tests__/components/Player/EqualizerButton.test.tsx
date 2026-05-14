import { render, screen } from "@testing-library/react";
import EqualizerButton from "@/components/Player/EqualizerButton";

// useEqualizerStore のモック
jest.mock("@/hooks/stores/useEqualizerStore", () => ({
  __esModule: true,
  default: () => ({
    isEnabled: false,
  }),
}));

// useColorSchemeStore のモック
jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    colorSchemeId: "neon",
    getColorScheme: () => ({
      id: "neon",
      accent: "#ff00ff",
      accentFrom: "#ff00ff",
      accentTo: "#00ffff",
      text: "#ffffff",
      bg: "#0a0a0f",
    }),
  }),
}));

// Popover UIのモック - JSXを使わない
jest.mock("@/components/ui/popover", () => ({
  Popover: "div",
  PopoverContent: "div",
  PopoverTrigger: "div",
}));

// EqualizerControl のモック - JSXを使わない
jest.mock("@/components/Equalizer/EqualizerControl", () => ({
  __esModule: true,
  default: "div",
}));

describe("components/Player/EqualizerButton", () => {
  it("EqualizerButtonがレンダリングされる", () => {
    const { container } = render(<EqualizerButton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("アイコン（svg）がレンダリングされる", () => {
    const { container } = render(<EqualizerButton />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
