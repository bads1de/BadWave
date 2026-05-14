import { render, screen } from "@testing-library/react";
import MobileTabs from "@/components/Mobile/MobileTabs";

// next/link のモック
jest.mock("next/link", () => ({
  __esModule: true,
  default: "a",
}));

// react-icons のモック
jest.mock("react-icons/hi", () => ({
  HiHome: "span",
  HiSearch: "span",
}));

jest.mock("react-icons/ri", () => ({
  RiScannerLine: "span",
}));

jest.mock("react-icons/md", () => ({
  MdDataUsage: "span",
}));

describe("components/Mobile/MobileTabs", () => {
  it("ナビゲーションタブがレンダリングされる", () => {
    render(<MobileTabs />);
    expect(screen.getByText("HOME")).toBeInTheDocument();
    expect(screen.getByText("SCAN")).toBeInTheDocument();
    expect(screen.getByText("NODE")).toBeInTheDocument();
    expect(screen.getByText("DATA")).toBeInTheDocument();
  });

  it("リンク要素が存在する", () => {
    const { container } = render(<MobileTabs />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});
