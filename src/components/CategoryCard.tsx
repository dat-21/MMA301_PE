/**
 * COMPONENT CategoryCard - Thẻ danh mục sản phẩm
 * 
 * Hiển thị một danh mục với:
 * - Ô tròn chứa icon Ionicons (56x56px)
 * - Tên danh mục phía dưới (tối đa 1 dòng)
 * - Trạng thái được chọn: nền tím, icon trắng, chữ tím
 * - Mặc định: nền tối, icon tím nhạt, chữ xám
 * 
 * Dùng trong HomeScreen và ProductListScreen để lọc sản phẩm theo danh mục
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Category } from '../types/Category';

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
    isSelected?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, isSelected }) => (
    <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
            <Ionicons
                name={(category.icon as keyof typeof Ionicons.glyphMap) || 'grid-outline'}
                size={22}
                color={isSelected ? '#fff' : '#A78BFA'}
            />
        </View>
        <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
            {category.name}
        </Text>
    </TouchableOpacity>
);

export default React.memo(CategoryCard);

const styles = StyleSheet.create({
    card: {
        alignItems: 'center', marginRight: 14, width: 80,
    },
    cardSelected: {},
    iconCircle: {
        width: 56, height: 56, borderRadius: 18, backgroundColor: '#1E1E30',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#2D2D45', marginBottom: 6,
    },
    iconCircleSelected: {
        backgroundColor: '#7C3AED', borderColor: '#7C3AED',
    },
    name: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textAlign: 'center' },
    nameSelected: { color: '#A78BFA', fontWeight: '700' },
});
