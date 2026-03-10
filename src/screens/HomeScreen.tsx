/**
 * MÀN HÌNH TRANG CHỦ (HomeScreen)
 * 
 * Giao diện chính khi user đăng nhập:
 * 
 * [Cho người dùng thường (role = 'user')]:
 * - Header: logo, tên người dùng, icon giỏ hàng (có badge số lượng), icon wishlist, icon profile
 * - BannerCarousel: banner quảng cáo cuộn ngang tự động
 * - Danh mục: FlatList ngang các CategoryCard (bấm để vào ProductList theo danh mục)
 * - Sản phẩm nổi bật: FlatList ngang ProductGridCard (sắp xếp theo rating cao nhất)
 * - Sản phẩm bán chạy: FlatList ngang ProductGridCard (sắp xếp theo số lượng đã bán)
 * - Sản phẩm mới: FlatList ngang ProductGridCard (sắp xếp theo ngày tạo)
 * - Đã xem gần đây: FlatList ngang ProductGridCard (lịch sử xem)
 * 
 * [Cho admin (role = 'admin')]:
 * - Lưới 8 nút điều hướng nhanh tới các màn hình quản trị:
 *   Dashboard, Products, Revenue, Orders, Users, Analytics, Profile
 * 
 * Tải lại dữ liệu mỗi khi màn hình được focus (useFocusEffect)
 */

import React, { useContext, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import type { Product } from '../types/Product';
import type { Category } from '../types/Category';
import type { RootStackParamList } from '../types/Navigation';
import BannerCarousel from '../components/BannerCarousel';
import CategoryCard from '../components/CategoryCard';
import ProductGridCard from '../components/ProductGridCard';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const { user, isAdmin } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featured, setFeatured] = useState<Product[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const { toast, showToast, hideToast } = useToast();

    useFocusEffect(
        useCallback(() => {
            if (user?.id && !isAdmin) {
                setCartCount(cartService.getCartCount(user.id));
                setWishlistCount(productService.getWishlistCount(user.id));
                setRecentlyViewed(productService.getRecentlyViewed(user.id, 10));
            }
            setCategories(productService.getCategories());
            setFeatured(productService.getFeatured(8));
            setBestSellers(productService.getBestSellers(8));
            setNewArrivals(productService.getNewArrivals(8));
        }, [user?.id, isAdmin])
    );

    const addToCart = (product: Product) => {
        if (!user) return;
        cartService.addToCart(user.id, product.id);
        setCartCount(cartService.getCartCount(user.id));
        showToast(`${product.name} added to cart 🛒`, 'success');
    };

    if (isAdmin) {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Hello,</Text>
                            <Text style={styles.userName}>{user?.fullName || 'Admin'} 👋</Text>
                        </View>
                    </View>
                    <Text style={styles.sectionTitle}>Admin Panel</Text>
                    <View style={styles.adminGrid}>
                        {[
                            { icon: 'cube-outline' as const, title: 'Products', color: '#7C3AED', screen: 'ProductList' as const },
                            { icon: 'add-circle-outline' as const, title: 'Add Product', color: '#10B981', screen: 'AddEditProduct' as const },
                            { icon: 'receipt-outline' as const, title: 'Orders', color: '#3B82F6', screen: 'OrdersManagement' as const },
                            { icon: 'cash-outline' as const, title: 'Revenue', color: '#EC4899', screen: 'Revenue' as const },
                            { icon: 'people-outline' as const, title: 'Users', color: '#F59E0B', screen: 'UsersManagement' as const },
                            { icon: 'analytics-outline' as const, title: 'Analytics', color: '#6366F1', screen: 'Analytics' as const },
                            { icon: 'grid-outline' as const, title: 'Dashboard', color: '#14B8A6', screen: 'AdminDashboard' as const },
                            { icon: 'person-outline' as const, title: 'Profile', color: '#F472B6', screen: 'Profile' as const },
                        ].map((item, i) => (
                            <TouchableOpacity key={i} style={[styles.adminCard, { backgroundColor: item.color }]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.82}>
                                <View style={styles.adminCardIcon}>
                                    <Ionicons name={item.icon} size={32} color="#fff" />
                                </View>
                                <Text style={styles.adminCardTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const renderProductSection = (title: string, data: Product[], showAll?: string) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {showAll && (
                    <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                horizontal
                data={data}
                keyExtractor={(item) => `${title}-${item.id}`}
                renderItem={({ item }) => (
                    <ProductGridCard
                        product={item}
                        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                        onAddToCart={() => addToCart(item)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>{user?.fullName || 'User'} 👋</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Wishlist')}>
                            <Ionicons name="heart-outline" size={22} color="#F9FAFB" />
                            {wishlistCount > 0 && (
                                <View style={styles.badge}><Text style={styles.badgeText}>{wishlistCount}</Text></View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
                            <Ionicons name="cart-outline" size={22} color="#F9FAFB" />
                            {cartCount > 0 && (
                                <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('ProductList')} activeOpacity={0.8}>
                    <Ionicons name="search-outline" size={20} color="#6B7280" />
                    <Text style={styles.searchText}>Search products...</Text>
                </TouchableOpacity>

                {/* Banner Carousel */}
                <BannerCarousel />

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Categories</Text>
                    <FlatList
                        horizontal
                        data={categories}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <CategoryCard
                                category={item}
                                onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
                            />
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    />
                </View>

                {/* Featured Products */}
                {featured.length > 0 && renderProductSection('Featured Products', featured, 'all')}

                {/* Best Sellers */}
                {bestSellers.length > 0 && renderProductSection('Best Sellers', bestSellers, 'all')}

                {/* New Arrivals */}
                {newArrivals.length > 0 && renderProductSection('New Arrivals', newArrivals, 'all')}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && renderProductSection('Recently Viewed', recentlyViewed)}

                {/* Quick Access */}
                <View style={styles.quickAccess}>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('MyOrders')}>
                        <View style={[styles.quickIcon, { backgroundColor: '#3B82F6' }]}>
                            <Ionicons name="receipt-outline" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickText}>My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Profile')}>
                        <View style={[styles.quickIcon, { backgroundColor: '#10B981' }]}>
                            <Ionicons name="person-outline" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Wishlist')}>
                        <View style={[styles.quickIcon, { backgroundColor: '#EC4899' }]}>
                            <Ionicons name="heart-outline" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickText}>Wishlist</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    },
    greeting: { fontSize: 14, color: '#9CA3AF' },
    userName: { fontSize: 22, fontWeight: '800', color: '#F9FAFB' },
    headerIcons: { flexDirection: 'row', gap: 8 },
    headerBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#1E1E30',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2D2D45',
    },
    badge: {
        position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444',
        borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E30',
        marginHorizontal: 20, marginBottom: 16, borderRadius: 14, paddingHorizontal: 14, height: 48,
        borderWidth: 1, borderColor: '#2D2D45', gap: 10,
    },
    searchText: { fontSize: 15, color: '#6B7280' },
    section: { marginBottom: 20 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
    seeAll: { fontSize: 13, color: '#A78BFA', fontWeight: '600' },
    quickAccess: {
        flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20,
        marginTop: 8,
    },
    quickBtn: { alignItems: 'center', gap: 6 },
    quickIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    quickText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    // Admin grid
    adminGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        paddingHorizontal: 20, gap: 14, paddingBottom: 30,
    },
    adminCard: {
        width: '47%', borderRadius: 20, padding: 18, minHeight: 130,
        justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    },
    adminCardIcon: {
        width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    adminCardTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
