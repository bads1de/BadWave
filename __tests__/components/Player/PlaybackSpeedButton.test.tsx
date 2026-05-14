import { render } from "@testing-library/react";
import PlaybackSpeedButton from "@/components/Player/PlaybackSpeedButton";

// Zustand stores use selectors - mock needs to handle selector function
jest.mock("@/hooks/stores/usePlaybackRateStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = { rate: 1, setRate: jest.fn(), hasHydrated: true, setHasHydrated: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/hooks/stores/useEffectStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      effects: { slowed: false, spatial: false, rotation8d: false, retro: false, bass: false },
      toggleEffect: jest.fn(),
      set8dSpeed: jest.fn(),
      isSlowedReverbEnabled: false,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
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
      setHasHydrated: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/hooks/stores/useSpatialStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      isEnabled: false,
      toggle: jest.fn(),
      setIntensity: jest.fn(),
      intensity: 50,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: "div",
  PopoverTrigger: "div",
  PopoverContent: "div",
}));

jest.mock("@radix-ui/react-slider", () => ({
  Root: "div",
  Track: "div",
  Range: "div",
  Thumb: "div",
}));

describe("components/Player/PlaybackSpeedButton", () => {
  it("PlaybackSpeedButtonがレンダリングされる", () => {
    const { container } = render(<PlaybackSpeedButton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
