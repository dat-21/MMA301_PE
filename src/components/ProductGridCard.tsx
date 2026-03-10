/**
 * COMPONENT ProductGridCard - Thẻ sản phẩm dạng lưới (grid view)
 * 
 * Hiển thị sản phẩm theo chiều dọc (card nhỏ) với:
 * - Hình ảnh full width ở trên (140px cao)
 * - Tên sản phẩm (tối đa 2 dòng)
 * - Sao đánh giá nhỏ
 * - Giá và nút thêm giỏ hàng (+) ở hàng cuối
 * - Hỗ trợ chế độ compact (nhỏ hơn, 120px ảnh)
 * 
 * Dùng trong:
 * - ProductListScreen khi ở chế độ grid view
 * - HomeScreen cho các section ngang (featured, best sellers, new arrivals)
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../types/Product';

interface ProductGridCardProps {
    product: Product;
    onPress: () => void;
    onAddToCart?: () => void;
    compact?: boolean;
}

const ProductGridCard: React.FC<ProductGridCardProps> = ({ product, onPress, onAddToCart, compact }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={10} color={i <= Math.round(rating) ? '#F59E0B' : '#4B5563'} />
            );
        }
        return stars;
    };

    return (
        <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress} activeOpacity={0.85}>
            {product.image ? (
                <Image source={{ uri: product.image }} style={[styles.image, compact && styles.imageCompact]} />
            ) : (
                <View style={[styles.imagePlaceholder, compact && styles.imageCompact]}>
                    <Ionicons name="image-outline" size={28} color="#4B5563" />
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <View style={styles.ratingRow}>
                    {renderStars(product.rating ?? 0)}
                    <Text style={styles.ratingText}>{(product.rating ?? 0).toFixed(1)}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                    {onAddToCart && (
                        <TouchableOpacity style={styles.addBtn} onPress={onAddToCart}>
                            <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(ProductGridCard);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E30', borderRadius: 16, width: 160, marginRight: 12,
        borderWidth: 1, borderColor: '#2D2D45', overflow: 'hidden',
    },
    cardCompact: { width: 140 },
    image: { width: '100%', height: 140, resizeMode: 'cover' },
    imageCompact: { height: 120 },
    imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    info: { padding: 10 },
    name: { fontSize: 13, fontWeight: '700', color: '#F9FAFB', lineHeight: 18 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    ratingText: { fontSize: 10, color: '#9CA3AF', marginLeft: 4 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    price: { fontSize: 16, fontWeight: '800', color: '#A78BFA' },
    addBtn: {
        width: 28, height: 28, borderRadius: 8, backgroundColor: '#7C3AED',
        justifyContent: 'center', alignItems: 'center',
    },
});
