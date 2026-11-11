module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^expo-image-picker$': '<rootDir>/tests/mocks/expoImagePickerMock.js',
  },
};
