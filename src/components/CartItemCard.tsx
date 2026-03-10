/**
 * COMPONENT CartItemCard - Thẻ sản phẩm trong giỏ hàng
 * 
 * Hiển thị một mặt hàng trong giỏ hàng với:
 * - Hình ảnh nhỏ bên trái (72x72px)
 * - Tên và giá đơn vị
 * - Nút điều chỉnh số lượng: [-] số [+] (stepper)
 * - Tổng tiền của mặt hàng (giá x số lượng) bên phải
 * - Nút xóa (thùng rác) đỏ
 * 
 * Dùng trong CartScreen và CheckoutScreen
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CartItem } from '../types/CartItem';

interface CartItemCardProps {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onIncrease, onDecrease, onRemove }) => (
    <View style={styles.cartItem}>
        {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
            <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color="#4B5563" />
            </View>
        )}
        <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemPrice}>${(item.price ?? 0).toFixed(2)} each</Text>
            <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
                    <Ionicons name="remove" size={18} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={onIncrease}>
                    <Ionicons name="add" size={18} color="#F9FAFB" />
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.itemRight}>
            <Text style={styles.itemTotal}>${((item.price ?? 0) * item.quantity).toFixed(2)}</Text>
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
                <Ionicons name="trash-outline" size={16} color="#F87171" />
            </TouchableOpacity>
        </View>
    </View>
);

export default React.memo(CartItemCard);

const styles = StyleSheet.create({
    cartItem: {
        flexDirection: 'row', backgroundColor: '#1E1E30', borderRadius: 16, marginBottom: 12,
        padding: 14, borderWidth: 1, borderColor: '#2D2D45', alignItems: 'center',
    },
    itemImage: { width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' },
    imagePlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1, marginLeft: 14 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    itemPrice: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
    qtyBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#2D2D45', justifyContent: 'center', alignItems: 'center' },
    qtyBtnPlus: { backgroundColor: '#7C3AED' },
    qtyText: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', minWidth: 24, textAlign: 'center' },
    itemRight: { alignItems: 'flex-end', marginLeft: 8, gap: 8 },
    itemTotal: { fontSize: 16, fontWeight: '800', color: '#A78BFA' },
    removeBtn: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#2D1515',
        borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    },
});
