/**
 * MÀN HÌNH QUẢN LÝ NGƯỜI DÙNG (UsersManagementScreen) - Chỉ dành cho Admin
 * 
 * Giao diện:
 * - Tổng số người dùng ở header
 * - Danh sách UserCard: avatar, tên, email, vai trò (badge)
 * - Mỗi user card có nút:
 *   + Đổi vai trò (admin <-> user)
 *   + Xóa người dùng (với ConfirmDialog)
 * - Không hiện nút hành động cho chính mình (currentUserId)
 * 
 * Xử lý:
 * - Gọi userService.getAll() để lấy danh sách
 * - Gọi userService.changeRole() để đổi vai trò
 * - Gọi userService.deleteUser() để xóa (xóa cả dữ liệu liên quan)
 */

import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';
import UserCard from '../components/UserCard';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import useToast from '../hooks/useToast';
import type { User } from '../types/User';

export default function UsersManagementScreen() {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const { toast, showToast, hideToast } = useToast();
    const [confirm, setConfirm] = useState<{
        visible: boolean; user: User | null; type: 'role' | 'delete' | null; newRole?: string;
    }>({ visible: false, user: null, type: null });

    const loadUsers = () => setUsers(userService.getAll());

    useFocusEffect(useCallback(() => { loadUsers(); }, []));

    const handleChangeRole = (targetUser: User) => {
        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
        setConfirm({ visible: true, user: targetUser, type: 'role', newRole });
    };

    const handleDeleteUser = (targetUser: User) => {
        setConfirm({ visible: true, user: targetUser, type: 'delete' });
    };

    const confirmAction = () => {
        if (confirm.type === 'role' && confirm.user && confirm.newRole) {
            userService.changeRole(confirm.user.id, confirm.newRole as 'admin' | 'user');
            showToast(`${confirm.user.fullName} is now ${confirm.newRole === 'admin' ? 'an Admin' : 'a User'}`, 'success');
        } else if (confirm.type === 'delete' && confirm.user) {
            userService.deleteUser(confirm.user.id);
            showToast(`${confirm.user.fullName} deleted`, 'success');
        }
        setConfirm({ visible: false, user: null, type: null });
        loadUsers();
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user' || !u.role).length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
            <ConfirmDialog visible={confirm.visible && confirm.type === 'role'}
                title="Change Role" message={`Change ${confirm.user?.fullName} role to ${confirm.newRole === 'admin' ? 'Admin' : 'User'}?`}
                type="warning" confirmText="Change" onConfirm={confirmAction}
                onCancel={() => setConfirm({ visible: false, user: null, type: null })} />
            <ConfirmDialog visible={confirm.visible && confirm.type === 'delete'}
                title="Delete User" message={`Delete ${confirm.user?.fullName}? This will also remove their orders and cart.`}
                type="danger" confirmText="Delete" onConfirm={confirmAction}
                onCancel={() => setConfirm({ visible: false, user: null, type: null })} />

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Ionicons name="people" size={20} color="#A78BFA" />
                    <Text style={styles.statValue}>{users.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
                    <Text style={styles.statValue}>{adminCount}</Text>
                    <Text style={styles.statLabel}>Admins</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="person" size={20} color="#10B981" />
                    <Text style={styles.statValue}>{userCount}</Text>
                    <Text style={styles.statLabel}>Users</Text>
                </View>
            </View>

            <FlatList data={users} keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <UserCard user={item} currentUserId={currentUser?.id}
                        onChangeRole={() => handleChangeRole(item)} onDelete={() => handleDeleteUser(item)} />
                )}
                contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#374151" />
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
    statCard: {
        flex: 1, backgroundColor: '#1E1E30', borderRadius: 14, padding: 14,
        alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#2D2D45',
    },
    statValue: { fontSize: 20, fontWeight: '800', color: '#F9FAFB' },
    statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
});
