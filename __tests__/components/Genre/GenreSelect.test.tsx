import { render, screen } from "@testing-library/react";
import GenreSelect from "@/components/Genre/GenreSelect";

jest.mock("@radix-ui/react-select", () => ({
  Root: "div",
  Trigger: "button",
  Value: "span",
  Icon: "span",
  Portal: ({ children }: any) => children,
  Content: "div",
  Viewport: "div",
  Item: "div",
  ItemText: "span",
  ItemIndicator: "span",
}));

jest.mock("lucide-react", () => ({
  ChevronDown: "span",
}));

jest.mock("@/constants", () => ({
  genres: [
    { id: "electronic", name: "Electronic" },
    { id: "hiphop", name: "Hip Hop" },
    { id: "rock", name: "Rock" },
    { id: "jazz", name: "Jazz" },
    { id: "classical", name: "Classical" },
    { id: "pop", name: "Pop" },
    { id: "rnb", name: "R&B" },
    { id: "metal", name: "Metal" },
  ],
}));

describe("components/Genre/GenreSelect", () => {
  const defaultProps = {
    onGenreChange: jest.fn(),
    value: "",
    disabled: false,
  };

  it("GenreSelectがレンダリングされる", () => {
    const { container } = render(<GenreSelect {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("各ジャンルがラベルとして表示される", () => {
    render(<GenreSelect {...defaultProps} />);
    expect(screen.getByText("Electronic")).toBeInTheDocument();
    expect(screen.getByText("Hip Hop")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  it("初期値が設定できる", () => {
    const { container } = render(<GenreSelect {...defaultProps} value="electronic" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
