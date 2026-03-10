import type { Product } from './Product';

/**
 * Định nghĩa tham số điều hướng (navigation params) cho tất cả các màn hình trong ứng dụng.
 * - undefined: màn hình không nhận tham số nào
 * - { key: type }: màn hình nhận tham số cụ thể khi navigate tới
 * Được dùng với createNativeStackNavigator<RootStackParamList>() để type-safe navigation.
 */
export type RootStackParamList = {
  Login: undefined;           // Màn hình đăng nhập - không cần tham số
  Register: undefined;        // Màn hình đăng ký - không cần tham số
  Home: undefined;            // Màn hình trang chủ
  ProductList: { categoryId?: number; categoryName?: string } | undefined; // Danh sách sản phẩm - có thể lọc theo danh mục
  ProductDetail: { productId: number };    // Chi tiết sản phẩm - bắt buộc truyền mã sản phẩm
  AddEditProduct: { product?: Product } | undefined; // Thêm/sửa sản phẩm - truyền product nếu sửa, không truyền nếu thêm mới
  Cart: undefined;            // Giỏ hàng
  Checkout: undefined;        // Thanh toán đơn hàng
  Revenue: undefined;         // Báo cáo doanh thu (admin)
  AdminDashboard: undefined;  // Bảng điều khiển quản trị (admin)
  OrdersManagement: undefined; // Quản lý đơn hàng (admin)
  UsersManagement: undefined;  // Quản lý người dùng (admin)
  Analytics: undefined;        // Phân tích & thống kê (admin)
  MyOrders: undefined;         // Lịch sử đơn hàng của người dùng
  Profile: undefined;          // Trang cá nhân
  Wishlist: undefined;         // Danh sách sản phẩm yêu thích
};
