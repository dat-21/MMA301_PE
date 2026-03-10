/**
 * AUTH CONTEXT - Quản lý trạng thái xác thực người dùng toàn ứng dụng
 * 
 * Cung cấp cho tất cả component con thông qua React Context:
 * - user: thông tin người dùng hiện tại (đang đăng nhập) hoặc null
 * - login(): lưu user vào state và AsyncStorage (nhớ phiên đăng nhập)
 * - logout(): xóa user khỏi state và AsyncStorage
 * - loading: true khi đang kiểm tra phiên đăng nhập cũ từ AsyncStorage
 * - isAdmin: true nếu người dùng có role = 'admin'
 */

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Lưu dữ liệu key-value trên thiết bị
import type { User } from '../types/User';

// Kiểu dữ liệu cho những gì AuthContext cung cấp
interface AuthContextType {
    user: User | null;                   // Người dùng hiện tại
    login: (userData: User) => Promise<void>;  // Hàm đăng nhập
    logout: () => Promise<void>;               // Hàm đăng xuất
    loading: boolean;                    // Đang tải phiên đăng nhập
    isAdmin: boolean;                    // Có phải admin không
}

// Tạo Context với giá trị mặc định (dùng khi chưa có Provider bao bọc)
export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { },
    logout: async () => { },
    loading: true,
    isAdmin: false,
});

interface AuthProviderProps {
    children: ReactNode; // Các component con sẽ được bao bọc bởi Provider
}

/**
 * AuthProvider - Component bao bọc toàn bộ ứng dụng để cung cấp thông tin xác thực
 * Đặt ở App.tsx: <AuthProvider><AppNavigator /></AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);  // State lưu người dùng hiện tại
    const [loading, setLoading] = useState(true);          // Đang kiểm tra phiên cũ

    // Khi app khởi động: kiểm tra xem có phiên đăng nhập cũ trong AsyncStorage không
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user'); // Đọc từ bộ nhớ thiết bị
            if (storedUser) {
                setUser(JSON.parse(storedUser) as User); // Khôi phục phiên đăng nhập
            }
            setLoading(false); // Hoàn tất kiểm tra
        };
        loadUser();
    }, []);

    // Hàm đăng nhập: lưu user vào AsyncStorage (nhớ phiên) và cập nhật state
    const login = async (userData: User) => {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Hàm đăng xuất: xóa user khỏi AsyncStorage và reset state về null
    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
    };

    // Tiện ích: kiểm tra nhanh vai trò admin
    const isAdmin = user?.role === 'admin';

    // Cung cấp tất cả giá trị cho các component con thông qua Context.Provider
    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
