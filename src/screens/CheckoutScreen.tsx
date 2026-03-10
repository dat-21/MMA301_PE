/**
 * MÀN HÌNH THANH TOÁN (CheckoutScreen)
 * 
 * Giao diện:
 * - Tóm tắt đơn hàng: danh sách sản phẩm với ảnh, tên, số lượng, giá
 * - Nhập địa chỉ giao hàng (TextInput)
 * - Chọn phương thức thanh toán: 3 radio button (Card, Cash, PayPal)
 * - Chi tiết giá:
 *   + Subtotal (tổng phụ)
 *   + Phí ship: miễn phí nếu > $50, còn lại $5.99
 *   + Grand Total (tổng cộng)
 * - Nút Place Order -> tạo đơn hàng
 * 
 * Xử lý:
 * - Lấy giỏ hàng từ cartService.getCartItems()
 * - Bấm Place Order: validate địa chỉ, gọi orderService.checkout() với toàn bộ thông tin
 * - Thành công: hiển toast + quay về Home
 */

import React, { useState, useContext, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, TextInput, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';
import type { CartItem } from '../types/CartItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const PAYMENT_METHODS = [
    { key: 'card', label: 'Credit Card', icon: 'card-outline' },
    { key: 'cash', label: 'Cash on Delivery', icon: 'cash-outline' },
    { key: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
];

export default function CheckoutScreen({ navigation }: Props) {
    const { user } = useContext(AuthContext);
    const { toast, showToast, hideToast } = useToast();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [addressFocused, setAddressFocused] = useState(false);

    useFocusEffect(useCallback(() => {
        if (user) setCartItems(cartService.getCartItems(user.id));
    }, []));

    const total = cartItems.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const shipping = total > 50 ? 0 : 5.99;
    const grandTotal = total + shipping;

    const handlePlaceOrder = () => {
        if (!user) return;
        if (cartItems.length === 0) { showToast('Cart is empty', 'warning'); return; }
        if (!address.trim()) { showToast('Please enter a shipping address', 'warning'); return; }

        try {
            const orderId = orderService.checkout({
                userId: user.id, cartItems, total: grandTotal,
                shippingAddress: address.trim(), paymentMethod,
            });
            showToast(`Order #${orderId} placed! 🎉`, 'success');
            setTimeout(() => navigation.navigate('Home'), 1500);
        } catch (error: any) {
            showToast('Failed to place order: ' + error.message, 'error');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order Items */}
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.card}>
                    {cartItems.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                            ) : (
                                <View style={styles.itemImagePlaceholder}>
                                    <Ionicons name="cube-outline" size={18} color="#4B5563" />
                                </View>
                            )}
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                            </View>
                            <Text style={styles.itemTotal}>${((item.price ?? 0) * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Shipping Address */}
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={[styles.inputWrapper, addressFocused && styles.inputWrapperFocused]}>
                    <Ionicons name="location-outline" size={20} color={addressFocused ? '#7C3AED' : '#9CA3AF'}
                        style={{ marginRight: 10, alignSelf: 'flex-start', marginTop: 4 }} />
                    <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Enter your shipping address"
                        placeholderTextColor="#6B7280" value={address} onChangeText={setAddress}
                        multiline textAlignVertical="top"
                        onFocus={() => setAddressFocused(true)} onBlur={() => setAddressFocused(false)} />
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                {PAYMENT_METHODS.map(pm => (
                    <TouchableOpacity key={pm.key} style={[styles.paymentOption, paymentMethod === pm.key && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod(pm.key)}>
                        <Ionicons name={pm.icon as any} size={22}
                            color={paymentMethod === pm.key ? '#7C3AED' : '#9CA3AF'} />
                        <Text style={[styles.paymentLabel, paymentMethod === pm.key && styles.paymentLabelActive]}>
                            {pm.label}
                        </Text>
                        <View style={[styles.radio, paymentMethod === pm.key && styles.radioActive]}>
                            {paymentMethod === pm.key && <View style={styles.radioDot} />}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Price Breakdown */}
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal ({totalItems} items)</Text>
                        <Text style={styles.priceValue}>${total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Shipping</Text>
                        <Text style={[styles.priceValue, shipping === 0 && { color: '#10B981' }]}>
                            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="cart-check" size={22} color="#fff" />
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F9FAFB', marginTop: 20, marginBottom: 12 },
    card: {
        backgroundColor: '#1E1E30', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2D2D45',
    },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: '#2D2D45',
    },
    itemImage: { width: 44, height: 44, borderRadius: 10, resizeMode: 'cover' },
    itemImagePlaceholder: {
        width: 44, height: 44, borderRadius: 10, backgroundColor: '#111827',
        justifyContent: 'center', alignItems: 'center',
    },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
    itemQty: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    itemTotal: { fontSize: 14, fontWeight: '700', color: '#A78BFA' },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E30', borderRadius: 14,
        borderWidth: 1.5, borderColor: '#2D2D45', paddingHorizontal: 14, paddingVertical: 12,
    },
    inputWrapperFocused: { borderColor: '#7C3AED' },
    input: { flex: 1, fontSize: 15, color: '#F9FAFB' },
    paymentOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E1E30',
        borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#2D2D45',
    },
    paymentOptionActive: { borderColor: '#7C3AED', backgroundColor: '#1A1A2E' },
    paymentLabel: { flex: 1, fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
    paymentLabelActive: { color: '#F9FAFB', fontWeight: '600' },
    radio: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#4B5563',
        justifyContent: 'center', alignItems: 'center',
    },
    radioActive: { borderColor: '#7C3AED' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7C3AED' },
    priceCard: {
        backgroundColor: '#1E1E30', borderRadius: 16, padding: 18, marginTop: 20,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    priceLabel: { fontSize: 14, color: '#9CA3AF' },
    priceValue: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
    priceDivider: { height: 1, backgroundColor: '#2D2D45', marginVertical: 8 },
    grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
    grandTotalValue: { fontSize: 22, fontWeight: '800', color: '#A78BFA' },
    placeOrderBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#7C3AED', paddingVertical: 18, borderRadius: 16, marginTop: 24,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    },
    placeOrderText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
