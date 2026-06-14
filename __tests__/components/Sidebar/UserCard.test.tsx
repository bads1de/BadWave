import * as React from "react";
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

const mockSignOut = jest.fn().mockResolvedValue({ error: null });
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

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

  describe("未ログイン状態", () => {
    it("userDetailsがnullの場合、ログインボタンが表示される", () => {
      render(<UserCard userDetails={null} isCollapsed={false} />);
      expect(screen.getByText("// SYSTEM_LOGIN")).toBeInTheDocument();
    });

    it("ログインボタンをクリックするとauthModalが開く", () => {
      render(<UserCard userDetails={null} isCollapsed={false} />);
      fireEvent.click(screen.getByText("// SYSTEM_LOGIN"));
      expect(mockOnOpen).toHaveBeenCalled();
    });

    it("isCollapsed=trueで未ログインの場合、アイコンボタンが表示される", () => {
      const { container } = render(<UserCard userDetails={null} isCollapsed={true} />);
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  describe("ログイン済み状態", () => {
    it("userDetailsがある場合、ユーザー名が表示される", () => {
      render(<UserCard userDetails={defaultUserDetails} isCollapsed={false} />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("OP_IDラベルが表示される", () => {
      render(<UserCard userDetails={defaultUserDetails} isCollapsed={false} />);
      expect(screen.getByText("[ OP_ID ]")).toBeInTheDocument();
    });

    it("full_nameがない場合はUNKNOWNを表示する", () => {
      const userDetailsNoName = { ...defaultUserDetails, full_name: "" };
      render(<UserCard userDetails={userDetailsNoName} isCollapsed={false} />);
      expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    });

    it("isCollapsed=trueでログイン済みの場合、アバター画像が表示される", () => {
      const { container } = render(<UserCard userDetails={defaultUserDetails} isCollapsed={true} />);
      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("isCollapsed=trueでアバターがない場合、ユーザーアイコンが表示される", () => {
      const userDetailsNoAvatar = { ...defaultUserDetails, avatar_url: "" };
      const { container } = render(<UserCard userDetails={userDetailsNoAvatar} isCollapsed={true} />);
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });
});
