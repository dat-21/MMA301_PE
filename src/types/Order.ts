// Định nghĩa kiểu dữ liệu cho đơn hàng
export interface Order {
  id: number;              // Mã đơn hàng duy nhất
  userId: number;          // Mã người dùng đặt hàng (foreign key tới bảng users)
  total: number;           // Tổng giá trị đơn hàng (USD)
  createdAt: string;       // Thời gian tạo đơn hàng
  status: 'pending' | 'processing' | 'shipped' | 'delivered'; // Trạng thái: chờ xử lý | đang xử lý | đã gửi | đã giao
  shippingAddress?: string;  // Địa chỉ giao hàng (tùy chọn)
  paymentMethod?: string;    // Phương thức thanh toán: card/cash/paypal (tùy chọn)
  userName?: string;         // Tên người đặt (JOIN từ bảng users, dùng hiển thị)
  userEmail?: string;        // Email người đặt (JOIN từ bảng users, dùng hiển thị)
}

// Định nghĩa kiểu dữ liệu cho từng mặt hàng trong đơn hàng
export interface OrderItem {
  id: number;              // Mã mặt hàng duy nhất
  orderId: number;         // Mã đơn hàng chứa mặt hàng này (foreign key)
  productId: number;       // Mã sản phẩm (foreign key tới bảng products)
  productName: string;     // Tên sản phẩm tại thời điểm mua (snapshot)
  quantity: number;        // Số lượng mua
  price: number;           // Giá tại thời điểm mua (snapshot, không thay đổi khi giá sản phẩm thay đổi)
  image?: string | null;   // Hình ảnh sản phẩm
}
