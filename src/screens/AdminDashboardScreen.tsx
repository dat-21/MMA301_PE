/**
 * MÀN HÌNH BẢNG ĐIỀU KHIỂN (AdminDashboardScreen) - Chỉ dành cho Admin
 * 
 * Giao diện:
 * - 4 DashboardCard hiển thị số liệu tổng quan:
 *   + Tổng sản phẩm (productService.getCount)
 *   + Tổng doanh thu (orderService.getTotalRevenue)
 *   + Tổng đơn hàng (orderService.getOrderCount)
 *   + Tổng người dùng (userService.getCount)
 * - Thống kê hôm nay: số đơn + doanh thu hôm nay
 * - Top sản phẩm bán chạy: danh sách với tên, số lượng đã bán, doanh thu
 * - Kéo xuống để refresh (RefreshControl)
 * 
 * Tải lại dữ liệu mỗi khi màn hình được focus (useFocusEffect)
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import DashboardCard from '../components/DashboardCard';

export default function AdminDashboardScreen() {
    const [stats, setStats] = useState({
        totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0,
        ordersToday: 0, revenueToday: 0,
    });
    const [bestSelling, setBestSelling] = useState<Array<{ productName: string; totalSold: number }>>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = () => {
        const todayStats = orderService.getTodayStats();
        setStats({
            totalProducts: productService.getCount(),
            totalOrders: orderService.getOrderCount(),
            totalRevenue: orderService.getTotalRevenue(),
            totalUsers: userService.getCount(),
            ordersToday: todayStats.orders,
            revenueToday: todayStats.revenue,
        });
        setBestSelling(orderService.getTopSellingProducts(5));
    };

    useFocusEffect(useCallback(() => { loadStats(); }, []));

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="view-dashboard" size={28} color="#A78BFA" />
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                </View>

                <View style={styles.grid}>
                    <DashboardCard icon="cube-outline" iconColor="#7C3AED" title="Total Products" value={stats.totalProducts} />
                    <DashboardCard icon="receipt-outline" iconColor="#3B82F6" title="Total Orders" value={stats.totalOrders} />
                    <DashboardCard icon="cash-outline" iconColor="#10B981" title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
                    <DashboardCard icon="people-outline" iconColor="#F59E0B" title="Total Users" value={stats.totalUsers} />
                </View>

                <Text style={styles.sectionTitle}>Today</Text>
                <View style={styles.grid}>
                    <DashboardCard icon="today-outline" iconColor="#EC4899" title="Orders Today" value={stats.ordersToday} />
                    <DashboardCard icon="trending-up-outline" iconColor="#6366F1" title="Revenue Today" value={`$${stats.revenueToday.toFixed(2)}`} />
                </View>

                <Text style={styles.sectionTitle}>Best Selling Products</Text>
                {bestSelling.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="analytics-outline" size={32} color="#4B5563" />
                        <Text style={styles.emptyText}>No sales data yet</Text>
                    </View>
                ) : (
                    <View style={styles.listCard}>
                        {bestSelling.map((item, index) => (
                            <View key={index} style={styles.rankRow}>
                                <View style={[styles.rankBadge, index === 0 && styles.rankFirst]}>
                                    <Text style={[styles.rankNum, index === 0 && styles.rankFirstText]}>#{index + 1}</Text>
                                </View>
                                <Text style={styles.rankName} numberOfLines={1}>{item.productName}</Text>
                                <View style={styles.soldBadge}>
                                    <Text style={styles.soldText}>{item.totalSold} sold</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#F9FAFB' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 14 },
    sectionTitle: { paddingHorizontal: 20, fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginTop: 24, marginBottom: 12 },
    emptyCard: {
        marginHorizontal: 20, backgroundColor: '#1E1E30', borderRadius: 16, padding: 32,
        alignItems: 'center', borderWidth: 1, borderColor: '#2D2D45', gap: 8,
    },
    emptyText: { fontSize: 14, color: '#6B7280' },
    listCard: {
        marginHorizontal: 20, backgroundColor: '#1E1E30', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    rankRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#2D2D45',
    },
    rankBadge: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#2D2D45',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    rankFirst: { backgroundColor: '#F59E0B' },
    rankNum: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
    rankFirstText: { color: '#fff' },
    rankName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
    soldBadge: {
        backgroundColor: '#064E3B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: '#10B981',
    },
    soldText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
});
