import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Kiểm tra tính hợp lệ của thông tin xác thực
 */
export function validateAuthInput(email, password) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email không được để trống.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Email không đúng định dạng.' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }

  return { isValid: true, error: null };
}

/**
 * Đăng nhập quản trị viên
 */
export async function loginAdmin(email, password) {
  const check = validateAuthInput(email, password);
  if (!check.isValid) {
    throw new Error(check.error);
  }
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

/**
 * Đăng ký tài khoản quản trị mới
 */
export async function registerAdmin(email, password) {
  const check = validateAuthInput(email, password);
  if (!check.isValid) {
    throw new Error(check.error);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

/**
 * Đăng xuất
 */
export async function logoutAdmin() {
  await signOut(auth);
}

/**
 * Lắng nghe thay đổi trạng thái đăng nhập
 */
export function onAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Hỗ trợ CommonJS cho Jest unit tests nếu cần
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateAuthInput,
    loginAdmin,
    registerAdmin,
    logoutAdmin,
    onAuthState,
  };
}
