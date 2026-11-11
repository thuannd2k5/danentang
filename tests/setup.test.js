const fs = require('fs');
const path = require('path');

describe('Environment Setup', () => {
  it('should verify project configuration files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../package.json'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../app.json'))).toBe(true);
  });
});
