import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function ProductCard({ product, onEdit, onDelete }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price || 0);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Số lượng tồn:</Text>
          <Text style={[styles.stockValue, product.soluong === 0 && styles.outOfStock]}>
            {product.soluong}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEdit]}
            onPress={() => onEdit(product)}
          >
            <Text style={styles.btnEditText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            onPress={() => onDelete(product)}
          >
            <Text style={styles.btnDeleteText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 6,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
  },
  outOfStock: {
    color: '#ef4444',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnEdit: {
    backgroundColor: '#3b82f6',
  },
  btnEditText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  btnDelete: {
    backgroundColor: '#ef4444',
  },
  btnDeleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
