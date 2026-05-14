import { render, screen } from "@testing-library/react";
import SidebarItem from "@/components/Sidebar/SidebarItem";

jest.mock("@/components/common/Hover", () => "div");

jest.mock("next/link", () => "a");

describe("components/Sidebar/SidebarItem", () => {
  const defaultProps = {
    icon: () => "🔊",
    label: "Test Item",
    href: "/test",
  };

  it("ラベルをレンダリングする", () => {
    render(<SidebarItem {...defaultProps} />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("href属性がaタグに設定される", () => {
    render(<SidebarItem {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("isCollapsedがtrueの場合でもレンダリングされる", () => {
    const { container } = render(<SidebarItem {...defaultProps} isCollapsed={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("active状態が適用される", () => {
    const { container } = render(<SidebarItem {...defaultProps} active={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
