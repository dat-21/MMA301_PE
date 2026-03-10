// Định nghĩa kiểu dữ liệu cho mặt hàng trong giỏ hàng
export interface CartItem {
  id: number;                // Mã bản ghi giỏ hàng duy nhất
  userId: number;            // Mã người dùng sở hữu giỏ hàng
  productId: number;         // Mã sản phẩm trong giỏ (foreign key)
  quantity: number;          // Số lượng sản phẩm đã thêm vào giỏ
  name?: string;             // Tên sản phẩm (JOIN từ bảng products, dùng hiển thị)
  price?: number;            // Giá sản phẩm (JOIN từ bảng products, dùng hiển thị)
  image?: string | null;     // Hình ảnh sản phẩm (JOIN từ bảng products)
}
