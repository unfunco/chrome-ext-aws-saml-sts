// noinspection JSUnusedGlobalSymbols
export default {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
