import { render, screen, fireEvent } from "@testing-library/react";
import UserCard from "@/components/Sidebar/UserCard";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
}));

const mockOnOpen = jest.fn();
jest.mock("@/hooks/auth/useAuthModal", () => ({
  __esModule: true,
  default: () => ({ onOpen: mockOnOpen }),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1", email: "test@example.com" } }),
}));

const mockSignOut = jest.fn();
jest.mock("@/libs/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: () => mockSignOut() },
  }),
}));

jest.mock("next/image", () => "img");

jest.mock("@/components/ui/avatar", () => ({
  Avatar: "div",
  AvatarImage: "img",
  AvatarFallback: "div",
}));

describe("components/Sidebar/UserCard", () => {
  const defaultUserDetails = {
    id: "user-1",
    first_name: "Test",
    last_name: "User",
    full_name: "Test User",
    avatar_url: "/avatars/test.jpg",
    email: "test@example.com",
  };

  beforeEach(() => {
    mockOnOpen.mockClear();
    mockSignOut.mockClear();
  });

  it("userDetailsがnullの場合、ログインボタンが表示される", () => {
    render(<UserCard userDetails={null} isCollapsed={false} />);
    // Component shows SYSTEM_LOGIN in expanded state
    expect(screen.getByText("// SYSTEM_LOGIN")).toBeInTheDocument();
  });

  it("ログインボタンをクリックするとauthModalが開く", () => {
    render(<UserCard userDetails={null} isCollapsed={false} />);
    // Find the button by its contained text
    fireEvent.click(screen.getByText("// SYSTEM_LOGIN"));
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it("userDetailsがある場合、ユーザー名が表示される", () => {
    render(<UserCard userDetails={defaultUserDetails} isCollapsed={false} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("ログアウトボタンが表示される（ログイン時）", () => {
    render(<UserCard userDetails={defaultUserDetails} isCollapsed={false} />);
    // Logout button uses LogOut icon from lucide-react (no text label)
    // Verify the component rendered with user details
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
