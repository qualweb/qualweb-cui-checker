module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {},
  collectCoverage: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.spec.json'
    }],
    '^.+\\.js$': 'babel-jest', 
},
setupFilesAfterEnv: ['./jest.setup.js'],
transformIgnorePatterns: ['/node_modules/(?!axios|some-other-package)']
};