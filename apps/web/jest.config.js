const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to Next.js app to load next.config.js and .env
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if custom paths are added in tsconfig)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
