import type { Config } from 'jest'

// noinspection JSUnusedGlobalSymbols
export default <Config>{
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^webextension-polyfill$': '<rootDir>/__mocks__/browser.ts',
  },
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  verbose: true,
}
