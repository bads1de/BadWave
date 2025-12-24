import "@testing-library/jest-dom";

// グローバルなモックの設定
global.fetch = jest.fn();
global.console.error = jest.fn();

// next/image モック
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require("react");
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return React.createElement("img", props);
  },
}));

// 各テスト後にモックをリセット
afterEach(() => {
  jest.clearAllMocks();
});
