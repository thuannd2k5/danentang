import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Sinh đường dẫn duy nhất cho ảnh trên Firebase Storage
 */
export function generateStoragePath(extension = 'jpg') {
  const cleanExt = extension.replace(/^\./, '').toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `products/${timestamp}_${randomStr}.${cleanExt}`;
}

/**
 * Mở hộp thoại chọn ảnh từ thiết bị (hoạt động trên cả Web và Mobile)
 */
export async function pickImageFromDevice() {
  try {
    // Yêu cầu quyền truy cập thư viện ảnh nếu cần
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Ứng dụng cần quyền truy cập thư viện ảnh để bạn có thể chọn hình sản phẩm.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Lỗi khi mở thư viện ảnh:', error);
    throw new Error('Không thể mở trình chọn ảnh từ thiết bị: ' + error.message);
  }
}

/**
 * Tải file ảnh lên Firebase Storage và trả về URL công khai
 */
export async function uploadProductImage(uri) {
  if (!uri) throw new Error('Đường dẫn ảnh (URI) không hợp lệ.');

  try {
    // Chuyển đổi URI thành Blob nhị phân
    const response = await fetch(uri);
    const blob = await response.blob();

    // Xác định định dạng file
    let extension = 'jpg';
    if (blob.type && blob.type.includes('/')) {
      extension = blob.type.split('/')[1] || 'jpg';
    }

    const storagePath = generateStoragePath(extension);
    const storageRef = ref(storage, storagePath);

    // Tải lên Firebase Storage
    await uploadBytes(storageRef, blob);

    // Lấy link công khai
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Lỗi tải ảnh lên Firebase Storage:', error);
    throw new Error('Không thể tải ảnh lên Firebase Storage: ' + error.message);
  }
}

// Hỗ trợ CommonJS cho Jest unit tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateStoragePath,
    pickImageFromDevice,
    uploadProductImage,
  };
}
