import { render, screen } from "@testing-library/react";
import GenreCard from "@/components/Genre/GenreCard";

describe("components/Genre/GenreCard", () => {
  it("renders genre name and icon", () => {
    render(<GenreCard genre="Retro Wave" color="any" />);
    
    expect(screen.getByText("Retro Wave")).toBeInTheDocument();
    expect(screen.getByText("🌆")).toBeInTheDocument();
  });

  it("renders with correct link", () => {
    render(<GenreCard genre="City Pop" color="any" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/genre/City Pop");
  });

  it("applies gradient class based on genre", () => {
    const { container } = render(<GenreCard genre="Vapor Wave" color="any" />);
    
    // We check if the container has the expected gradient class indirectly
    // Since we can't easily query by class part without custom matchers or querying DOM structure.
    // The gradient is applied to a div inside.
    const html = container.innerHTML;
    expect(html).toContain("bg-gradient-to-br from-[#FF61D2]");
  });
});
