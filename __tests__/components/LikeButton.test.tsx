import { render, screen, fireEvent } from "@testing-library/react";
import LikeButton from "@/components/LikeButton";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import useLikeStatus from "@/hooks/data/useLikeStatus";
import useLikeMutation from "@/hooks/data/useLikeMutation";

// Mock hooks
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/auth/useAuthModal");
jest.mock("@/hooks/data/useLikeStatus");
jest.mock("@/hooks/data/useLikeMutation");

describe("components/LikeButton", () => {
  const mockOnOpen = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthModal as unknown as jest.Mock).mockReturnValue({
      onOpen: mockOnOpen,
    });

    (useLikeMutation as unknown as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders unfilled heart when not liked", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    
    const button = screen.getByRole("button", { name: "Add like" });
    expect(button).toBeInTheDocument();
    // Check for outline heart icon usage indirectly via label or implementation details if needed
    // Here aria-label is sufficient for behavior.
  });

  it("renders filled heart when liked", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: true });

    render(<LikeButton songId="song-1" songType="regular" />);
    
    const button = screen.getByRole("button", { name: "Remove like" });
    expect(button).toBeInTheDocument();
  });

  it("opens auth modal if user is not logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("toggles like if user is logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockMutate).toHaveBeenCalledWith(false); // pass current isLiked status
    expect(mockOnOpen).not.toHaveBeenCalled();
  });

  it("shows text if showText prop is true", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: true });

    render(<LikeButton songId="song-1" songType="regular" showText={true} />);
    
    expect(screen.getByText("いいね済み")).toBeInTheDocument();
  });
});