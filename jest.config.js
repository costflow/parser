/* eslint-env node */
module.exports = {
    collectCoverageFrom: [
        "**/src/**/*.{js,ts,tsx}",
        "!**/*.d.ts",
        "!**/*.spec.{ts,tsx}",
        "!**/spec/**/.{ts,tsx}",
        "!**/test/**/.{ts,tsx}",
        "!**/node_modules/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: [
        "text",
        "text-summary",
        // "json",
        "lcov",
        // "clover",
    ],
    preset: "ts-jest",
    rootDir: process.cwd(),
    testEnvironment: "node",
    testRunner: "jest-circus/runner",
};
