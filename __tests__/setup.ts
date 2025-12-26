import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Polyfill for ReadableStream
if (typeof global.ReadableStream === "undefined") {
  // @ts-ignore
  global.ReadableStream = require("stream/web").ReadableStream;
}

// Polyfill for BroadcastChannel (often needed for React Query)
if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = class BroadcastChannel {
    name: string;
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null =
      null;
    onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null =
      null;

    constructor(name: string) {
      this.name = name;
    }
    postMessage(message: any): void {}
    close(): void {}
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void {}
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void {}
    dispatchEvent(event: Event): boolean {
      return true;
    }
  } as any;
}

// Global mocks
global.fetch = jest.fn();
global.console.error = jest.fn();

// Next/Image mock
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require("react");
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return React.createElement("img", props);
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});
