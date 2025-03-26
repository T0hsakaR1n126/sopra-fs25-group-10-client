import type { Config } from "jest";

const jestConfig: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: ["app/**/*.tsx", "components/**/*.tsx"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
};

export default jestConfig;
