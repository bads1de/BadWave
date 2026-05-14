import { render } from "@testing-library/react";
import SpeedAndEffectsControl from "@/components/Player/SpeedAndEffectsControl";

jest.mock("@/hooks/stores/usePlaybackRateStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = { rate: 1, setRate: jest.fn(), hasHydrated: true, setHasHydrated: jest.fn() };
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

jest.mock("@radix-ui/react-slider", () => ({
  Root: "div",
  Track: "div",
  Range: "div",
  Thumb: "div",
}));

describe("components/Player/SpeedAndEffectsControl", () => {
  it("SpeedAndEffectsControlがレンダリングされる", () => {
    const { container } = render(<SpeedAndEffectsControl />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
