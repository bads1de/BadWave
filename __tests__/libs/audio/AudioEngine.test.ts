/**
 * @jest-environment jsdom
 */
import { AudioEngine } from "@/libs/audio/AudioEngine";

// Web Audio API Mocks
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockStart = jest.fn();
let mockLinearRampToValueAtTime = jest.fn();
let mockExponentialRampToValueAtTime = jest.fn();
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
  curve: null,
  oversample: "none",
  type: "sine",
});

let mockAudioContext: any;

function resetMocks() {
  mockLinearRampToValueAtTime = jest.fn();
  mockExponentialRampToValueAtTime = jest.fn();

  mockAudioContext = {
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
      start: jest.fn(),
    })),
    createBuffer: jest.fn(() => ({
      getChannelData: jest.fn(() => new Float32Array(100)),
    })),
    currentTime: 0,
    sampleRate: 44100,
    state: "suspended",
    resume: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  resetMocks();
  (global.AudioContext as jest.Mock) = jest.fn(() => mockAudioContext);
  (global.Audio as jest.Mock) = jest.fn(() => ({
    crossOrigin: "",
    preservesPitch: true,
  })) as any;
  (AudioEngine as any).instance = null;
});

describe("AudioEngine", () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = AudioEngine.getInstance();
  });

  describe("Singleton", () => {
    it("should be a singleton", () => {
      const engine2 = AudioEngine.getInstance();
      expect(engine).toBe(engine2);
    });
  });

  describe("initialize", () => {
    it("should initialize audio graph correctly", () => {
      engine.initialize();

      expect(mockAudioContext.createMediaElementSource).toHaveBeenCalled();
      expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createStereoPanner).toHaveBeenCalled();
      expect(engine.isInitialized).toBe(true);
    });

    it("should not re-initialize if already initialized", () => {
      engine.initialize();
      jest.clearAllMocks();

      // Second call should be a no-op
      engine.initialize();

      expect(mockAudioContext.createMediaElementSource).not.toHaveBeenCalled();
    });

    it("should not initialize when audio element is null", () => {
      // Set audio to null to trigger early return
      engine.audio = null;
      engine.initialize();

      // AudioContext should not be created
      expect(engine.isInitialized).toBe(false);
    });

    it("should not fail when webkitAudioContext is used", () => {
      // Remove standard AudioContext, use webkit
      (global.AudioContext as any) = undefined;
      (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

      const engine2 = AudioEngine.getInstance();
      engine2.initialize();

      expect(engine2.isInitialized).toBe(true);
    });

    it("should catch initialization error when AudioContext is unavailable", () => {
      // Both AudioContext and webkitAudioContext are undefined
      (global.AudioContext as any) = undefined;
      (global as any).webkitAudioContext = undefined;

      const engine2 = AudioEngine.getInstance();
      // Should not throw, should catch error gracefully
      engine2.initialize();

      expect(engine2.isInitialized).toBe(false);
    });
  });

  describe("resumeContext", () => {
    it("should resume suspended context", async () => {
      engine.initialize();
      await engine.resumeContext();

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it("should not resume context when not suspended", async () => {
      engine.initialize();
      mockAudioContext.state = "running";

      await engine.resumeContext();

      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });

  describe("setReverbGain", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should set reverb gain within valid range", () => {
      engine.setReverbGain(0.5);
      expect(engine.reverbGainNode?.gain.value).toBe(0.5);
    });

    it("should clamp reverb gain to min 0", () => {
      engine.setReverbGain(-1);
      expect(engine.reverbGainNode?.gain.value).toBe(0);
    });

    it("should clamp reverb gain to max 2.0", () => {
      engine.setReverbGain(5);
      expect(engine.reverbGainNode?.gain.value).toBe(2.0);
    });
  });

  describe("Spatial Mode", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should enable spatial mode", () => {
      engine.setSpatialMode(true);
      expect(
        mockExponentialRampToValueAtTime
      ).toHaveBeenCalled();
      // Reverb should be set to 0.8
      expect(engine.reverbGainNode?.gain.value).toBe(0.8);
    });

    it("should disable spatial mode", () => {
      engine.setSpatialMode(false);
      expect(
        mockExponentialRampToValueAtTime
      ).toHaveBeenCalled();
    });

    it("should return early when spatialFilter is null", () => {
      engine.spatialFilter = null;
      // Should not throw
      engine.setSpatialMode(true);
    });
  });

  describe("Slowed Reverb Mode", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should enable slowed reverb mode", () => {
      engine.setSlowedReverbMode(true);
      expect(engine.reverbGainNode?.gain.value).toBe(0.6);
    });

    it("should disable slowed reverb mode", () => {
      engine.setSlowedReverbMode(false);
      expect(engine.reverbGainNode?.gain.value).toBe(0);
    });
  });

  describe("setPreservesPitch", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should set preservesPitch on audio element", () => {
      engine.setPreservesPitch(true);
      expect((engine.audio as any).preservesPitch).toBe(true);
      expect((engine.audio as any).mozPreservesPitch).toBe(true);
      expect((engine.audio as any).webkitPreservesPitch).toBe(true);
    });

    it("should return early when audio is null", () => {
      engine.audio = null;
      // Should not throw
      engine.setPreservesPitch(false);
    });
  });

  describe("8D Audio Mode", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should enable 8D audio", () => {
      engine.set8DAudioMode(true, 4);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalled();
    });

    it("should disable 8D audio", () => {
      engine.set8DAudioMode(false);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalled();
    });

    it("should return early when lfoGain is null", () => {
      (engine as any).lfoGain = null;
      // Should not throw
      engine.set8DAudioMode(true);
    });

    it("should update rotation speed when 8D is active", () => {
      // First enable 8D
      engine.set8DAudioMode(true, 4);
      jest.clearAllMocks();

      // Update speed (uses linearRampToValueAtTime internally)
      engine.set8DRotationSpeed(2);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalledWith(0.5, expect.any(Number));
    });

    it("should not update rotation speed when 8D is not active", () => {
      // is8DAudioActive is false by default, so set8DRotationSpeed returns early
      engine.set8DRotationSpeed(2);
      expect(mockLinearRampToValueAtTime).not.toHaveBeenCalled();
    });
  });

  describe("Retro Mode", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should enable retro mode", () => {
      engine.setRetroMode(true);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalled();
    });

    it("should disable retro mode", () => {
      engine.setRetroMode(false);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalled();
    });

    it("should return early when retro nodes are null", () => {
      engine.retroLowPass = null;
      // Should not throw
      engine.setRetroMode(true);
    });

    it("should return early when context is null", () => {
      engine.context = null;
      // Should not throw
      engine.setRetroMode(true);
    });
  });

  describe("Bass Boost Mode", () => {
    beforeEach(() => {
      engine.initialize();
    });

    it("should enable bass boost", () => {
      engine.setBassBoostMode(true);
      // Uses linearRampToValueAtTime internally, not direct assignment
      expect(mockLinearRampToValueAtTime).toHaveBeenCalledWith(9, expect.any(Number));
    });

    it("should disable bass boost", () => {
      jest.clearAllMocks();
      engine.setBassBoostMode(false);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
    });

    it("should return early when bassBoostFilter is null", () => {
      engine.bassBoostFilter = null;
      // Should not throw
      engine.setBassBoostMode(true);
    });
  });
});
