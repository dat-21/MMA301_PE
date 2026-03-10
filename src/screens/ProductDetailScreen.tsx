/**
 * MÀN HÌNH CHI TIỀT SẢN PHẨM (ProductDetailScreen)
 * 
 * Giao diện:
 * - Hình ảnh sản phẩm lớn (full width, 320px cao)
 * - Nút thêm vào wishlist (trái tim đỏ/trắng)
 * - Tên sản phẩm, sao đánh giá, giá
 * - Badge tồn kho: "In Stock" (xanh) hoặc "Out of Stock" (đỏ)
 * - Mô tả sản phẩm
 * - Nút Add to Cart (cho user) hoặc Edit/Delete (cho admin)
 * - Sản phẩm liên quan: FlatList ngang ProductGridCard cùng danh mục
 * 
 * Xử lý:
 * - Lấy sản phẩm theo productId từ params
 * - Lưu vào lịch sử xem gần đây (addToRecentlyViewed)
 * - Toggle wishlist khi bấm trái tim
 * - Tải sản phẩm liên quan cùng danh mục
 */

import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, FlatList, Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import ProductGridCard from '../components/ProductGridCard';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';
import type { Product } from '../types/Product';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;
const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: Props) {
    const { productId } = route.params;
    const { user, isAdmin } = useContext(AuthContext);
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const result = productService.getById(productId);
            setProduct(result);
            if (result && user) {
                productService.addToRecentlyViewed(user.id, productId);
                setRelatedProducts(productService.getRelated(productId, result.categoryId ?? null, 6));
                setIsWishlisted(productService.isInWishlist(user.id, productId));
            }
        }, [productId])
    );

    const addToCart = () => {
        if (!product || !user) return;
        cartService.addToCart(user.id, product.id);
        showToast(`${product.name} added to cart 🛒`, 'success');
    };

    const toggleWishlist = () => {
        if (!product || !user) return;
        const added = productService.toggleWishlist(user.id, product.id);
        setIsWishlisted(added);
        showToast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist', added ? 'success' : 'info');
    };

    const confirmDelete = () => {
        if (!product) return;
        productService.delete(product.id);
        setShowDeleteConfirm(false);
        navigation.goBack();
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'}
                    size={16} color="#F59E0B" />
            );
        }
        return <View style={styles.starsRow}>{stars}</View>;
    };

    if (!product) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
                <Text style={styles.notFound}>Product not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.outerContainer}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
            <ConfirmDialog visible={showDeleteConfirm} title="Delete Product"
                message={`Are you sure you want to delete "${product?.name}"? This cannot be undone.`}
                type="danger" confirmText="Delete" onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)} />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Image */}
                {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="cube-outline" size={64} color="#374151" />
                        <Text style={styles.placeholderText}>No Image Available</Text>
                    </View>
                )}

                {/* Wishlist Button */}
                {!isAdmin && (
                    <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist} activeOpacity={0.8}>
                        <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={24}
                            color={isWishlisted ? '#EF4444' : '#fff'} />
                    </TouchableOpacity>
                )}

                <View style={styles.content}>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                        <View style={[styles.stockBadge, (product.stock ?? 0) <= 0 && styles.outOfStockBadge]}>
                            <Ionicons name={(product.stock ?? 0) > 0 ? 'checkmark-circle' : 'close-circle'}
                                size={14} color={(product.stock ?? 0) > 0 ? '#10B981' : '#EF4444'} />
                            <Text style={[styles.stockText, (product.stock ?? 0) <= 0 && styles.outOfStockText]}>
                                {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        {renderStars(product.rating ?? 0)}
                        <Text style={styles.ratingText}>{(product.rating ?? 0).toFixed(1)}</Text>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text-outline" size={18} color="#A78BFA" />
                            <Text style={styles.sectionTitle}>Description</Text>
                        </View>
                        <Text style={styles.description}>
                            {product.description || 'No description available for this product.'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Actions */}
                    {!isAdmin && (
                        <TouchableOpacity style={styles.cartBtn} onPress={addToCart} activeOpacity={0.85}>
                            <Ionicons name="cart-outline" size={22} color="#fff" />
                            <Text style={styles.cartBtnText}>Add to Cart</Text>
                        </TouchableOpacity>
                    )}

                    {isAdmin && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.editBtn}
                                onPress={() => navigation.navigate('AddEditProduct', { product })} activeOpacity={0.85}>
                                <Ionicons name="create-outline" size={18} color="#fff" />
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn}
                                onPress={() => setShowDeleteConfirm(true)} activeOpacity={0.85}>
                                <Ionicons name="trash-outline" size={18} color="#fff" />
                                <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <View style={styles.relatedSection}>
                            <Text style={styles.relatedTitle}>Related Products</Text>
                            <FlatList data={relatedProducts} horizontal showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => (
                                    <ProductGridCard product={item}
                                        onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                                        onAddToCart={() => { if (user) { cartService.addToCart(user.id, item.id); showToast('Added to cart 🛒', 'success'); } }} />
                                )} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
    notFound: { fontSize: 16, color: '#6B7280', marginTop: 12 },
    image: { width: '100%', height: 320, resizeMode: 'cover' },
    imagePlaceholder: {
        width: '100%', height: 260, backgroundColor: '#111827',
        justifyContent: 'center', alignItems: 'center', gap: 12,
    },
    placeholderText: { color: '#4B5563', fontSize: 15 },
    wishlistBtn: {
        position: 'absolute', top: 52, right: 16, width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    },
    content: { padding: 20 },
    name: { fontSize: 24, fontWeight: '800', color: '#F9FAFB', lineHeight: 32, marginBottom: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    price: { fontSize: 30, fontWeight: '800', color: '#A78BFA' },
    stockBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#052e16', borderWidth: 1, borderColor: '#10B981',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    outOfStockBadge: { backgroundColor: '#2D1515', borderColor: '#EF4444' },
    stockText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
    outOfStockText: { color: '#EF4444' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    starsRow: { flexDirection: 'row', gap: 2 },
    ratingText: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#D1D5DB' },
    description: { fontSize: 15, color: '#9CA3AF', lineHeight: 24 },
    divider: { height: 1, backgroundColor: '#1E1E30', marginVertical: 4 },
    cartBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 14, marginTop: 16, marginBottom: 12,
        shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    cartBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    editBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 14,
    },
    editBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    deleteBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 14,
    },
    deleteBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    relatedSection: { marginTop: 28 },
    relatedTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 12 },
});
