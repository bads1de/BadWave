import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Button from "@/components/common/Button";

describe("components/common/Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("handles onClick event", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies default variant and size classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button");
    // Default variant: bg-gradient-to-br
    expect(button.className).toContain("bg-gradient-to-br");
    // Default size: px-4 py-2 (md)
    expect(button.className).toContain("px-4 py-2");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-neutral-800");
    expect(button.className).toContain("bg-transparent");
  });

  it("applies small size classes", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-xs");
    expect(button.className).toContain("px-3 py-1.5");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
