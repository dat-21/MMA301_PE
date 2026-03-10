/**
 * MÀN HÌNH PHÂN TÍCH & THỐNG KÊ (AnalyticsScreen) - Chỉ dành cho Admin
 * 
 * Giao diện:
 * - 3 KPI cards: Tổng đơn hàng, Giá trị trung bình, Tổng sản phẩm đã bán
 * - Biểu đồ doanh thu theo ngày: các cột thanh ngang (7 ngày gần nhất)
 * - Biểu đồ doanh thu theo tháng: các cột thanh ngang (6 tháng gần nhất)
 * - Top sản phẩm bán chạy: danh sách với số lượng và doanh thu
 * - Kéo xuống để refresh (RefreshControl)
 * 
 * Dữ liệu:
 * - orderService.getOrderCount(), getAvgOrderValue(), getTotalItemsSold()
 * - orderService.getRevenueByDay(7), getRevenueByMonth(6)
 * - orderService.getTopSellingProducts(10)
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import DashboardCard from '../components/DashboardCard';

export default function AnalyticsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [totalSold, setTotalSold] = useState(0);
    const [revenueByDay, setRevenueByDay] = useState<Array<{ day: string; revenue: number; orders: number }>>([]);
    const [revenueByMonth, setRevenueByMonth] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
    const [topProducts, setTopProducts] = useState<Array<{ productName: string; totalSold: number; totalRevenue: number }>>([]);
    const [avgOrderValue, setAvgOrderValue] = useState(0);

    const loadData = () => {
        setTotalSold(orderService.getTotalItemsSold());
        setAvgOrderValue(orderService.getAvgOrderValue());
        setRevenueByDay(orderService.getRevenueByDay(7));
        setRevenueByMonth(orderService.getRevenueByMonth(6));
        setTopProducts(orderService.getTopSellingProducts(10));
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const onRefresh = () => { setRefreshing(true); loadData(); setRefreshing(false); };

    const formatDay = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1);
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    const maxDayRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);
    const maxMonthRevenue = Math.max(...revenueByMonth.map(m => m.revenue), 1);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}>
                <View style={styles.grid}>
                    <DashboardCard icon="cart-outline" iconColor="#7C3AED" title="Total Sold" value={totalSold} />
                    <DashboardCard icon="trending-up-outline" iconColor="#10B981" title="Avg Order" value={`$${avgOrderValue.toFixed(2)}`} />
                </View>

                <Text style={styles.sectionTitle}>Revenue by Day</Text>
                {revenueByDay.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="bar-chart-outline" size={28} color="#4B5563" />
                        <Text style={styles.emptyText}>No data</Text>
                    </View>
                ) : (
                    <View style={styles.chartCard}>
                        {revenueByDay.map((item, i) => (
                            <View key={i} style={styles.barRow}>
                                <Text style={styles.barLabel}>{formatDay(item.day)}</Text>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, {
                                        width: `${(item.revenue / maxDayRevenue) * 100}%`, backgroundColor: '#7C3AED',
                                    }]} />
                                </View>
                                <Text style={styles.barValue}>${item.revenue.toFixed(0)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Revenue by Month</Text>
                {revenueByMonth.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="calendar-outline" size={28} color="#4B5563" />
                        <Text style={styles.emptyText}>No data</Text>
                    </View>
                ) : (
                    <View style={styles.chartCard}>
                        {revenueByMonth.map((item, i) => (
                            <View key={i} style={styles.barRow}>
                                <Text style={styles.barLabel}>{formatMonth(item.month)}</Text>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, {
                                        width: `${(item.revenue / maxMonthRevenue) * 100}%`, backgroundColor: '#10B981',
                                    }]} />
                                </View>
                                <Text style={styles.barValue}>${item.revenue.toFixed(0)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Top Selling Products</Text>
                {topProducts.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="trophy-outline" size={28} color="#4B5563" />
                        <Text style={styles.emptyText}>No sales data</Text>
                    </View>
                ) : (
                    <View style={styles.chartCard}>
                        {topProducts.map((item, i) => (
                            <View key={i} style={styles.productRow}>
                                <View style={[styles.rankCircle, i === 0 && styles.rankGold]}>
                                    <Text style={[styles.rankText, i === 0 && { color: '#fff' }]}>{i + 1}</Text>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                                    <Text style={styles.productSub}>{item.totalSold} sold · ${item.totalRevenue.toFixed(2)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, gap: 14,
    },
    sectionTitle: {
        paddingHorizontal: 20, fontSize: 18, fontWeight: '700', color: '#F9FAFB',
        marginTop: 24, marginBottom: 12,
    },
    emptyCard: {
        marginHorizontal: 20, backgroundColor: '#1E1E30', borderRadius: 16, padding: 28,
        alignItems: 'center', borderWidth: 1, borderColor: '#2D2D45', gap: 8,
    },
    emptyText: { fontSize: 14, color: '#6B7280' },
    chartCard: {
        marginHorizontal: 20, backgroundColor: '#1E1E30', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    barLabel: { width: 60, fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    barTrack: { flex: 1, height: 20, backgroundColor: '#2D2D45', borderRadius: 6, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 6, minWidth: 4 },
    barValue: { width: 60, fontSize: 13, fontWeight: '700', color: '#F9FAFB', textAlign: 'right' },
    productRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#2D2D45',
    },
    rankCircle: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: '#2D2D45',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    rankGold: { backgroundColor: '#F59E0B' },
    rankText: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
    productInfo: { flex: 1 },
    productName: { fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
    productSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
