import "@testing-library/jest-dom";

// グローバルなモックの設定
global.fetch = jest.fn();
global.console.error = jest.fn();

// 各テスト後にモックをリセット
afterEach(() => {
  jest.clearAllMocks();
});
