jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const { generateStoragePath } = require('../src/services/storageService');

describe('storageService', () => {
  it('generateStoragePath should generate unique file paths in products directory', () => {
    const path1 = generateStoragePath('jpg');
    const path2 = generateStoragePath('png');

    expect(path1).toMatch(/^products\/\d+_[a-z0-9]+\.jpg$/);
    expect(path2).toMatch(/^products\/\d+_[a-z0-9]+\.png$/);
    expect(path1).not.toBe(path2);
  });
});
