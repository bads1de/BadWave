/**
 * @jest-environment jsdom
 */
import { AudioEngine } from "@/libs/audio/AudioEngine";

// Web Audio API Mocks
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockStart = jest.fn();
const mockLinearRampToValueAtTime = jest.fn();
const mockExponentialRampToValueAtTime = jest.fn();
const mockSetTargetAtTime = jest.fn();
const mockCancelScheduledValues = jest.fn();

const createMockAudioNode = () => ({
  connect: mockConnect,
  disconnect: mockDisconnect,
  gain: {
    value: 0,
    linearRampToValueAtTime: mockLinearRampToValueAtTime,
    exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
    setTargetAtTime: mockSetTargetAtTime,
    cancelScheduledValues: mockCancelScheduledValues,
  },
  frequency: {
    value: 0,
    linearRampToValueAtTime: mockLinearRampToValueAtTime,
    exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
    setTargetAtTime: mockSetTargetAtTime,
    cancelScheduledValues: mockCancelScheduledValues,
  },
  pan: {
    value: 0,
  },
  Q: {
    value: 0,
  },
  buffer: null,
  start: mockStart,
});

const mockAudioContext = {
  createMediaElementSource: jest.fn(() => createMockAudioNode()),
  createBiquadFilter: jest.fn(() => createMockAudioNode()),
  createGain: jest.fn(() => createMockAudioNode()),
  createConvolver: jest.fn(() => createMockAudioNode()),
  createStereoPanner: jest.fn(() => createMockAudioNode()),
  createWaveShaper: jest.fn(() => ({
    ...createMockAudioNode(),
    curve: null,
    oversample: "none",
  })),
  createOscillator: jest.fn(() => ({
    ...createMockAudioNode(),
    type: "sine",
  })),
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(100)),
  })),
  currentTime: 0,
  sampleRate: 44100,
  state: "suspended",
  resume: jest.fn(),
};

global.AudioContext = jest.fn(() => mockAudioContext) as any;
global.Audio = jest.fn(() => ({
  crossOrigin: "",
  preservesPitch: true,
})) as any;

describe("AudioEngine", () => {
  let engine: AudioEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    // シングルトンリセット
    (AudioEngine as any).instance = null;
    engine = AudioEngine.getInstance();
  });

  it("should be a singleton", () => {
    const engine2 = AudioEngine.getInstance();
    expect(engine).toBe(engine2);
  });

  it("should initialize audio graph correctly", () => {
    engine.initialize();

    expect(mockAudioContext.createMediaElementSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockAudioContext.createStereoPanner).toHaveBeenCalled();
    expect(engine.isInitialized).toBe(true);
  });

  describe("Effect Controls", () => {
    beforeEach(() => {
      engine.initialize();
      jest.clearAllMocks();
    });

    it("should control 8D Audio mode", () => {
      engine.set8DAudioMode(true, 4);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalled();

      engine.set8DAudioMode(false);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalled();
    });

    it("should control Retro mode", () => {
      engine.setRetroMode(true);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalledTimes(2);

      engine.setRetroMode(false);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalled();
    });

    it("should control Spatial mode", () => {
      engine.setSpatialMode(true);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalled();
    });
  });
});
