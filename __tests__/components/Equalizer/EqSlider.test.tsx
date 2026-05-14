import { render, screen } from "@testing-library/react";
import EqSlider from "@/components/Equalizer/EqSlider";
import React from "react";

// Radix Slider のモック
jest.mock("@radix-ui/react-slider", () => ({
  Root: "div",
  Track: "div",
  Range: "div",
  Thumb: "div",
}));

describe("components/Equalizer/EqSlider", () => {
  const defaultProps = {
    value: 0,
    onChange: jest.fn(),
    label: "60Hz",
    min: -12,
    max: 12,
  };

  it("EqSliderがレンダリングされる", () => {
    const { container } = render(<EqSlider {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("ラベルが表示される", () => {
    render(<EqSlider {...defaultProps} />);
    expect(screen.getByText("60Hz")).toBeInTheDocument();
  });

  it("ゲイン値が表示される（正の値は+付き）", () => {
    render(<EqSlider {...defaultProps} value={5} />);
    // value > 0 の場合 "+5" と表示される
    expect(screen.getByText("+5")).toBeInTheDocument();
  });

  it("負の値も表示される", () => {
    render(<EqSlider {...defaultProps} value={-5} />);
    expect(screen.getByText("-5")).toBeInTheDocument();
  });
});
