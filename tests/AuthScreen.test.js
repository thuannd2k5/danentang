const AuthScreenModule = require('../src/screens/AuthScreen');

describe('AuthScreen component module', () => {
  it('should export AuthScreen component', () => {
    expect(AuthScreenModule).toBeDefined();
    const AuthScreen = AuthScreenModule.default || AuthScreenModule;
    expect(typeof AuthScreen).toBe('function');
  });
});
