import { render, screen, fireEvent } from "@testing-library/react";
import TrendPeriodSelector from "@/components/Trend/TrendPeriodSelector";

describe("components/Trend/TrendPeriodSelector", () => {
  const mockOnChange = jest.fn();

  it("renders all period options", () => {
    render(<TrendPeriodSelector selectedPeriod="all" onPeriodChange={mockOnChange} />);
    
    expect(screen.getByText("All Time")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("highlights selected period", () => {
    render(<TrendPeriodSelector selectedPeriod="week" onPeriodChange={mockOnChange} />);
    
    const weekButton = screen.getByText("This Week");
    // Check for a class that indicates selection (e.g. text-white, or bg-gradient...)
    // The implementation uses: bg-gradient-to-br ... text-white
    expect(weekButton).toHaveClass("text-white");
    
    const allButton = screen.getByText("All Time");
    expect(allButton).toHaveClass("text-neutral-400");
  });

  it("calls onChange when clicked", () => {
    render(<TrendPeriodSelector selectedPeriod="all" onPeriodChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText("Today"));
    expect(mockOnChange).toHaveBeenCalledWith("day");
  });
});
