/**
 * APP.TSX - Component gốc của ứng dụng
 * 
 * Cấu trúc:
 * AuthProvider (cung cấp thông tin đăng nhập cho toàn app)
 *   └── AppNavigator (quản lý điều hướng giữa các màn hình)
 * 
 * File này được import bởi index.js và đăng ký với Expo.
 */

import { AuthProvider } from './src/context/AuthContext'; // Provider quản lý xác thực
import AppNavigator from './src/navigation/AppNavigator'; // Navigator chứa tất cả màn hình

/**
 * Component gốc - bao bọc toàn bộ ứng dụng trong AuthProvider
 * để mọi màn hình con đều có thể truy cập thông tin người dùng đang đăng nhập
 */
export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}
