import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';

export default function ProductTable({ products, onEdit, onDelete }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);

  return (
    <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.colImage, styles.headerText]}>Hình ảnh</Text>
          <Text style={[styles.cell, styles.colName, styles.headerText]}>Tên sản phẩm</Text>
          <Text style={[styles.cell, styles.colPrice, styles.headerText]}>Đơn giá</Text>
          <Text style={[styles.cell, styles.colQty, styles.headerText]}>Số lượng</Text>
          <Text style={[styles.cell, styles.colAction, styles.headerText]}>Thao tác</Text>
        </View>

        {/* Table Body */}
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có sản phẩm nào trong cơ sở dữ liệu.</Text>
          </View>
        ) : (
          products.map((item, index) => (
            <View
              key={item.id || index}
              style={[styles.row, index % 2 === 1 && styles.alternateRow]}
            >
              <View style={[styles.cell, styles.colImage]}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </View>
              <Text style={[styles.cell, styles.colName, styles.nameText]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.cell, styles.colPrice, styles.priceText]}>
                {formatPrice(item.price)}
              </Text>
              <Text style={[styles.cell, styles.colQty, styles.qtyText]}>
                {item.soluong}
              </Text>
              <View style={[styles.cell, styles.colAction, styles.actionCell]}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnEdit]}
                  onPress={() => onEdit(item)}
                >
                  <Text style={styles.btnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnDelete]}
                  onPress={() => onDelete(item)}
                >
                  <Text style={styles.btnText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerRow: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  alternateRow: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  cell: {
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  colImage: {
    width: 90,
    alignItems: 'center',
  },
  colName: {
    flex: 3,
    minWidth: 200,
  },
  colPrice: {
    flex: 2,
    minWidth: 130,
  },
  colQty: {
    flex: 1,
    minWidth: 90,
    textAlign: 'center',
  },
  colAction: {
    width: 140,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  nameText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  priceText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  qtyText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnEdit: {
    backgroundColor: '#2563eb',
  },
  btnDelete: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
