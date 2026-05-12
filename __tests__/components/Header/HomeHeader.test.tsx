import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeHeader from "@/components/Header/HomeHeader";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import { createClient } from "@/libs/supabase/client";

// Mock hooks
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/auth/useAuthModal");
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("components/Header/HomeHeader", () => {
  const mockOnOpen = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthModal as unknown as jest.Mock).mockReturnValue({
      onOpen: mockOnOpen,
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: { signOut: mockSignOut },
    });
  });

  it("renders login buttons when not logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    render(<HomeHeader />);
    
    expect(screen.getByText("[ LOGIN ]")).toBeInTheDocument();
    expect(screen.getByText("// INITIALIZE_AUTH")).toBeInTheDocument();
  });

  it("opens auth modal on login click", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    render(<HomeHeader />);
    
    fireEvent.click(screen.getByText("[ LOGIN ]"));
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it("renders user avatar when logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ 
      user: { id: "1" }, 
      userDetails: { avatar_url: "avatar.jpg" } 
    });
    render(<HomeHeader />);
    
    expect(screen.getByAltText("avatar")).toBeInTheDocument();
    expect(screen.queryByText("[ LOGIN ]")).not.toBeInTheDocument();
  });

  it("handles mobile menu toggle and logout", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "1" } });
    render(<HomeHeader />);
    
    // Toggle mobile menu
    const toggleButton = screen.getAllByRole("button")[0];
    
    fireEvent.click(toggleButton);
    
    // Check if mobile menu is open
    // Mobile menu contains "CENTRAL_HUB" link
    expect(screen.getByText("CENTRAL_HUB")).toBeInTheDocument();
    
    // Click logout in mobile menu
    const logoutBtn = screen.getByText("[ TERMINATE_SESSION ]");
    fireEvent.click(logoutBtn);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});