const ProductCard = require('../src/components/ProductCard').default || require('../src/components/ProductCard');
const ProductTable = require('../src/components/ProductTable').default || require('../src/components/ProductTable');
const ProductModal = require('../src/components/ProductModal').default || require('../src/components/ProductModal');

describe('UI Components', () => {
  it('should export all required dashboard components', () => {
    expect(typeof ProductCard).toBe('function');
    expect(typeof ProductTable).toBe('function');
    expect(typeof ProductModal).toBe('function');
  });
});
