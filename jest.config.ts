export default {
  clearMocks: true,
  coverageProvider: "v8",
  orceCoverageMatch: [],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
};
