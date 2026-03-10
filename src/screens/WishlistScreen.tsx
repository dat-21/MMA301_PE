/**
 * MÀN HÌNH DANH SÁCH YÊU THÍCH (WishlistScreen)
 * 
 * Giao diện:
 * - Tổng số sản phẩm yêu thích ở header
 * - Danh sách sản phẩm dạng FlatList với:
 *   + Hình ảnh sản phẩm, tên, mô tả, giá
 *   + Nút Remove (bỏ khỏi wishlist)
 *   + Nút Add to Cart (thêm vào giỏ hàng)
 * - Trạng thái trống với icon trái tim nếu chưa có sản phẩm
 * 
 * Xử lý:
 * - Gọi productService.getWishlist(userId) để lấy danh sách
 * - Bỏ yêu thích: productService.toggleWishlist() -> tải lại danh sách
 * - Thêm giỏ: cartService.addToCart()
 * - Tải lại khi màn hình focus
 */

import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';
import type { Product } from '../types/Product';

type Props = NativeStackScreenProps<RootStackParamList, 'Wishlist'>;

export default function WishlistScreen({ navigation }: Props) {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const { toast, showToast, hideToast } = useToast();

    const loadWishlist = () => {
        if (user) setWishlist(productService.getWishlist(user.id));
    };

    useFocusEffect(useCallback(() => { loadWishlist(); }, []));

    const removeFromWishlist = (product: Product) => {
        if (!user) return;
        productService.toggleWishlist(user.id, product.id);
        loadWishlist();
        showToast(`${product.name} removed from wishlist`, 'info');
    };

    const addToCart = (product: Product) => {
        if (!user) return;
        cartService.addToCart(user.id, product.id);
        showToast(`${product.name} added to cart 🛒`, 'success');
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={12} color="#F59E0B" />
            );
        }
        return <View style={styles.starsRow}>{stars}</View>;
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            {item.image ? (
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                </TouchableOpacity>
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#4B5563" />
                </View>
            )}
            <View style={styles.info}>
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
                {renderStars(item.rating ?? 0)}
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(item)}>
                        <Ionicons name="cart-outline" size={16} color="#fff" />
                        <Text style={styles.cartBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromWishlist(item)}>
                        <Ionicons name="heart-dislike-outline" size={16} color="#F87171" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />

            <FlatList data={wishlist} keyExtractor={item => item.id.toString()} renderItem={renderItem}
                contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={80} color="#374151" />
                        <Text style={styles.emptyText}>Your wishlist is empty</Text>
                        <Text style={styles.emptySubText}>Add products you love to see them here</Text>
                        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('ProductList')}>
                            <Ionicons name="cube-outline" size={18} color="#fff" />
                            <Text style={styles.browseBtnText}>Browse Products</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    listContent: { padding: 16, paddingBottom: 40 },
    card: {
        flexDirection: 'row', backgroundColor: '#1E1E30', borderRadius: 16,
        marginBottom: 12, borderWidth: 1, borderColor: '#2D2D45', overflow: 'hidden',
    },
    image: { width: 110, height: 140, resizeMode: 'cover' },
    imagePlaceholder: {
        width: 110, height: 140, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center',
    },
    info: { flex: 1, padding: 12, justifyContent: 'space-between' },
    name: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
    price: { fontSize: 18, fontWeight: '800', color: '#A78BFA', marginTop: 4 },
    actions: { flexDirection: 'row', marginTop: 8, gap: 8 },
    cartBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
        backgroundColor: '#F59E0B', paddingVertical: 8, borderRadius: 8,
    },
    cartBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    removeBtn: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#2D1515',
        borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { fontSize: 20, fontWeight: '700', color: '#6B7280', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    browseBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
    },
    browseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
