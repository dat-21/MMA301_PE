/**
 * COMPONENT ConfirmDialog - Hộp thoại xác nhận hành động (Modal)
 * 
 * Tính năng:
 * - Hiện thị popup xác nhận với 4 loại: danger (đỏ, xóa), warning (vàng), info (xanh), success (xanh lá)
 * - Animation scale + fade khi xuất hiện
 * - Có 2 nút: Cancel (hủy) và Confirm (xác nhận) 
 * - Nền overlay làm mờ giao diện phía sau
 * 
 * Sử dụng: <ConfirmDialog visible={true} title="Xóa?" message="Bạn chắc chứ?" type="danger" onConfirm={...} onCancel={...} />
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cấu hình giao diện cho từng loại dialog: icon, màu, nền
const TYPE_CONFIG = {
    danger: { icon: 'trash-outline' as const, color: '#F87171', bg: '#7F1D1D' },
    warning: { icon: 'warning-outline' as const, color: '#FBBF24', bg: '#78350F' },
    info: { icon: 'information-circle-outline' as const, color: '#60A5FA', bg: '#1E3A5F' },
    success: { icon: 'checkmark-circle-outline' as const, color: '#10B981', bg: '#064E3B' },
};

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible, title, message, type = 'danger',
    confirmText = 'Confirm', cancelText = 'Cancel',
    onConfirm, onCancel,
}) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const config = TYPE_CONFIG[type];

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                    <View style={[styles.iconCircle, { backgroundColor: config.color + '18' }]}>
                        <Ionicons name={config.icon} size={32} color={config.color} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: config.color }]} onPress={onConfirm} activeOpacity={0.8}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default React.memo(ConfirmDialog);

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    dialog: { width: '100%', backgroundColor: '#1E1E30', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#2D2D45' },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '800', color: '#F9FAFB', marginBottom: 8, textAlign: 'center' },
    message: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2D2D45', alignItems: 'center' },
    cancelText: { fontSize: 15, fontWeight: '700', color: '#9CA3AF' },
    confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
