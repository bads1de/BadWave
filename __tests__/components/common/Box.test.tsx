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
    // Box renders a div. We can check the first child of the container.
    // However, tailwind-merge might reorder classes.
    // Let's just check if the class is present in the list.
    // The Box component renders a single div at root.
    const box = screen.getByText("Content");
    expect(box).toHaveClass("custom-class");
    expect(box).toHaveClass("bg-neutral-900/40"); // Default class
  });
});
