/**
 * MÀN HÌNH DOANH THU (RevenueScreen) - Chỉ dành cho Admin
 * 
 * Giao diện:
 * - Tổng doanh thu hiển thị lớn ở trên
 * - Bộ lọc thời gian: 4 tab (All / Today / Month / Year)
 * - Danh sách đơn hàng có thể mở rộng (OrderCard)
 * - Bấm vào đơn hàng để xem chi tiết sản phẩm đã mua
 * 
 * Xử lý:
 * - Gọi orderService.getRevenueByFilter(filter) khi đổi tab
 * - Gọi orderService.getOrderItems(orderId) khi expand đơn hàng
 * - Tải lại khi màn hình được focus
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import type { Order } from '../types/Order';
import type { OrderItem } from '../types/Order';

const FILTERS = [
    { key: 'all' as const, label: 'All Time', icon: 'time-outline' },
    { key: 'day' as const, label: 'Today', icon: 'today-outline' },
    { key: 'month' as const, label: 'Month', icon: 'calendar-outline' },
    { key: 'year' as const, label: 'Year', icon: 'calendar-clear-outline' },
];

export default function RevenueScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [filter, setFilter] = useState<'all' | 'day' | 'month' | 'year'>('all');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const loadOrders = () => {
        const result = orderService.getRevenueByFilter(filter);
        setOrders(result);
        setTotalRevenue(result.reduce((sum, o) => sum + o.total, 0));
    };

    useFocusEffect(useCallback(() => { loadOrders(); }, [filter]));

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const renderOrder = ({ item }: { item: Order }) => {
        const isExpanded = expandedOrder === item.id;
        const orderItems: OrderItem[] = isExpanded ? orderService.getOrderItems(item.id) : [];

        return (
            <TouchableOpacity style={styles.orderCard}
                onPress={() => setExpandedOrder(isExpanded ? null : item.id)} activeOpacity={0.8}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderLeft}>
                        <View style={styles.orderNumBadge}>
                            <Text style={styles.orderNumText}>#{item.id}</Text>
                        </View>
                        <View>
                            <Text style={styles.orderId}>Order #{item.id}</Text>
                            <View style={styles.dateRow}>
                                <Ionicons name="time-outline" size={12} color="#6B7280" />
                                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.orderRight}>
                        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.orderDetails}>
                        <View style={styles.divider} />
                        {orderItems.map(oi => (
                            <View key={oi.id} style={styles.orderItem}>
                                <Ionicons name="cube-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                                <Text style={styles.orderItemName} numberOfLines={1}>
                                    {oi.productName || `Product #${oi.productId}`}
                                </Text>
                                <Text style={styles.orderItemQty}>x{oi.quantity}</Text>
                                <Text style={styles.orderItemPrice}>${(oi.price * oi.quantity).toFixed(2)}</Text>
                            </View>
                        ))}
                        <View style={styles.orderSubTotal}>
                            <Text style={styles.orderSubTotalLabel}>Subtotal</Text>
                            <Text style={styles.orderSubTotalValue}>${item.total.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

            <View style={styles.summaryCard}>
                <View style={styles.summaryIconWrapper}>
                    <MaterialCommunityIcons name="chart-line" size={32} color="#EC4899" />
                </View>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
                <Text style={styles.summaryValue}>${totalRevenue.toFixed(2)}</Text>
                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="cart-outline" size={16} color="#A78BFA" />
                        <Text style={styles.statText}>{orders.length} orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="trending-up-outline" size={16} color="#34D399" />
                        <Text style={styles.statText}>
                            Avg ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity key={f.key}
                        style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                        onPress={() => setFilter(f.key)}>
                        <Ionicons name={f.icon as any} size={14} color={filter === f.key ? '#fff' : '#9CA3AF'} />
                        <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList data={orders} keyExtractor={item => item.id.toString()} renderItem={renderOrder}
                contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="chart-bar" size={64} color="#374151" />
                        <Text style={styles.emptyText}>No orders found</Text>
                        <Text style={styles.emptySubText}>Complete a checkout to see revenue here</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    summaryCard: {
        margin: 16, padding: 24, backgroundColor: '#1A0A1E', borderRadius: 22, alignItems: 'center',
        borderWidth: 1, borderColor: '#3B1F4E',
        shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    },
    summaryIconWrapper: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(236,72,153,0.15)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)',
    },
    summaryLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    summaryValue: { color: '#F9FAFB', fontSize: 38, fontWeight: '800', marginBottom: 16 },
    summaryStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { color: '#9CA3AF', fontSize: 13 },
    statDivider: { width: 1, height: 16, backgroundColor: '#2D2D45' },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
    filterBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
        paddingVertical: 8, borderRadius: 10, backgroundColor: '#1E1E30', borderWidth: 1, borderColor: '#2D2D45',
    },
    filterBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    filterBtnText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
    filterBtnTextActive: { color: '#FFF', fontWeight: '700' },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    orderCard: {
        backgroundColor: '#1E1E30', borderRadius: 16, marginBottom: 10, padding: 16,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    orderNumBadge: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#2D2D45',
        justifyContent: 'center', alignItems: 'center',
    },
    orderNumText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
    orderId: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    orderDate: { fontSize: 12, color: '#6B7280' },
    orderRight: { alignItems: 'flex-end', gap: 4 },
    orderTotal: { fontSize: 18, fontWeight: '800', color: '#10B981' },
    orderDetails: { marginTop: 12 },
    divider: { height: 1, backgroundColor: '#2D2D45', marginBottom: 10 },
    orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    orderItemName: { flex: 1, fontSize: 14, color: '#D1D5DB' },
    orderItemQty: { fontSize: 13, color: '#6B7280', marginHorizontal: 10, minWidth: 28, textAlign: 'center' },
    orderItemPrice: { fontSize: 14, fontWeight: '600', color: '#A78BFA' },
    orderSubTotal: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2D2D45',
    },
    orderSubTotalLabel: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
    orderSubTotalValue: { fontSize: 17, fontWeight: '800', color: '#10B981' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, color: '#6B7280', marginTop: 16, marginBottom: 6 },
    emptySubText: { fontSize: 13, color: '#4B5563', textAlign: 'center' },
});
