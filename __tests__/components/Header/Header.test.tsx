import { render, screen } from "@testing-library/react";
import Header from "@/components/Header/Header";

describe("components/Header/Header", () => {
  it("renders children correctly", () => {
    render(
      <Header>
        <div data-testid="child">Child</div>
      </Header>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Header className="custom-class">
        <div />
      </Header>
    );
    
    // Header renders a div wrapper. 
    // We check if the custom class is applied to the first child of the container.
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
