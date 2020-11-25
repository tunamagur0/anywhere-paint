module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // setupFiles: ['jest-canvas-mock'],
  setupFiles: ['<rootDir>/src/__mocks__/setup.ts'],
};
