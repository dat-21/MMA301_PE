// Định nghĩa kiểu dữ liệu cho người dùng trong hệ thống
export interface User {
  id: number;             // Mã định danh duy nhất của người dùng (primary key)
  fullName: string;       // Họ và tên đầy đủ
  email: string;          // Địa chỉ email (dùng để đăng nhập)
  password?: string;      // Mật khẩu (tùy chọn - không trả về khi hiển thị thông tin)
  role: 'admin' | 'user'; // Vai trò: 'admin' = quản trị viên, 'user' = người dùng thường
}
