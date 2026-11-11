import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { pickImageFromDevice, uploadProductImage } from '../services/storageService';
import { validateProduct } from '../services/productService';

export default function ProductModal({ visible, product, onClose, onSave }) {
  const isEditing = Boolean(product && product.id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [soluong, setSoluong] = useState('');
  const [imageUri, setImageUri] = useState(''); // Local uri or existing remote url
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price ? String(product.price) : '');
      setSoluong(product.soluong !== undefined ? String(product.soluong) : '');
      setImageUri(product.image || '');
      setIsNewImageSelected(false);
    } else {
      setName('');
      setPrice('');
      setSoluong('');
      setImageUri('');
      setIsNewImageSelected(false);
    }
  }, [product, visible]);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePickImage = async () => {
    try {
      const pickedUri = await pickImageFromDevice();
      if (pickedUri) {
        setImageUri(pickedUri);
        setIsNewImageSelected(true);
      }
    } catch (error) {
      showAlert('Lỗi chọn ảnh', error.message);
    }
  };

  const handleSubmit = async () => {
    // Client-side quick check
    if (!name.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || price.trim() === '') {
      showAlert('Thông báo', 'Đơn giá phải là số không âm.');
      return;
    }
    const numSoluong = Number(soluong);
    if (isNaN(numSoluong) || numSoluong < 0 || soluong.trim() === '') {
      showAlert('Thông báo', 'Số lượng phải là số nguyên không âm.');
      return;
    }
    if (!imageUri) {
      showAlert('Thông báo', 'Vui lòng chọn hình ảnh cho sản phẩm.');
      return;
    }

    try {
      setLoading(true);
      let finalImageUrl = imageUri;

      // Nếu người dùng vừa chọn ảnh mới từ thiết bị, tiến hành upload lên Firebase Storage
      if (isNewImageSelected) {
        setLoadingText('Đang tải ảnh lên Firebase Storage...');
        finalImageUrl = await uploadProductImage(imageUri);
      }

      setLoadingText('Đang lưu thông tin vào Firestore...');

      // Dữ liệu chỉ gồm đúng 4 trường theo quy định đề bài
      const productPayload = {
        name: name.trim(),
        price: numPrice,
        soluong: numSoluong,
        image: finalImageUrl,
      };

      const validation = validateProduct(productPayload);
      if (!validation.isValid) {
        showAlert('Lỗi dữ liệu', validation.error);
        return;
      }

      await onSave(productPayload, product ? product.id : null);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      showAlert('Lỗi', 'Không thể lưu sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </Text>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tên sản phẩm (name) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Áo Sơ Mi Nam Công Sở"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Đơn giá (price - VNĐ) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="250000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  editable={!loading}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số lượng tồn (soluong) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={soluong}
                  onChangeText={setSoluong}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Image Picker Section */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Hình ảnh sản phẩm (image) *</Text>
              
              <View style={styles.imagePickerContainer}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>Chưa có ảnh</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.btnPickImage, loading && styles.btnDisabled]}
                  onPress={handlePickImage}
                  disabled={loading}
                >
                  <Text style={styles.btnPickImageText}>
                    {imageUri ? '📷 Đổi ảnh khác' : '📷 Chọn ảnh từ thiết bị'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Loading text */}
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#3b82f6" />
                <Text style={styles.loadingText}>{loadingText || 'Đang xử lý...'}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnCancel]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAction, styles.btnSave, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.btnSaveText}>
                  {isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  closeBtn: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '700',
    padding: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  rowFields: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f8fafc',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#64748b',
  },
  placeholderText: {
    fontSize: 11,
    color: '#64748b',
  },
  btnPickImage: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  btnPickImageText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: '#38bdf8',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  btnAction: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: '#334155',
  },
  btnCancelText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSave: {
    backgroundColor: '#2563eb',
  },
  btnSaveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
