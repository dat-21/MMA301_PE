/**
 * COMPONENT BannerCarousel - Thanh quảng cáo/banner cuộn ngang tự động
 * 
 * Tính năng:
 * - 4 banner màu sắc khác nhau (tím, hồng, xanh lá, vàng)
 * - Tự động cuộn mỗi 4 giây (auto-scroll)
 * - Snap vào từng banner khi vuốt tay (pagingEnabled + snapToInterval)
 * - Chấm chỉ báo vị trí (dots) animated - chấm hiện tại dài hơn và sáng hơn
 * - Ô tròn trang trí gradient ở góc dưới phải
 * 
 * Dùng trên đầu HomeScreen của người dùng
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

const BANNERS = [
    { id: 1, title: 'Summer Sale', subtitle: 'Up to 50% off on Electronics', gradient: ['#7C3AED', '#5B21B6'], emoji: '🔥' },
    { id: 2, title: 'New Arrivals', subtitle: 'Fresh fashion collection just dropped', gradient: ['#EC4899', '#BE185D'], emoji: '✨' },
    { id: 3, title: 'Free Shipping', subtitle: 'On orders above $99', gradient: ['#10B981', '#059669'], emoji: '🚚' },
    { id: 4, title: 'Flash Deal', subtitle: 'Accessories from just $9.99', gradient: ['#F59E0B', '#D97706'], emoji: '⚡' },
];

const BannerCarousel: React.FC = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);
    const currentIndex = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            currentIndex.current = (currentIndex.current + 1) % BANNERS.length;
            scrollRef.current?.scrollTo({ x: currentIndex.current * BANNER_WIDTH, animated: true });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={BANNER_WIDTH}
                decelerationRate="fast"
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {BANNERS.map((banner) => (
                    <View key={banner.id} style={[styles.banner, { backgroundColor: banner.gradient[0] }]}>
                        <Text style={styles.emoji}>{banner.emoji}</Text>
                        <Text style={styles.title}>{banner.title}</Text>
                        <Text style={styles.subtitle}>{banner.subtitle}</Text>
                        <View style={[styles.decorCircle, { backgroundColor: banner.gradient[1] }]} />
                    </View>
                ))}
            </ScrollView>
            <View style={styles.dots}>
                {BANNERS.map((_, i) => {
                    const inputRange = [(i - 1) * BANNER_WIDTH, i * BANNER_WIDTH, (i + 1) * BANNER_WIDTH];
                    const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
                    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
                    return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
                })}
            </View>
        </View>
    );
};

export default React.memo(BannerCarousel);

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    banner: {
        width: BANNER_WIDTH, height: 150, borderRadius: 20, marginHorizontal: 20,
        padding: 24, justifyContent: 'center', overflow: 'hidden',
    },
    emoji: { fontSize: 32, marginBottom: 8 },
    title: { fontSize: 22, fontWeight: '800', color: '#fff' },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    decorCircle: {
        position: 'absolute', right: -30, top: -30, width: 120, height: 120,
        borderRadius: 60, opacity: 0.3,
    },
    dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 },
    dot: { height: 6, borderRadius: 3, backgroundColor: '#A78BFA' },
});
