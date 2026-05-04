import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // ts-jest uses the main tsconfig.json which includes both src and tests
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  // Collect coverage from all source files, excluding entry points
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/database/prisma.ts',
  ],
  // Pipeline fails automatically if any threshold is not met
  coverageThreshold: {
    global: {
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
  coverageReporters: ['text', 'lcov', 'cobertura', 'json-summary'],
  coverageDirectory: 'coverage',
};

export default config;
