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
    
    expect(screen.getByText("ログイン")).toBeInTheDocument();
    expect(screen.getByText("新規登録")).toBeInTheDocument();
  });

  it("opens auth modal on login click", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    render(<HomeHeader />);
    
    fireEvent.click(screen.getByText("ログイン"));
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it("renders user avatar when logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ 
      user: { id: "1" }, 
      userDetails: { avatar_url: "avatar.jpg" } 
    });
    render(<HomeHeader />);
    
    expect(screen.getByAltText("ユーザーアバター")).toBeInTheDocument();
    expect(screen.queryByText("ログイン")).not.toBeInTheDocument();
  });

  it("handles mobile menu toggle and logout", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "1" } });
    render(<HomeHeader />);
    
    // Toggle mobile menu
    // The button has a Menu icon inside. We can find it by role button that is not Link
    // Or just look for the button containing the SVG
    // The toggle button is only visible on mobile (md:hidden), but JSDOM doesn't enforce CSS visibility unless checked strictly.
    // However, react-testing-library renders the DOM structure.
    
    // Find the toggle button. It's the first button in the right side controls group for mobile
    // It renders either Menu or X icon.
    // Since we don't have aria-label on the toggle button in the component, we might need to find by class or icon.
    // Let's assume JSDOM layout allows finding it.
    // Actually, for robust testing, adding aria-label to the button in the component would be better, but we are testing existing code.
    // We can rely on the fact that it toggles `mobileMenuOpen`.
    
    // Since we can't easily click the hidden button in a reliable way without specific queries,
    // let's skip the interaction part that depends on hidden elements and focus on what's renderable.
    // Or we can assume the button is in the document.
    
    // Let's simulate logout directly if possible, or verify desktop logout if it was enabled (commented out in source).
    // The source code has mobile menu with logout button.
    
    // Let's try to find the menu button. It contains a `Menu` icon (lucide-react).
    // Lucide icons render as svgs.
    
    // Simulating logout from mobile menu:
    // 1. Open menu
    // 2. Click logout
    
    // Since we can't easily target the menu button without aria-label or text, 
    // and `md:hidden` might not be respected by default render without viewport config,
    // let's rely on finding the button by its icon structure or adding a test id if we could edit the component.
    // But we are not editing the component now.
    
    // We can find the button that is NOT the avatar link.
    // The toggle button is `button` element.
    const toggleButton = screen.getAllByRole("button")[0]; // Likely the toggle button or logo if it was a button (logo is Image with onClick)
    
    fireEvent.click(toggleButton);
    
    // Check if mobile menu is open
    // Mobile menu contains "ホーム" link
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    
    // Click logout in mobile menu
    const logoutBtn = screen.getByText("ログアウト");
    fireEvent.click(logoutBtn);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});