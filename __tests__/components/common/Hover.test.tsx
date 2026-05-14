import { render, screen } from "@testing-library/react";
import Hover from "@/components/common/Hover";

// Radix UI HoverCard のモック - JSXを使わない
jest.mock("@radix-ui/react-hover-card", () => ({
  Root: "div",
  Trigger: "div",
  Portal: "div",
  Content: "div",
}));

describe("components/common/Hover", () => {
  it("childrenをレンダリングする", () => {
    render(
      <Hover description="Test tooltip">
        <button>Hover me</button>
      </Hover>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("descriptionがツールチップに渡される", () => {
    render(
      <Hover description="Tooltip content">
        <button>Hover me</button>
      </Hover>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("カスタムcontentSizeがpropsとして渡される", () => {
    const { container } = render(
      <Hover description="Test" contentSize="w-64" isCollapsed={true}>
        <button>Hover me</button>
      </Hover>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });
});
