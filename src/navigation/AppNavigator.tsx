/**
 * APP NAVIGATOR - Cấu hình điều hướng (navigation) cho toàn bộ ứng dụng
 * 
 * Sử dụng React Navigation v7 với Native Stack Navigator.
 * 
 * Luồng điều hướng:
 * - Nếu chưa đăng nhập (user == null): hiển thị LoginScreen và RegisterScreen
 * - Nếu đã đăng nhập (user != null): hiển thị tất cả các màn hình chính
 * 
 * Cấu hình:
 * - DarkTheme: tùy chỉnh màu tối cho NavigationContainer
 * - screenOptions: header tối, chữ trắng, không shadow
 * - Tất cả route được type-safe nhờ RootStackParamList
 * 
 * Tổng cộng 18 màn hình: 2 auth + 16 app
 */

import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import type { RootStackParamList } from '../types/Navigation';

// ===== IMPORT TẤT CẢ CÁC MÀN HÌNH =====
import LoginScreen from '../screens/LoginScreen';             // Màn hình đăng nhập
import RegisterScreen from '../screens/RegisterScreen';       // Màn hình đăng ký
import HomeScreen from '../screens/HomeScreen';               // Trang chủ
import ProductListScreen from '../screens/ProductListScreen'; // Danh sách sản phẩm
import ProductDetailScreen from '../screens/ProductDetailScreen';       // Chi tiết sản phẩm
import AddEditProductScreen from '../screens/AddEditProductScreen';     // Thêm/sửa sản phẩm (admin)
import CartScreen from '../screens/CartScreen';                         // Giỏ hàng
import CheckoutScreen from '../screens/CheckoutScreen';                 // Thanh toán
import RevenueScreen from '../screens/RevenueScreen';                   // Doanh thu (admin)
import AdminDashboardScreen from '../screens/AdminDashboardScreen';     // Dashboard (admin)
import OrdersManagementScreen from '../screens/OrdersManagementScreen'; // Quản lý đơn hàng (admin)
import UsersManagementScreen from '../screens/UsersManagementScreen';   // Quản lý người dùng (admin)
import AnalyticsScreen from '../screens/AnalyticsScreen';               // Phân tích (admin)
import MyOrdersScreen from '../screens/MyOrdersScreen';                 // Lịch sử đơn hàng
import ProfileScreen from '../screens/ProfileScreen';                   // Trang cá nhân
import WishlistScreen from '../screens/WishlistScreen';                 // Danh sách yêu thích

// Tạo Stack Navigator với generic type để đảm bảo type-safe navigation
const Stack = createNativeStackNavigator<RootStackParamList>();

// Theme tối tùy chỉnh cho toàn bộ navigation (nền tối, chữ trắng, viền tím)
const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#0F0F1A',
        card: '#13131F',
        text: '#F9FAFB',
        border: '#2D2D45',
        primary: '#A78BFA',
        notification: '#7C3AED',
    },
};

// Cấu hình mặc định cho header của tất cả màn hình
const screenOptions = {
    headerStyle: { backgroundColor: '#13131F' },      // Nền header tối
    headerTintColor: '#F9FAFB',                        // Màu chữ/icon header trắng
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 }, // Font đậm
    headerShadowVisible: false,                        // Tắt bóng header
    contentStyle: { backgroundColor: '#0F0F1A' },      // Nền nội dung tối
};

export default function AppNavigator() {
    // Lấy thông tin người dùng từ AuthContext để xác định màn hình hiển thị
    const { user } = useContext(AuthContext);

    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator screenOptions={screenOptions}>
                {/* Nếu chưa đăng nhập: chỉ hiển thị màn hình đăng nhập và đăng ký */}
                {user == null ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    // Đã đăng nhập: hiển thị tất cả màn hình ứng dụng
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ProductList" component={ProductListScreen}
                            options={({ route }) => ({ title: route.params?.categoryName ?? 'Products' })} />
                        {/* Tiêu đề động: hiển tên danh mục nếu có, không thì "Products" */}
                        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Detail' }} />
                        <Stack.Screen name="AddEditProduct" component={AddEditProductScreen}
                            options={({ route }) => ({ title: route.params?.product ? 'Edit Product' : 'Add Product' })} />
                        {/* Tiêu đề động: "Edit Product" nếu sửa, "Add Product" nếu thêm mới */}
                        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart' }} />
                        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
                        <Stack.Screen name="Revenue" component={RevenueScreen} options={{ title: 'Revenue' }} />
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
                        <Stack.Screen name="OrdersManagement" component={OrdersManagementScreen} options={{ title: 'Orders Management' }} />
                        <Stack.Screen name="UsersManagement" component={UsersManagementScreen} options={{ title: 'Users Management' }} />
                        <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
                        <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
                        <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
