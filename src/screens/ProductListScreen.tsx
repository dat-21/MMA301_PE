/**
 * MÀN HÌNH DANH SÁCH SẢN PHẨM (ProductListScreen)
 * 
 * Giao diện:
 * - Thanh tìm kiếm (SearchBar) ở trên
 * - Hàng pill danh mục: FlatList ngang các chip danh mục ("All" + tất cả categories)
 * - Nút sắp xếp giá (toggle: không sắp xếp/tăng dần/giảm dần)
 * - Nút chuyển chế độ grid/list view
 * - Danh sách sản phẩm: FlatList với infinite scroll (phân trang 20 sản phẩm/trang)
 *   + Grid view: 2 cột ProductGridCard
 *   + List view: ProductCard toàn chiều rộng
 * - Admin: nút FAB (+) góc dưới phải để thêm sản phẩm mới, nút xóa sản phẩm
 * 
 * Nhận params từ navigation: categoryId, categoryName (để lọc sẵn theo danh mục)
 * Tải lại dữ liệu mỗi khi bộ lọc/tìm kiếm thay đổi (useFocusEffect)
 */

import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';
import type { Product } from '../types/Product';
import type { Category } from '../types/Category';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

const PAGE_SIZE = 10;
const { width } = Dimensions.get('window');

export default function ProductListScreen({ navigation, route }: Props) {
    const { user, isAdmin } = useContext(AuthContext);
    const { toast, showToast, hideToast } = useToast();

    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(route.params?.categoryId);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isGrid, setIsGrid] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [confirm, setConfirm] = useState<{ visible: boolean; id: number | null; name: string }>({
        visible: false, id: null, name: '',
    });

    const loadProducts = useCallback((reset = true) => {
        const offset = reset ? 0 : page * PAGE_SIZE;
        const result = productService.getAll({
            search, categoryId: selectedCategory, sortOrder, limit: PAGE_SIZE, offset,
        });

        if (reset) {
            setProducts(result);
            setPage(1);
        } else {
            setProducts(prev => [...prev, ...result]);
            setPage(prev => prev + 1);
        }
        setHasMore(result.length === PAGE_SIZE);
    }, [search, sortOrder, selectedCategory, page]);

    useFocusEffect(
        useCallback(() => {
            setCategories(productService.getCategories());
            loadProducts(true);
        }, [search, sortOrder, selectedCategory])
    );

    const handleLoadMore = () => {
        if (hasMore) loadProducts(false);
    };

    const handleDelete = (id: number, name: string) => {
        setConfirm({ visible: true, id, name });
    };

    const confirmDelete = () => {
        if (confirm.id) {
            productService.delete(confirm.id);
            setConfirm({ visible: false, id: null, name: '' });
            loadProducts(true);
            showToast('Product deleted', 'success');
        }
    };

    const addToCart = (product: Product) => {
        if (!user) return;
        cartService.addToCart(user.id, product.id);
        showToast(`${product.name} added to cart 🛒`, 'success');
    };

    const CategoryPill = ({ cat, isAll }: { cat?: Category; isAll?: boolean }) => {
        const active = isAll ? !selectedCategory : selectedCategory === cat?.id;
        return (
            <TouchableOpacity
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(isAll ? undefined : cat?.id)}
            >
                {cat?.icon ? <Text style={{ fontSize: 14 }}>{cat.icon}</Text> : null}
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {isAll ? 'All' : cat?.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const SortBtn = ({ order, label, icon }: { order: 'asc' | 'desc'; label: string; icon: string }) => (
        <TouchableOpacity
            style={[styles.sortBtn, sortOrder === order && styles.sortBtnActive]}
            onPress={() => setSortOrder(sortOrder === order ? null : order)}
        >
            <Ionicons name={icon as any} size={14} color={sortOrder === order ? '#fff' : '#9CA3AF'} />
            <Text style={[styles.sortBtnText, sortOrder === order && styles.sortBtnTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderProduct = ({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            isAdmin={isAdmin}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            onAddToCart={() => addToCart(item)}
            onEdit={() => navigation.navigate('AddEditProduct', { product: item })}
            onDelete={() => handleDelete(item.id, item.name)}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
            <ConfirmDialog visible={confirm.visible} title="Delete Product"
                message={`Are you sure you want to delete "${confirm.name}"? This cannot be undone.`}
                type="danger" confirmText="Delete" onConfirm={confirmDelete}
                onCancel={() => setConfirm({ visible: false, id: null, name: '' })} />

            <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />

            {/* Category Pills */}
            <FlatList
                data={categories}
                keyExtractor={c => c.id.toString()}
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
                ListHeaderComponent={<CategoryPill isAll />}
                renderItem={({ item }) => <CategoryPill cat={item} />}
            />

            {/* Sort & View Toggle */}
            <View style={styles.sortRow}>
                <Ionicons name="funnel-outline" size={16} color="#9CA3AF" />
                <Text style={styles.sortLabel}>Sort:</Text>
                <SortBtn order="asc" label="Low–High" icon="trending-up-outline" />
                <SortBtn order="desc" label="High–Low" icon="trending-down-outline" />
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setIsGrid(!isGrid)} style={styles.viewToggle}>
                    <Ionicons name={isGrid ? 'list-outline' : 'grid-outline'} size={18} color="#A78BFA" />
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <FlatList
                key={isGrid ? 'grid' : 'list'}
                data={products}
                numColumns={isGrid ? 2 : 1}
                keyExtractor={item => item.id.toString()}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={64} color="#374151" />
                        <Text style={styles.emptyText}>No products found</Text>
                        {isAdmin && (
                            <TouchableOpacity style={styles.addFirstBtn} onPress={() => navigation.navigate('AddEditProduct')}>
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.addFirstBtnText}>Add your first product</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />

            {isAdmin && (
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEditProduct')} activeOpacity={0.85}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    catRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
    catPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#1E1E30', borderWidth: 1, borderColor: '#2D2D45', marginRight: 6,
    },
    catPillActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    catPillText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
    catPillTextActive: { color: '#FFF', fontWeight: '700' },
    sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
    sortLabel: { fontSize: 13, color: '#9CA3AF' },
    sortBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        backgroundColor: '#1E1E30', borderWidth: 1, borderColor: '#2D2D45',
    },
    sortBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    sortBtnText: { fontSize: 12, color: '#9CA3AF' },
    sortBtnTextActive: { color: '#FFF', fontWeight: '600' },
    viewToggle: {
        width: 36, height: 36, borderRadius: 12, backgroundColor: '#1E1E30',
        borderWidth: 1, borderColor: '#2D2D45', justifyContent: 'center', alignItems: 'center',
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 16, color: '#6B7280', marginVertical: 16 },
    addFirstBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#7C3AED', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    },
    addFirstBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    fab: {
        position: 'absolute', bottom: 24, right: 20, width: 58, height: 58, borderRadius: 29,
        backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
    },
});
