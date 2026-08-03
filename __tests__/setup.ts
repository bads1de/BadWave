import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream as NodeReadableStream } from "stream/web";

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;

// Polyfill for ReadableStream
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream =
    NodeReadableStream as unknown as typeof globalThis.ReadableStream;
}

// Polyfill for BroadcastChannel (often needed for React Query)
if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = class BroadcastChannel {
    name: string;
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => unknown) | null =
      null;
    onmessageerror:
      | ((this: BroadcastChannel, ev: MessageEvent) => unknown)
      | null = null;

    constructor(name: string) {
      this.name = name;
    }
    postMessage(): void {}
    close(): void {}
    addEventListener(): void {}
    removeEventListener(): void {}
    dispatchEvent(): boolean {
      return true;
    }
  } as unknown as typeof BroadcastChannel;
}

// Global mocks
global.fetch = jest.fn();
global.console.error = jest.fn();

// Next/Image mock
jest.mock("next/image", () => ({
  __esModule: true,
    default: (props: Record<string, unknown>) => {
      const React = jest.requireActual<typeof import("react")>("react");

      return React.createElement("img", props);
    },
}));

// AWS SDK mock
jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});
