module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  coverageDirectory: '.test_coverage',
  collectCoverageFrom: [
    "src/**/*.{js,ts}"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
