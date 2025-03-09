/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
  },
  transform: {
    "^.+.(ts|tsx|js|jsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
        babelConfig: true,
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(node-fetch)/)"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};
