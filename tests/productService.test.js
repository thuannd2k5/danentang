const {
  sanitizeProduct,
  validateProduct,
  filterAndSortProducts,
  exportProductsToJSONString,
} = require('../src/services/productService');

describe('productService - Strict 4-Field Schema and Utilities', () => {
  it('sanitizeProduct should strictly keep only name, price, soluong, image and remove any extra fields', () => {
    const rawInput = {
      name: '  Áo Khoác Gió Nam  ',
      price: '350000',
      soluong: '15',
      image: 'https://example.com/image.jpg',
      category: 'Clothing',     // Extra field - must be removed!
      createdAt: '2026-11-11',   // Extra field - must be removed!
      description: 'Super warm', // Extra field - must be removed!
      _id: 'abc123xyz'           // Extra field - must be removed!
    };

    const sanitized = sanitizeProduct(rawInput);

    expect(sanitized).toEqual({
      name: 'Áo Khoác Gió Nam',
      price: 350000,
      soluong: 15,
      image: 'https://example.com/image.jpg'
    });

    // Verify exactly only 4 keys exist
    expect(Object.keys(sanitized).sort()).toEqual(['image', 'name', 'price', 'soluong']);
  });

  it('validateProduct should reject negative or empty values', () => {
    expect(validateProduct({ name: '', price: 100, soluong: 5, image: 'url' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo', price: -50, soluong: 5, image: 'url' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo', price: 100, soluong: -1, image: 'url' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo', price: 100, soluong: 5, image: '' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo Thun', price: 120000, soluong: 10, image: 'https://img.com/1.jpg' }).isValid).toBe(true);
  });

  it('validateProduct should reject non-numeric price and non-integer quantity (Finding 3)', () => {
    expect(validateProduct({ name: 'Áo', price: 'abc', soluong: 5, image: 'url' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo', price: 100, soluong: 'xyz', image: 'url' }).isValid).toBe(false);
    expect(validateProduct({ name: 'Áo', price: 100, soluong: 2.5, image: 'url' }).isValid).toBe(false);
  });

  it('filterAndSortProducts should search by keyword case-insensitively and sort accurately', () => {
    const products = [
      { id: '1', name: 'Bàn phím cơ', price: 1500000, soluong: 5, image: 'img1' },
      { id: '2', name: 'Chuột không dây', price: 350000, soluong: 20, image: 'img2' },
      { id: '3', name: 'Tai nghe Bluetooth', price: 800000, soluong: 12, image: 'img3' },
    ];

    // Search
    const searchResult = filterAndSortProducts(products, { keyword: 'chuột' });
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].name).toBe('Chuột không dây');

    // Search with unaccented keyword (Finding 4)
    const unaccentedResult = filterAndSortProducts(products, { keyword: 'ban phim' });
    expect(unaccentedResult.length).toBe(1);
    expect(unaccentedResult[0].name).toBe('Bàn phím cơ');

    // Sort by price ascending
    const sortedByPriceAsc = filterAndSortProducts(products, { sortBy: 'price', sortOrder: 'asc' });
    expect(sortedByPriceAsc[0].price).toBe(350000);
    expect(sortedByPriceAsc[2].price).toBe(1500000);

    // Sort by soluong descending
    const sortedByQtyDesc = filterAndSortProducts(products, { sortBy: 'soluong', sortOrder: 'desc' });
    expect(sortedByQtyDesc[0].soluong).toBe(20);
    expect(sortedByQtyDesc[2].soluong).toBe(5);
  });

  it('exportProductsToJSONString should format array strictly with 4 fields', () => {
    const products = [
      { id: 'doc1', name: 'Sản phẩm 1', price: 1000, soluong: 2, image: 'url1', ignoredField: true },
    ];

    const jsonString = exportProductsToJSONString(products);
    const parsed = JSON.parse(jsonString);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toEqual({
      name: 'Sản phẩm 1',
      price: 1000,
      soluong: 2,
      image: 'url1'
    });
    expect(parsed[0].id).toBeUndefined();
    expect(parsed[0].ignoredField).toBeUndefined();
  });
});
