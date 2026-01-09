import { render, screen, fireEvent } from "@testing-library/react";
import Slider from "@/components/Player/Slider";
import * as RadixSlider from "@radix-ui/react-slider";

// Radix UI Slider is complex to test fully as it relies on pointer events and layout.
// We mock the Radix parts to verify our wrapper logic (value passing).
jest.mock("@radix-ui/react-slider", () => {
  const React = require("react");
  return {
    Root: (props: any) => {
      const { children, onValueChange, value } = props;
      const otherProps = Object.assign({}, props);
      delete otherProps.children;
      delete otherProps.onValueChange;
      delete otherProps.value;

      const elementProps = Object.assign({
        "data-testid": "radix-root",
        onClick: () => onValueChange([0.5]),
        "data-value": value?.[0]
      }, otherProps);

      return React.createElement("div", elementProps, children);
    },
    Track: (props: any) => {
        const { children } = props;
        const otherProps = Object.assign({}, props);
        delete otherProps.children;
        const elementProps = Object.assign({ "data-testid": "radix-track" }, otherProps);
        return React.createElement("div", elementProps, children);
    },
    Range: (props: any) => {
        const elementProps = Object.assign({ "data-testid": "radix-range" }, props);
        return React.createElement("div", elementProps);
    },
  };
});

describe("components/Player/Slider", () => {
  it("renders correctly with default value", () => {
    render(<Slider />);
    const root = screen.getByTestId("radix-root");
    expect(root).toHaveAttribute("data-value", "1");
  });

  it("renders with custom value", () => {
    render(<Slider value={0.8} />);
    const root = screen.getByTestId("radix-root");
    expect(root).toHaveAttribute("data-value", "0.8");
  });

  it("calls onChange with single number when value changes", () => {
    const handleChange = jest.fn();
    render(<Slider value={1} onChange={handleChange} />);
    
    const root = screen.getByTestId("radix-root");
    fireEvent.click(root); // Our mock triggers onValueChange([0.5])

    expect(handleChange).toHaveBeenCalledWith(0.5);
  });
});
