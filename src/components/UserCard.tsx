/**
 * COMPONENT UserCard - Thẻ hiển thị thông tin người dùng (dùng cho Admin)
 * 
 * Hiển thị:
 * - Avatar với chữ cái đầu (vàng = admin, tím = user)
 * - Họ tên và email
 * - Badge vai trò: Admin (vàng) hoặc User (xanh lá)
 * - Nút hành động (chỉ hiện khi không phải user hiện tại):
 *   + Đổi vai trò (swap icon)
 *   + Xóa (thùng rác đỏ)
 * 
 * Dùng trong UsersManagementScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '../types/User';

interface UserCardProps {
    user: User;
    currentUserId?: number;
    onChangeRole: () => void;
    onDelete: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUserId, onChangeRole, onDelete }) => {
    const isCurrentUser = user.id === currentUserId;
    const initials = user.fullName
        ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';
    const roleColor = user.role === 'admin' ? '#F59E0B' : '#10B981';
    const roleBg = user.role === 'admin' ? '#78350F' : '#064E3B';

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: user.role === 'admin' ? '#F59E0B' : '#7C3AED' }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{user.fullName}</Text>
                    <View style={styles.emailRow}>
                        <Ionicons name="mail-outline" size={12} color="#6B7280" />
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: roleBg, borderColor: roleColor }]}>
                        <Ionicons name={user.role === 'admin' ? 'shield-checkmark' : 'person'} size={12} color={roleColor} />
                        <Text style={[styles.roleText, { color: roleColor }]}>{user.role === 'admin' ? 'Admin' : 'User'}</Text>
                    </View>
                </View>
                {!isCurrentUser && (
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.roleBtn} onPress={onChangeRole}>
                            <Ionicons name="swap-horizontal" size={16} color="#A78BFA" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteUserBtn} onPress={onDelete}>
                            <Ionicons name="trash-outline" size={16} color="#F87171" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default React.memo(UserCard);

const styles = StyleSheet.create({
    card: { backgroundColor: '#1E1E30', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D2D45' },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    info: { flex: 1, marginLeft: 14 },
    name: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
    emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    email: { fontSize: 12, color: '#6B7280' },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, marginTop: 6 },
    roleText: { fontSize: 11, fontWeight: '700' },
    actions: { gap: 8 },
    roleBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2D2D45', justifyContent: 'center', alignItems: 'center' },
    deleteUserBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2D1515', borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
});
