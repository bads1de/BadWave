import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Input from "@/components/common/Input";

describe("components/common/Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles user input", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("Hello");
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("accepts custom className", () => {
    render(<Input className="custom-input" />);
    // Input component wraps input in a div, but className is passed to input
    expect(screen.getByRole("textbox")).toHaveClass("custom-input");
  });

  it("has default type as text", () => {
    render(<Input />);
    // Check DOM property, not attribute
    expect(screen.getByRole("textbox")).toHaveProperty("type", "text");
  });

  it("supports other types", () => {
    render(<Input type="password" placeholder="Password" />);
    // type="password" does not have role="textbox" usually, query by placeholder
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
  });
});
