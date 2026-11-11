import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  filterAndSortProducts,
  exportProductsToJSONString,
} from '../services/productService';
import { logoutAdmin } from '../services/authService';
import ProductTable from '../components/ProductTable';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function DashboardScreen({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort states
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'price' or 'soluong'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load products from Firestore
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      showAlert('Lỗi', 'Không thể kết nối Firestore: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Apply search & sort when data or controls change
  useEffect(() => {
    const result = filterAndSortProducts(products, { keyword, sortBy, sortOrder });
    setFilteredProducts(result);
  }, [products, keyword, sortBy, sortOrder]);

  // Save product (Add or Edit)
  const handleSaveProduct = async (productData, id) => {
    if (id) {
      await updateProduct(id, productData);
      showAlert('Thành công', 'Cập nhật sản phẩm thành công!');
    } else {
      await addProduct(productData);
      showAlert('Thành công', 'Thêm sản phẩm mới thành công!');
    }
    await loadProducts();
  };

  // Delete product with confirmation
  const handleDeleteProduct = (product) => {
    const confirmDelete = async () => {
      try {
        await deleteProduct(product.id);
        showAlert('Thành công', `Đã xóa sản phẩm "${product.name}".`);
        await loadProducts();
      } catch (error) {
        showAlert('Lỗi', 'Không thể xóa: ' + error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa vĩnh viễn', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    try {
      const jsonStr = exportProductsToJSONString(products);
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'products.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        showAlert(
          'Xuất CSDL JSON',
          `Đã xuất thành công ${products.length} sản phẩm chuẩn 4 trường dữ liệu! (Dữ liệu đã sẵn sàng để nộp bài)`
        );
      }
    } catch (error) {
      showAlert('Lỗi xuất file', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      if (onLogout) onLogout();
    } catch (error) {
      showAlert('Lỗi', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.navTitle}>Admin Dashboard</Text>
          <Text style={styles.navUser}>👤 {user?.email || 'Quản trị viên'}</Text>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.btnExport} onPress={handleExportJSON}>
            <Text style={styles.btnExportText}>📥 Xuất JSON CSDL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Text style={styles.btnLogoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Toolbar: Search, Sort, Add Button */}
        <View style={styles.toolbar}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm theo tên sản phẩm..."
            placeholderTextColor="#94a3b8"
            value={keyword}
            onChangeText={setKeyword}
          />

          <View style={styles.filterGroup}>
            {/* Sort by Price */}
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'price' && styles.sortBtnActive]}
              onPress={() => {
                if (sortBy === 'price') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('price');
                  setSortOrder('asc');
                }
              }}
            >
              <Text style={[styles.sortBtnText, sortBy === 'price' && styles.sortBtnTextActive]}>
                Giá {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            {/* Sort by Quantity */}
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'soluong' && styles.sortBtnActive]}
              onPress={() => {
                if (sortBy === 'soluong') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('soluong');
                  setSortOrder('asc');
                }
              }}
            >
              <Text style={[styles.sortBtnText, sortBy === 'soluong' && styles.sortBtnTextActive]}>
                Số lượng {sortBy === 'soluong' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            {/* Reset Filter */}
            {sortBy ? (
              <TouchableOpacity
                style={styles.btnResetSort}
                onPress={() => {
                  setSortBy('');
                  setSortOrder('asc');
                }}
              >
                <Text style={styles.btnResetSortText}>✕ Mặc định</Text>
              </TouchableOpacity>
            ) : null}

            {/* Add Product Button */}
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => {
                setEditingProduct(null);
                setModalVisible(true);
              }}
            >
              <Text style={styles.btnAddText}>+ Thêm sản phẩm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Đang tải dữ liệu từ Firestore...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {Platform.OS === 'web' ? (
              <ProductTable
                products={filteredProducts}
                onEdit={(item) => {
                  setEditingProduct(item);
                  setModalVisible(true);
                }}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onEdit={(p) => {
                      setEditingProduct(p);
                      setModalVisible(true);
                    }}
                    onDelete={handleDeleteProduct}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Modal Add / Edit */}
      <ProductModal
        visible={modalVisible}
        product={editingProduct}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  navUser: {
    fontSize: 13,
    color: '#94a3b8',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnExport: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnExportText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  btnLogout: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnLogoutText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  sortBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: '#38bdf8',
  },
  btnResetSort: {
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  btnResetSortText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  btnAdd: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnAddText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
