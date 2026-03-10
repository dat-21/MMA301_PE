/**
 * COMPONENT Skeleton - Hiệu ứng loading giữ chỗ (placeholder shimmer)
 * 
 * Tính năng:
 * - Hiển thị hình chữ nhật xám nhấp nháy khi dữ liệu đang tải
 * - Animation opacity lặp lại vô hạn (0.3 -> 0.7 -> 0.3)
 * - Kích thước tùy chỉnh qua props: width, height, borderRadius
 * - Màu nền: #2D2D45 (tối, phù hợp dark theme)
 * 
 * Dùng thay thế nội dung thật trong khi chờ API trả dữ liệu
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: object;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width: w = '100%',
    height = 20,
    borderRadius = 8,
    style,
}) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: w as any,
                    height,
                    borderRadius,
                    backgroundColor: '#2D2D45',
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const ProductCardSkeleton: React.FC = () => (
    <View style={skStyles.card}>
        <Skeleton width={110} height={150} borderRadius={0} />
        <View style={skStyles.info}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
            <Skeleton width="40%" height={20} style={{ marginTop: 12 }} />
            <Skeleton width="50%" height={28} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
    </View>
);

export const ProductGridSkeleton: React.FC = () => (
    <View style={skStyles.gridCard}>
        <Skeleton width="100%" height={140} borderRadius={0} />
        <View style={{ padding: 10 }}>
            <Skeleton width="80%" height={14} />
            <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
            <Skeleton width="60%" height={18} style={{ marginTop: 8 }} />
        </View>
    </View>
);

export default React.memo(Skeleton);

const skStyles = StyleSheet.create({
    card: {
        flexDirection: 'row', backgroundColor: '#1E1E30', borderRadius: 16,
        marginBottom: 12, borderWidth: 1, borderColor: '#2D2D45', overflow: 'hidden',
    },
    info: { flex: 1, padding: 12, justifyContent: 'center' },
    gridCard: {
        backgroundColor: '#1E1E30', borderRadius: 16, width: 160,
        marginRight: 12, borderWidth: 1, borderColor: '#2D2D45', overflow: 'hidden',
    },
});
