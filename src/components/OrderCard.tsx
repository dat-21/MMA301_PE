/**
 * COMPONENT OrderCard - Thẻ hiển thị đơn hàng (có thể mở rộng)
 * 
 * Hiển thị thông tin đơn hàng với:
 * - Header: mã đơn hàng (#ID), ngày đặt, tên người đặt, tổng tiền
 * - Badge trạng thái màu: pending (vàng), processing (xanh dương), shipped (tím), delivered (xanh lá)
 * - Mũi tên expand/collapse
 * - Khi mở rộng: hiển thị danh sách sản phẩm trong đơn (tên, số lượng, giá)
 * 
 * Dùng trong: MyOrdersScreen, OrdersManagementScreen, RevenueScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Order, OrderItem } from '../types/Order';

interface OrderCardProps {
    order: Order;
    expanded: boolean;
    onToggle: () => void;
    orderItems: OrderItem[];
    formatDate: (d: string) => string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#78350F', text: '#FBBF24' },
    processing: { bg: '#1E3A5F', text: '#60A5FA' },
    shipped: { bg: '#3B1F4E', text: '#A78BFA' },
    delivered: { bg: '#064E3B', text: '#10B981' },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, expanded, onToggle, orderItems, formatDate }) => {
    const statusConfig = STATUS_COLORS[order.status ?? 'pending'] ?? STATUS_COLORS.pending;

    return (
        <TouchableOpacity style={styles.card} onPress={onToggle} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.left}>
                    <View style={styles.numBadge}>
                        <Text style={styles.numText}>#{order.id}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.orderId}>Order #{order.id}</Text>
                        <View style={styles.dateRow}>
                            <Ionicons name="time-outline" size={12} color="#6B7280" />
                            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                        </View>
                        {order.userName ? (
                            <View style={styles.dateRow}>
                                <Ionicons name="person-outline" size={12} color="#6B7280" />
                                <Text style={styles.date}>{order.userName}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <View style={styles.right}>
                    <Text style={styles.total}>${order.total.toFixed(2)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {(order.status ?? 'pending').charAt(0).toUpperCase() + (order.status ?? 'pending').slice(1)}
                        </Text>
                    </View>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
                </View>
            </View>

            {expanded && orderItems && (
                <View style={styles.details}>
                    <View style={styles.divider} />
                    {orderItems.map((oi) => (
                        <View key={oi.id} style={styles.item}>
                            <Ionicons name="cube-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.itemName} numberOfLines={1}>{oi.productName || `Product #${oi.productId}`}</Text>
                            <Text style={styles.itemQty}>x{oi.quantity}</Text>
                            <Text style={styles.itemPrice}>${(oi.price * oi.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.subTotal}>
                        <Text style={styles.subTotalLabel}>Subtotal</Text>
                        <Text style={styles.subTotalValue}>${order.total.toFixed(2)}</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default React.memo(OrderCard);

const styles = StyleSheet.create({
    card: { backgroundColor: '#1E1E30', borderRadius: 16, marginBottom: 10, padding: 16, borderWidth: 1, borderColor: '#2D2D45' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    numBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2D2D45', justifyContent: 'center', alignItems: 'center' },
    numText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
    orderId: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    date: { fontSize: 12, color: '#6B7280' },
    right: { alignItems: 'flex-end', gap: 4 },
    total: { fontSize: 18, fontWeight: '800', color: '#10B981' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700' },
    details: { marginTop: 12 },
    divider: { height: 1, backgroundColor: '#2D2D45', marginBottom: 10 },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    itemName: { flex: 1, fontSize: 14, color: '#D1D5DB' },
    itemQty: { fontSize: 13, color: '#6B7280', marginHorizontal: 10, minWidth: 28, textAlign: 'center' },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#A78BFA' },
    subTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2D2D45' },
    subTotalLabel: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
    subTotalValue: { fontSize: 17, fontWeight: '800', color: '#10B981' },
});
