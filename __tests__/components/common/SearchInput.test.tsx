import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchInput from "@/components/common/SearchInput";
import { useRouter, useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
  stringifyUrl: jest.fn(({ url, query }) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value as string);
      }
    });
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }),
}));

// Mock useDebounce to avoid timer issues in this component test, 
// or use real timers. Since we want to test interaction with router,
// let's use fake timers.
jest.mock("@/hooks/utils/useDebounce", () => ({
  __esModule: true,
  default: jest.fn((value) => value), // No delay mock for simplicity
}));

describe("components/common/SearchInput", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    // Default empty search params
    const mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("renders correctly with placeholder", () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText("曲やプレイリストを検索")).toBeInTheDocument();
  });

  it("initializes with value from URL", () => {
    const params = new URLSearchParams();
    params.set("title", "Initial Query");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<SearchInput />);
    expect(screen.getByRole("textbox")).toHaveValue("Initial Query");
  });

  it("updates input value on change", () => {
    render(<SearchInput />);
    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(input).toHaveValue("Hello");

    // Expect router.push to be called with correct URL query
    expect(mockPush).toHaveBeenCalledWith("/search?title=Hello");
  });

  it("clears input when close button is clicked", () => {
    // Setup initial state with a search query
    const params = new URLSearchParams();
    params.set("title", "Hello");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<SearchInput />);
    const input = screen.getByRole("textbox");
    
    // Check initial state
    expect(input).toHaveValue("Hello");

    // Click clear
    const clearButton = screen.getByLabelText("検索をクリア");
    fireEvent.click(clearButton);
    expect(input).toHaveValue("");

    // Expect router.push to be called to remove the query param
    // Since currentTitle is "Hello" and debouncedValue is "", the condition
    // (currentTitle !== debouncedValue && (currentTitle || debouncedValue))
    // becomes (true && true), so push should be called.
    expect(mockPush).toHaveBeenCalledWith("/search");
  });
});
