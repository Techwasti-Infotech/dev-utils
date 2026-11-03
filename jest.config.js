/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        esModuleInterop: true,
        strict: true
      }
    }]
  },
  moduleDirectories: ['node_modules', 'src'],
  collectCoverageFrom: [
    'src/shared/utils/**/*.ts',
    '!src/**/*.d.ts'
  ]
};

