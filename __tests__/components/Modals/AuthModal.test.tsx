import { render, screen, waitFor } from "@testing-library/react";
import AuthModal from "@/components/Modals/AuthModal";
import useAuthModal from "@/hooks/auth/useAuthModal";
import { createClient } from "@/libs/supabase/client";

// Mock hooks and deps
jest.mock("@/hooks/auth/useAuthModal");
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
}));

// Mock child components
jest.mock("@/components/Modals/Modal", () => {
  return {
    __esModule: true,
    default: ({ isOpen, children }: any) => {
      if (!isOpen) return null;
      const React = require("react");
      return React.createElement("div", { "data-testid": "auth-modal" }, children);
    },
  };
});

jest.mock("@supabase/auth-ui-react", () => ({
  Auth: () => {
    const React = require("react");
    return React.createElement("div", { "data-testid": "supabase-auth-ui" }, "Auth UI");
  },
}));

describe("components/Modals/AuthModal", () => {
  let mockSupabase: any;
  let mockGetSession: jest.Mock;
  let mockOnAuthStateChange: jest.Mock;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    (useAuthModal as unknown as jest.Mock).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
    });

    mockGetSession = jest.fn();
    mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    }));

    mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("renders auth UI when open", () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    render(<AuthModal />);
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    expect(screen.getByTestId("supabase-auth-ui")).toBeInTheDocument();
  });

  it("closes modal if session exists", async () => {
    // Initial render with session
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: { id: "1" } } } 
    });

    render(<AuthModal />);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});