import { render, screen } from "@testing-library/react";
import EqualizerControl from "@/components/Equalizer/EqualizerControl";

jest.mock("@/hooks/stores/useEqualizerStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      bands: [
        { freq: 60, gain: 0 },
        { freq: 230, gain: 0 },
        { freq: 910, gain: 0 },
        { freq: 4000, gain: 0 },
        { freq: 14000, gain: 0 },
      ],
      isEnabled: false,
      activePresetId: "flat",
      presets: [
        { id: "flat", name: "Flat" },
        { id: "rock", name: "Rock" },
        { id: "pop", name: "Pop" },
        { id: "jazz", name: "Jazz" },
        { id: "classical", name: "Classical" },
        { id: "bass", name: "Bass Boost" },
      ],
      setGain: jest.fn(),
      setPreset: jest.fn(),
      toggleEnabled: jest.fn(),
      reset: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
  EQ_BANDS: [
    { freq: 60, label: "60Hz" },
    { freq: 230, label: "230Hz" },
    { freq: 910, label: "910Hz" },
    { freq: 4000, label: "4kHz" },
    { freq: 14000, label: "14kHz" },
  ],
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
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock("@/components/Equalizer/EqSlider", () => "div");
jest.mock("@/components/Equalizer/FrequencyCurve", () => "div");
jest.mock("@/components/ui/switch", () => ({ Switch: "button" }));

describe("components/Equalizer/EqualizerControl", () => {
  it("EqualizerControlがレンダリングされる", () => {
    const { container } = render(<EqualizerControl />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
