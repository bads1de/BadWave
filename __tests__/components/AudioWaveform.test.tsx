import { render, screen } from "@testing-library/react";
import AudioWaveform from "@/components/AudioWaveform";

jest.mock("@/libs/audio/AudioEngine", () => {
  const mockAnalyser = {
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn(),
  };
  const mockAudioCtx = {
    createAnalyser: () => mockAnalyser,
    currentTime: 0,
    sampleRate: 44100,
  };
  return {
    AudioEngine: {
      getInstance: jest.fn(() => ({
        audioCtx: mockAudioCtx,
        analyser: mockAnalyser,
        audio: {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          currentTime: 0,
        },
      })),
    },
  };
});

jest.mock("@/hooks/stores/useEqualizerStore", () => ({
  __esModule: true,
  default: () => ({
    bands: [
      { freq: 60, gain: 0 },
      { freq: 230, gain: 0 },
      { freq: 910, gain: 0 },
      { freq: 4000, gain: 0 },
      { freq: 14000, gain: 0 },
    ],
    isEnabled: false,
  }),
}));

jest.mock("framer-motion", () => ({
  motion: { div: "div", canvas: "canvas" },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock("next/image", () => "img");

// Mock AudioContext for Jest environment (not available in jsdom)
class MockAudioContext {
  createAnalyser() {
    return {
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
  createMediaElementSource() {
    return { connect: jest.fn() };
  }
  get currentTime() { return 0; }
  get sampleRate() { return 44100; }
  close() { return Promise.resolve(); }
  resume() { return Promise.resolve(); }
}

const mockAudioContext = new MockAudioContext();
(window as any).AudioContext = jest.fn(() => mockAudioContext);
(window as any).webkitAudioContext = undefined;

beforeEach(() => {
  const mockContext = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    canvas: { width: 300, height: 100 },
  } as unknown as CanvasRenderingContext2D;

  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockContext);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("components/AudioWaveform", () => {
  const defaultProps = {
    audioUrl: "/songs/test.mp3",
    songId: "song-1",
    primaryColor: "#ff00ff",
    secondaryColor: "#00ffff",
    imageUrl: "/images/test.jpg",
    onPlayPause: jest.fn(),
    onEnded: jest.fn(),
  };

  it("AudioWaveformがレンダリングされる", () => {
    const { container } = render(<AudioWaveform {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("canvas要素が存在する", () => {
    render(<AudioWaveform {...defaultProps} />);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
