module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(axios|microsoft-cognitiveservices-speech-sdk)/)"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^microsoft-cognitiveservices-speech-sdk$": "<rootDir>/src/__mocks__/microsoft-cognitiveservices-speech-sdk.js"
  },
  testMatch: [
    "**/src/**/*.test.js" // Match test files in src
  ],
  testEnvironment: "jsdom", // Add this to handle DOM-related tests
};
