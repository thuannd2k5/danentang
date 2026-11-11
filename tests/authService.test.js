const { validateAuthInput } = require('../src/services/authService');

describe('authService validation', () => {
  it('should reject empty email or short password', () => {
    expect(validateAuthInput('', '123456').isValid).toBe(false);
    expect(validateAuthInput('admin@example.com', '123').isValid).toBe(false);
    expect(validateAuthInput('not-an-email', '123456').isValid).toBe(false);
  });

  it('should accept valid email and password >= 6 chars', () => {
    const result = validateAuthInput('admin@example.com', '123456');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });
});
