/**
 * MÀN HÌNH GIỎ HÀNG (CartScreen)
 * 
 * Giao diện:
 * - Danh sách CartItemCard: hiển thị từng sản phẩm với stepper số lượng
 * - Nút xóa từng mặt hàng và nút xóa toàn bộ giỏ hàng (Clear Cart)
 * - Thông tin tổng: số mặt hàng, tổng tiền
 * - Nút Checkout -> chuyển sang CheckoutScreen
 * - Hiện thị trạng thái trống nếu giỏ hàng không có sản phẩm
 * 
 * Xử lý:
 * - Lấy giỏ hàng từ cartService.getCartItems(userId)
 * - Tăng/giảm số lượng: cartService.updateQuantity()
 * - Xóa mặt hàng: cartService.removeItem()
 * - Xóa toàn bộ: hiện ConfirmDialog rồi gọi cartService.clearCart()
 * - Tải lại giỏ hàng mỗi khi màn hình được focus
 */

import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { cartService } from '../services/cartService';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';
import type { CartItem } from '../types/CartItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { toast, showToast, hideToast } = useToast();
    const [confirmType, setConfirmType] = useState<'checkout' | 'clear' | null>(null);

    const loadCart = () => {
        if (!user) return;
        setCartItems(cartService.getCartItems(user.id));
    };

    useFocusEffect(useCallback(() => { loadCart(); }, []));

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const updateQuantity = (id: number, newQty: number) => {
        cartService.updateQuantity(id, newQty);
        loadCart();
    };

    const removeItem = (id: number) => {
        cartService.removeItem(id);
        loadCart();
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) { showToast('Add some products before checkout', 'warning'); return; }
        navigation.navigate('Checkout');
    };

    const clearCart = () => { setConfirmType('clear'); };
    const performClearCart = () => {
        if (!user) return;
        cartService.clearCart(user.id);
        setConfirmType(null);
        loadCart();
        showToast('Cart cleared', 'info');
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
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
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Ionicons name="remove" size={18} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Ionicons name="add" size={18} color="#F9FAFB" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>${((item.price ?? 0) * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#F87171" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
            <ConfirmDialog visible={confirmType === 'clear'} title="Clear Cart"
                message="Remove all items from your cart?" type="danger" confirmText="Clear All"
                onConfirm={performClearCart} onCancel={() => setConfirmType(null)} />

            {cartItems.length > 0 && (
                <View style={styles.topBar}>
                    <Text style={styles.itemCountText}>{totalItems} items</Text>
                    <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
                        <Ionicons name="trash" size={14} color="#F87171" />
                        <Text style={styles.clearBtnText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList data={cartItems} keyExtractor={item => item.id.toString()} renderItem={renderCartItem}
                contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={80} color="#374151" />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <Text style={styles.emptySubText}>Add some products to get started</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ProductList')}>
                            <Ionicons name="cube-outline" size={18} color="#fff" />
                            <Text style={styles.shopBtnText}>Browse Products</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <View>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.itemCount}>{totalItems} items</Text>
                        </View>
                        <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="cart-check" size={22} color="#fff" />
                        <Text style={styles.checkoutBtnText}>Checkout</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    itemCountText: { fontSize: 13, color: '#9CA3AF' },
    clearBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1E1E30',
        borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    },
    clearBtnText: { color: '#F87171', fontSize: 12, fontWeight: '600' },
    listContent: { padding: 16, paddingBottom: 220 },
    cartItem: {
        flexDirection: 'row', backgroundColor: '#1E1E30', borderRadius: 16,
        marginBottom: 12, padding: 14, borderWidth: 1, borderColor: '#2D2D45', alignItems: 'center',
    },
    itemImage: { width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' },
    imagePlaceholder: {
        width: 72, height: 72, borderRadius: 12, backgroundColor: '#111827',
        justifyContent: 'center', alignItems: 'center',
    },
    itemInfo: { flex: 1, marginLeft: 14 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    itemPrice: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
    qtyBtn: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#2D2D45',
        justifyContent: 'center', alignItems: 'center',
    },
    qtyBtnPlus: { backgroundColor: '#7C3AED' },
    qtyText: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', minWidth: 24, textAlign: 'center' },
    itemRight: { alignItems: 'flex-end', marginLeft: 8, gap: 8 },
    itemTotal: { fontSize: 16, fontWeight: '800', color: '#A78BFA' },
    removeBtn: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#2D1515',
        borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { fontSize: 20, fontWeight: '700', color: '#6B7280', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    shopBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
    },
    shopBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#13131F', padding: 20, borderTopWidth: 1, borderTopColor: '#2D2D45',
    },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    totalLabel: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
    itemCount: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    totalValue: { fontSize: 28, fontWeight: '800', color: '#A78BFA' },
    checkoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 16,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
    },
    checkoutBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
