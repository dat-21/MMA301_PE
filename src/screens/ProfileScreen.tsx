/**
 * MÀN HÌNH CÁ NHÂN (ProfileScreen)
 * 
 * Giao diện:
 * - Avatar lớn với chữ cái đầu tên người dùng (vong tròn tím)
 * - Thông tin: họ tên, email, vai trò (badge)
 * - Menu nhanh (3 mục):
 *   + My Orders -> MyOrdersScreen (lịch sử đơn hàng)
 *   + Wishlist -> WishlistScreen (danh sách yêu thích)
 *   + My Cart -> CartScreen (giỏ hàng)
 * - Nút Logout -> gọi AuthContext.logout() -> quay về LoginScreen
 * 
 * Đọc thông tin người dùng từ AuthContext
 */

import React, { useContext } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { user, logout } = useContext(AuthContext);

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const infoItems = [
        { icon: 'person-outline' as const, label: 'Full Name', value: user?.fullName || 'N/A' },
        { icon: 'mail-outline' as const, label: 'Email', value: user?.email || 'N/A' },
        { icon: 'shield-checkmark-outline' as const, label: 'Role', value: user?.role === 'admin' ? 'Admin' : 'User' },
        { icon: 'key-outline' as const, label: 'User ID', value: `#${user?.id || 'N/A'}` },
    ];

    const menuItems = [
        { icon: 'receipt-outline' as const, label: 'My Orders', color: '#A78BFA', onPress: () => navigation.navigate('MyOrders') },
        { icon: 'heart-outline' as const, label: 'Wishlist', color: '#EF4444', onPress: () => navigation.navigate('Wishlist') },
        { icon: 'cart-outline' as const, label: 'My Cart', color: '#F59E0B', onPress: () => navigation.navigate('Cart') },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>{user?.fullName || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || ''}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
                            size={14} color={user?.role === 'admin' ? '#F59E0B' : '#10B981'} />
                        <Text style={[styles.roleText, { color: user?.role === 'admin' ? '#F59E0B' : '#10B981' }]}>
                            {user?.role === 'admin' ? 'Admin' : 'User'}
                        </Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    {infoItems.map((item, index) => (
                        <View key={index} style={[styles.infoRow, index < infoItems.length - 1 && styles.infoRowBorder]}>
                            <View style={styles.infoLeft}>
                                <Ionicons name={item.icon} size={20} color="#A78BFA" />
                                <Text style={styles.infoLabel}>{item.label}</Text>
                            </View>
                            <Text style={styles.infoValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Menu */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowBorder]}
                            onPress={item.onPress} activeOpacity={0.7}>
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon} size={20} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
    },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
    name: { fontSize: 22, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
    email: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20, backgroundColor: '#1E1E30', borderWidth: 1, borderColor: '#2D2D45',
    },
    roleText: { fontSize: 13, fontWeight: '700' },
    infoCard: {
        marginHorizontal: 20, backgroundColor: '#1E1E30', borderRadius: 16, padding: 4,
        borderWidth: 1, borderColor: '#2D2D45',
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#2D2D45' },
    infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
    infoValue: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
    menuCard: {
        marginHorizontal: 20, marginTop: 16, backgroundColor: '#1E1E30', borderRadius: 16,
        padding: 4, borderWidth: 1, borderColor: '#2D2D45',
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#2D2D45' },
    menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#2D1515', borderWidth: 1, borderColor: '#EF4444',
    },
    logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
