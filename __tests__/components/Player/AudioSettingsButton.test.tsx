import { render, screen } from "@testing-library/react";
import AudioSettingsButton from "@/components/Player/AudioSettingsButton";

// ストアのモック
jest.mock("@/hooks/stores/usePlaybackRateStore", () => ({
  __esModule: true,
  default: () => ({ rate: 1.0, setRate: jest.fn() }),
}));

jest.mock("@/hooks/stores/useEqualizerStore", () => ({
  __esModule: true,
  default: () => ({ isEnabled: false, bands: [], setGain: jest.fn(), setPreset: jest.fn(), toggleEnabled: jest.fn(), reset: jest.fn(), presets: [] }),
}));

jest.mock("@/hooks/stores/useEffectStore", () => ({
  __esModule: true,
  default: () => ({
    isSlowedReverb: false,
    is8DAudioEnabled: false,
    isRetroEnabled: false,
    isBassBoostEnabled: false,
    rotationSpeed: "medium",
    toggleSlowedReverb: jest.fn(),
    toggle8DAudio: jest.fn(),
    toggleRetro: jest.fn(),
    toggleBassBoost: jest.fn(),
    setRotationSpeed: jest.fn(),
  }),
}));

jest.mock("@/hooks/stores/useSpatialStore", () => ({
  __esModule: true,
  default: () => ({ isSpatialEnabled: false, toggleSpatialEnabled: jest.fn() }),
}));

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    colorSchemeId: "neon",
    getColorScheme: () => ({
      id: "neon",
      accent: "#ff00ff",
      accentFrom: "#ff00ff",
      accentTo: "#00ffff",
      text: "#ffffff",
      bg: "#0a0a0f",
    }),
  }),
}));

// Popover UIのモック - JSXを使わない
jest.mock("@/components/ui/popover", () => ({
  Popover: "div",
  PopoverContent: "div",
  PopoverTrigger: "div",
}));

// SpeedAndEffectsControl のモック - JSXを使わない
jest.mock("@/components/Player/SpeedAndEffectsControl", () => ({
  __esModule: true,
  default: "div",
}));

// EqualizerControl のモック - JSXを使わない
jest.mock("@/components/Equalizer/EqualizerControl", () => ({
  __esModule: true,
  default: "div",
}));

describe("components/Player/AudioSettingsButton", () => {
  it("AudioSettingsButtonがレンダリングされる", () => {
    const { container } = render(<AudioSettingsButton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
