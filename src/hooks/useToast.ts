/**
 * HOOK useToast - Quản lý hiển thị thông báo toast (những dòng thông báo ngắn xuất hiện rồi tự biến mất)
 * 
 * Sử dụng: const { toast, showToast, hideToast } = useToast();
 * - showToast('Thành công!', 'success') -> hiển thị toast xanh
 * - showToast('Lỗi rồi!', 'error') -> hiển thị toast đỏ
 * - hideToast() -> ẩn toast
 * Phối hợp với component Toast.tsx để render giao diện
 */

import { useState, useCallback } from 'react';

// Kiểu dữ liệu cho trạng thái toast
interface ToastState {
  visible: boolean;                            // Đang hiển thị hay không
  message: string;                             // Nội dung thông báo
  type: 'success' | 'error' | 'warning' | 'info'; // Loại toast (ảnh hưởng màu sắc và icon)
}

export default function useToast() {
  // State lưu trạng thái toast hiện tại
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Hàm hiển thị toast - dùng useCallback để tránh re-render không cần thiết
  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  // Hàm ẩn toast
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
