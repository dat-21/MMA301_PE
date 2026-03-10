// Định nghĩa kiểu dữ liệu cho danh mục sản phẩm
export interface Category {
  id: number;    // Mã danh mục duy nhất
  name: string;  // Tên danh mục (VD: 'Electronics', 'Clothing', ...)
  icon: string;  // Tên icon Ionicons hiển thị cho danh mục (VD: 'phone-portrait-outline')
}
