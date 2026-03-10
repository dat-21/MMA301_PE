/**
 * COMPONENT DashboardCard - Thẻ thống kê trên bảng điều khiển Admin
 * 
 * Hiển thị một chỉ số thống kê với:
 * - Icon với màu tùy chỉnh (VD: icon giỏ hàng màu xanh)
 * - Giá trị số lớn (VD: 1,234)
 * - Tiêu đề (VD: "Total Revenue")
 * - Phụ đề tùy chọn (VD: "Today: $500")
 * - Viền trái màu phân biệt loại thẻ
 * 
 * Sử dụng trong AdminDashboardScreen để hiển thị: tổng sản phẩm, doanh thu, đơn hàng, người dùng
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    bgColor?: string;
    title: string;
    value: string | number;
    subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, iconColor, bgColor, title, value, subtitle }) => (
    <View style={[styles.card, { borderLeftColor: iconColor }]}>
        <View style={[styles.iconCircle, { backgroundColor: bgColor || iconColor + '18' }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
);

export default React.memo(DashboardCard);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E30', borderRadius: 16, padding: 16, width: '47%', marginBottom: 14,
        borderWidth: 1, borderColor: '#2D2D45', borderLeftWidth: 4,
    },
    iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    value: { fontSize: 24, fontWeight: '800', color: '#F9FAFB', marginBottom: 2 },
    title: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
    subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});
