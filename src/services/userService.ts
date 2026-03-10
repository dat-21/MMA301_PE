/**
 * USER SERVICE - Dịch vụ quản lý người dùng
 * 
 * Cung cấp:
 * - Xác thực (đăng nhập, đăng ký)
 * - CRUD người dùng (lấy danh sách, đếm, đổi vai trò, xóa)
 * - Xóa user sẽ xóa luôn tất cả dữ liệu liên quan (giỏ hàng, đơn hàng, wishlist, lịch sử xem)
 */

import db from '../database/database';
import type { User } from '../types/User';

export const userService = {
  /** Đăng nhập - kiểm tra email + password, trả về User hoặc null nếu sai */
  login(email: string, password: string): User | null {
    const result = db.getAllSync(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?',
      [email.trim(), password]
    ) as User[];
    return result.length > 0 ? result[0] : null;
  },

  /** Đăng ký tài khoản mới - mặc định role = 'user' */
  register(fullName: string, email: string, password: string): void {
    db.runSync(
      'INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
      [fullName.trim(), email.trim(), password]
    );
  },

  /** Lấy danh sách tất cả người dùng (admin) - sắp xếp theo ID tăng dần */
  getAll(): User[] {
    return db.getAllSync('SELECT * FROM users ORDER BY id ASC') as User[];
  },

  /** Đếm tổng số người dùng - dùng cho dashboard admin */
  getCount(): number {
    const r = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM users');
    return r?.count ?? 0;
  },

  /** Đổi vai trò người dùng (admin <-> user) */
  changeRole(userId: number, newRole: 'admin' | 'user'): void {
    db.runSync('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);
  },

  /**
   * Xóa người dùng và TẤT CẢ dữ liệu liên quan:
   * -> giỏ hàng -> chi tiết đơn hàng -> đơn hàng -> wishlist -> lịch sử xem -> user
   * Thứ tự xóa rất quan trọng để không vi phạm foreign key constraint
   */
  deleteUser(userId: number): void {
    db.runSync('DELETE FROM cart_items WHERE userId = ?', [userId]);
    db.runSync(
      'DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE userId = ?)',
      [userId]
    );
    db.runSync('DELETE FROM orders WHERE userId = ?', [userId]);
    db.runSync('DELETE FROM wishlist WHERE userId = ?', [userId]);
    db.runSync('DELETE FROM recently_viewed WHERE userId = ?', [userId]);
    db.runSync('DELETE FROM users WHERE id = ?', [userId]);
  },
};
