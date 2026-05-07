import { render, screen } from "@testing-library/react";
import Box from "@/components/common/Box";

describe("components/common/Box", () => {
  it("renders children correctly", () => {
    render(
      <Box>
        <div data-testid="child">Child Content</div>
      </Box>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(
      <Box className="custom-class">
        Content
      </Box>
    );
    const box = screen.getByText("Content");
    expect(box).toHaveClass("custom-class");
  });
});
