/**
 * COMPONENT ProductCard - Thẻ sản phẩm dạng danh sách (list view)
 * 
 * Hiển thị sản phẩm theo chiều ngang với:
 * - Hình ảnh bên trái (110x150px)
 * - Thông tin bên phải: tên, mô tả, sao đánh giá, giá
 * - Hàng nút hành động phía dưới:
 *   + Admin: nút Edit (xanh) + Delete (đỏ)
 *   + User: nút Add to Cart (vàng) + Detail (tím)
 * 
 * Dùng trong ProductListScreen khi ở chế độ list view
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../types/Product';

interface ProductCardProps {
    product: Product;
    isAdmin: boolean;
    onPress: () => void;
    onAddToCart?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    style?: object;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin, onPress, onAddToCart, onEdit, onDelete, style }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= Math.round(rating) ? 'star' : 'star-outline'}
                    size={12}
                    color={i <= Math.round(rating) ? '#F59E0B' : '#4B5563'}
                />
            );
        }
        return stars;
    };

    return (
        <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.88}>
            {product.image ? (
                <Image source={{ uri: product.image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#4B5563" />
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{product.description || 'No description'}</Text>
                <View style={styles.ratingRow}>
                    {renderStars(product.rating ?? 0)}
                    <Text style={styles.ratingText}>{(product.rating ?? 0).toFixed(1)}</Text>
                </View>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                <View style={styles.actionRow}>
                    {isAdmin ? (
                        <>
                            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
                                <Ionicons name="create-outline" size={14} color="#fff" />
                                <Text style={styles.btnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                                <Ionicons name="trash-outline" size={14} color="#fff" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.cartBtn} onPress={onAddToCart}>
                                <Ionicons name="cart-outline" size={14} color="#fff" />
                                <Text style={styles.btnText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
                                <Ionicons name="eye-outline" size={14} color="#fff" />
                                <Text style={styles.btnText}>Detail</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(ProductCard);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', backgroundColor: '#1E1E30', borderRadius: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#2D2D45', overflow: 'hidden',
    },
    image: { width: 110, height: 150, resizeMode: 'cover' },
    imagePlaceholder: { width: 110, height: 150, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, padding: 12, justifyContent: 'space-between' },
    name: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
    desc: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 17 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    ratingText: { fontSize: 11, color: '#9CA3AF', marginLeft: 4 },
    price: { fontSize: 20, fontWeight: '800', color: '#A78BFA', marginTop: 4 },
    actionRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
    cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6366F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    deleteBtn: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});
