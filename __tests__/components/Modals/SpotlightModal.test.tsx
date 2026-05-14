import { render, screen } from "@testing-library/react";
import SpotlightModal from "@/components/Modals/SpotlightModal";

// Mock HTMLVideoElement.play to return a Promise (needed for the .catch() call in the component)
beforeEach(() => {
  jest.spyOn(HTMLVideoElement.prototype, "play").mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock("next/image", () => "img");

jest.mock("framer-motion", () => ({
  motion: { div: "div" },
  AnimatePresence: ({ children }: any) => children,
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

const mockSelectedItem = {
  id: "spotlight-1",
  title: "Test Spotlight",
  author: "Test Author",
  description: "This is a test description",
  genre: "Electronic",
  href: "/spotlight/test",
  image: "/images/test.jpg",
  video_path: "/videos/test.mp4",
};

jest.mock("@/hooks/modal/useSpotlightModal", () => {
  const state: any = {};
  const store = (selector?: any) => {
    const data = {
      isOpen: true,
      onClose: jest.fn(),
      selectedItem: mockSelectedItem,
    };
    return selector ? selector(data) : data;
  };
  store.getState = () => ({ selectedItem: mockSelectedItem });
  store.setState = jest.fn();
  store.subscribe = jest.fn();
  store.destroy = jest.fn();
  return {
    __esModule: true,
    default: store,
  };
});

jest.mock("@/hooks/stores/useVolumeStore", () => ({
  __esModule: true,
  default: () => ({ volume: 0.8 }),
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: "div",
  AvatarImage: "img",
  AvatarFallback: "div",
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Dialog component from shadcn/ui
jest.mock("@/components/ui/dialog", () => ({
  Dialog: "div",
  DialogContent: "div",
  DialogHeader: "div",
  DialogTitle: "div",
  DialogDescription: "div",
}));

describe("components/Modals/SpotlightModal", () => {
  it("スポットライトのタイトルが表示される", () => {
    render(<SpotlightModal />);
    expect(screen.getByText("Test Spotlight")).toBeInTheDocument();
  });

  it("作者名が表示される", () => {
    render(<SpotlightModal />);
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("説明文が表示される", () => {
    render(<SpotlightModal />);
    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });
});
