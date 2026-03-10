/**
 * COMPONENT Toast - Thanh thông báo xuất hiện từ trên xuống rồi tự biến mất
 * 
 * Tính năng:
 * - Hiển thị thông báo ngắn với 4 loại: success (xanh lá), error (đỏ), warning (vàng), info (xanh dương)
 * - Animation trượt xuống khi xuất hiện, trượt lên khi biến mất
 * - Tự động biến mất sau 2.5 giây (có thể tùy chỉnh duration)
 * - Có nút đóng (X) để tắt sớm
 * - Vị trí: cố định ở đầu màn hình (position: absolute, top: 50)
 * 
 * Sử dụng với hook useToast(): <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cấu hình giao diện cho từng loại toast: icon, màu chữ, màu nền
const TOAST_CONFIG = {
    success: { icon: 'checkmark-circle' as const, color: '#10B981', bg: '#064E3B' },
    error: { icon: 'close-circle' as const, color: '#F87171', bg: '#7F1D1D' },
    warning: { icon: 'warning' as const, color: '#FBBF24', bg: '#78350F' },
    info: { icon: 'information-circle' as const, color: '#60A5FA', bg: '#1E3A5F' },
};

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onDismiss?: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ visible, message, type = 'info', onDismiss, duration = 2500 }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();

            const timer = setTimeout(() => hide(), duration);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss?.());
    };

    if (!visible) return null;
    const config = TOAST_CONFIG[type];

    return (
        <Animated.View style={[styles.container, { backgroundColor: config.bg, transform: [{ translateY }], opacity }]}>
            <View style={[styles.iconCircle, { backgroundColor: config.color + '22' }]}>
                <Ionicons name={config.icon} size={22} color={config.color} />
            </View>
            <Text style={styles.message} numberOfLines={2}>{message}</Text>
            <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default React.memo(Toast);

const styles = StyleSheet.create({
    container: {
        position: 'absolute', top: 50, left: 16, right: 16, zIndex: 9999,
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 20,
    },
    iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    message: { flex: 1, fontSize: 14, fontWeight: '600', color: '#F9FAFB', lineHeight: 20 },
});
