// Định nghĩa kiểu dữ liệu cho danh sách yêu thích (Wishlist)
export interface WishlistItem {
  id: number;        // Mã bản ghi wishlist duy nhất
  userId: number;    // Mã người dùng đã thêm sản phẩm vào wishlist
  productId: number; // Mã sản phẩm được yêu thích (foreign key tới bảng products)
}
