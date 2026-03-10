/**
 * MÀN HÌNH QUẢN LÝ ĐƠN HÀNG (OrdersManagementScreen) - Chỉ dành cho Admin
 * 
 * Giao diện:
 * - Tổng số đơn hàng và tổng doanh thu ở header
 * - Danh sách tất cả đơn hàng (OrderCard) với:
 *   + Thông tin người đặt (tên, email)
 *   + Trạng thái đơn hàng (badge màu)
 *   + Bấm mở rộng để xem chi tiết sản phẩm
 * 
 * Xử lý:
 * - Gọi orderService.getAllOrders() (JOIN với users để lấy tên/email)
 * - Gọi orderService.getOrderItems(orderId) khi expand
 * - Tải lại khi focus
 */

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import type { Order, OrderItem } from '../types/Order';

export default function OrdersManagementScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    useFocusEffect(useCallback(() => {
        setOrders(orderService.getAllOrders());
    }, []));

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const renderOrder = ({ item }: { item: Order }) => {
        const isExpanded = expandedOrder === item.id;
        const orderItems: OrderItem[] = isExpanded ? orderService.getOrderItems(item.id) : [];

        return (
            <OrderCard order={item} expanded={isExpanded}
                onToggle={() => setExpandedOrder(isExpanded ? null : item.id)}
                orderItems={orderItems} formatDate={formatDate} />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Ionicons name="receipt-outline" size={20} color="#A78BFA" />
                    <Text style={styles.summaryValue}>{orders.length}</Text>
                    <Text style={styles.summaryLabel}>Orders</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Ionicons name="cash-outline" size={20} color="#10B981" />
                    <Text style={styles.summaryValue}>${totalRevenue.toFixed(2)}</Text>
                    <Text style={styles.summaryLabel}>Revenue</Text>
                </View>
            </View>

            <FlatList data={orders} keyExtractor={item => item.id.toString()} renderItem={renderOrder}
                contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#374151" />
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubText}>Orders will appear here when customers checkout</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    summary: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        margin: 16, padding: 20, backgroundColor: '#1E1E30', borderRadius: 16,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#F9FAFB' },
    summaryLabel: { fontSize: 12, color: '#9CA3AF' },
    summaryDivider: { width: 1, height: 40, backgroundColor: '#2D2D45' },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 8 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
    emptySubText: { fontSize: 13, color: '#4B5563', textAlign: 'center', paddingHorizontal: 40 },
});
