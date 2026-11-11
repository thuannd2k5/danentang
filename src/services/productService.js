import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'products';

/**
 * Chuẩn hóa và lọc sạch dữ liệu:
 * Tuyệt đối CHỈ GIỮ LẠI đúng 4 trường: name, price, soluong, image.
 * Loại bỏ mọi trường phụ để tuân thủ 100% yêu cầu đề bài.
 */
export function sanitizeProduct(data = {}) {
  const name = typeof data.name === 'string' ? data.name.trim() : String(data.name || '').trim();
  const price = Number(data.price);
  const soluong = Number(data.soluong);
  const image = typeof data.image === 'string' ? data.image.trim() : String(data.image || '').trim();

  return {
    name,
    price: Number.isFinite(price) ? price : 0,
    soluong: Number.isFinite(soluong) ? soluong : 0,
    image,
  };
}

/**
 * Chuẩn hóa chuỗi loại bỏ dấu tiếng Việt để tìm kiếm thông minh
 */
export function removeVietnameseTones(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Kiểm tra tính hợp lệ của sản phẩm trước khi lưu
 */
export function validateProduct(product = {}) {
  const name = typeof product.name === 'string' ? product.name.trim() : '';
  if (!name) {
    return { isValid: false, error: 'Tên sản phẩm không được để trống.' };
  }

  // Kiểm tra Giá (price)
  if (
    product.price === undefined ||
    product.price === null ||
    String(product.price).trim() === '' ||
    isNaN(Number(product.price))
  ) {
    return { isValid: false, error: 'Giá sản phẩm phải là một số hợp lệ.' };
  }
  const price = Number(product.price);
  if (price < 0) {
    return { isValid: false, error: 'Giá sản phẩm không được là số âm.' };
  }

  // Kiểm tra Số lượng (soluong)
  if (
    product.soluong === undefined ||
    product.soluong === null ||
    String(product.soluong).trim() === '' ||
    isNaN(Number(product.soluong))
  ) {
    return { isValid: false, error: 'Số lượng sản phẩm phải là một số hợp lệ.' };
  }
  const soluong = Number(product.soluong);
  if (soluong < 0 || !Number.isInteger(soluong)) {
    return { isValid: false, error: 'Số lượng sản phẩm phải là số nguyên không âm.' };
  }

  // Kiểm tra Hình ảnh (image)
  const image = typeof product.image === 'string' ? product.image.trim() : '';
  if (!image) {
    return { isValid: false, error: 'Hình ảnh sản phẩm là bắt buộc.' };
  }

  const sanitized = {
    name,
    price,
    soluong,
    image,
  };

  return { isValid: true, error: null, sanitized };
}

/**
 * Thêm sản phẩm mới vào Firestore
 */
export async function addProduct(productData) {
  const validation = validateProduct(productData);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), validation.sanitized);
  return docRef.id;
}

/**
 * Lấy danh sách toàn bộ sản phẩm từ Firestore
 */
export async function getProducts() {
  const q = query(collection(db, COLLECTION_NAME));
  const querySnapshot = await getDocs(q);
  const products = [];

  querySnapshot.forEach((docItem) => {
    const data = docItem.data();
    products.push({
      id: docItem.id,
      name: data.name,
      price: Number(data.price) || 0,
      soluong: Number(data.soluong) || 0,
      image: data.image || '',
    });
  });

  return products;
}

/**
 * Cập nhật thông tin sản phẩm
 */
export async function updateProduct(id, productData) {
  if (!id) throw new Error('ID sản phẩm không hợp lệ.');
  const validation = validateProduct(productData);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const productRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(productRef, validation.sanitized);
}

/**
 * Xóa sản phẩm khỏi Firestore
 */
export async function deleteProduct(id) {
  if (!id) throw new Error('ID sản phẩm không hợp lệ.');
  const productRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(productRef);
}

/**
 * Lọc và sắp xếp sản phẩm phía client (Realtime Search & Sort)
 */
export function filterAndSortProducts(products = [], options = {}) {
  const { keyword = '', sortBy = '', sortOrder = 'asc' } = options;

  let result = [...products];

  // Tìm kiếm theo tên (hỗ trợ cả tiếng Việt có dấu và không dấu)
  if (keyword && keyword.trim()) {
    const normalizedKeyword = removeVietnameseTones(keyword.trim());
    result = result.filter((p) => {
      if (!p.name) return false;
      const normalizedName = removeVietnameseTones(p.name);
      return (
        p.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        normalizedName.includes(normalizedKeyword)
      );
    });
  }

  // Sắp xếp
  if (sortBy) {
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }

  return result;
}

/**
 * Xuất dữ liệu CSDL ra chuỗi JSON chuẩn 4 trường phục vụ nộp bài
 */
export function exportProductsToJSONString(products = []) {
  const cleanList = products.map((item) => sanitizeProduct(item));
  return JSON.stringify(cleanList, null, 2);
}

// Hỗ trợ CommonJS cho Jest tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLLECTION_NAME,
    removeVietnameseTones,
    sanitizeProduct,
    validateProduct,
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    filterAndSortProducts,
    exportProductsToJSONString,
  };
}
