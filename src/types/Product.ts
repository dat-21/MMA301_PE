// Định nghĩa kiểu dữ liệu cho sản phẩm trong cửa hàng
export interface Product {
  id: number;                    // Mã định danh duy nhất của sản phẩm
  name: string;                  // Tên sản phẩm
  description: string | null;    // Mô tả chi tiết sản phẩm (có thể null nếu chưa nhập)
  price: number;                 // Giá bán (đơn vị: USD)
  image: string | null;          // Đường dẫn/URL hình ảnh sản phẩm
  categoryId: number | null;     // Mã danh mục sản phẩm thuộc về (foreign key tới bảng categories)
  stock: number;                 // Số lượng tồn kho hiện tại
  rating: number;                // Điểm đánh giá trung bình (0-5 sao)
  createdAt: string;             // Thời gian tạo sản phẩm (định dạng ISO string)
}
