import { render } from "@testing-library/react";
import FrequencyCurve from "@/components/Equalizer/FrequencyCurve";

describe("components/Equalizer/FrequencyCurve", () => {
  const defaultBands = [
    { freq: 60, gain: 0 },
    { freq: 230, gain: 0 },
    { freq: 910, gain: 0 },
    { freq: 4000, gain: 0 },
    { freq: 10000, gain: 0 },
    { freq: 16000, gain: 0 },
  ];

  it("SVGがレンダリングされる", () => {
    const { container } = render(
      <FrequencyCurve bands={defaultBands} isEnabled={true} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("無効状態でもレンダリングされる", () => {
    const { container } = render(
      <FrequencyCurve bands={defaultBands} isEnabled={false} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("空のバンド配列でもエラーにならない", () => {
    const { container } = render(<FrequencyCurve bands={[]} isEnabled={true} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
