import { render } from "@testing-library/react";
import PulseUploadModal from "@/components/Modals/PulseUploadModal";

// Set supabase env vars before any imports that might trigger supabase client creation
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(() => ({ user: null, isLoading: false })),
}));

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    colorSchemeId: "neon",
    getColorScheme: () => ({
      id: "neon",
      name: "Neon",
      accent: "#ff00ff",
      accentFrom: "#ff00ff",
      accentTo: "#00ffff",
      text: "#ffffff",
      bg: "#0a0a0f",
      colors: { theme500: "6, 182, 212", glow: "0, 255, 255" },
    }),
    hasHydrated: true,
  }),
}));

jest.mock("@/hooks/modal/usePulseUploadModal", () => ({
  __esModule: true,
  default: () => ({ isOpen: true, onClose: jest.fn() }),
}));

jest.mock("@/hooks/data/usePulseUploadMutation", () => ({
  __esModule: true,
  default: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

// These components use default imports, so mock them with __esModule + default
jest.mock("@/components/common/Input", () => ({
  __esModule: true,
  default: "input",
}));
jest.mock("@/components/common/Button", () => ({
  __esModule: true,
  default: "button",
}));
jest.mock("@/components/Modals/Modal", () => ({
  __esModule: true,
  default: "div",
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ data: null, error: null }) }),
    auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
  }),
}));

describe("components/Modals/PulseUploadModal", () => {
  it("PulseUploadModalがレンダリングされる", () => {
    const { container } = render(<PulseUploadModal />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
