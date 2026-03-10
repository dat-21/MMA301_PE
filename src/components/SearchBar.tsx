/**
 * COMPONENT SearchBar - Thanh tìm kiếm sản phẩm
 * 
 * Tính năng:
 * - Input với icon kính lúp bên trái
 * - Placeholder tùy chỉnh (mặc định: "Search products...")
 * - Nút xóa nội dung (X) xuất hiện khi có text
 * - Gọi callback onSearch mỗi khi text thay đổi
 * - Giao diện dark theme với viền mờ
 * 
 * Dùng trong ProductListScreen và HomeScreen
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Search products...', onClear }) => (
    <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
        />
        {value.length > 0 && (
            <TouchableOpacity onPress={onClear ?? (() => onChangeText(''))}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
        )}
    </View>
);

export default React.memo(SearchBar);

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E30',
        marginHorizontal: 16, marginBottom: 8, borderRadius: 14,
        paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#2D2D45',
    },
    searchInput: { flex: 1, fontSize: 16, color: '#F9FAFB' },
});
