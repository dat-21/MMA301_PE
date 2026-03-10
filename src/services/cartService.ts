/**
 * CART SERVICE - Dịch vụ quản lý giỏ hàng
 * 
 * Cung cấp:
 * - Lấy danh sách sản phẩm trong giỏ hàng (JOIN với products để lấy tên, giá, ảnh)
 * - Đếm tổng số lượng sản phẩm trong giỏ
 * - Thêm sản phẩm vào giỏ (tự động tăng số lượng nếu đã có)
 * - Cập nhật số lượng, xóa mặt hàng, xóa toàn bộ giỏ
 */

import db from '../database/database';
import type { CartItem } from '../types/CartItem';

export const cartService = {
  /** Lấy tất cả sản phẩm trong giỏ hàng - JOIN với products lấy thông tin hiển thị */
  getCartItems(userId: number): CartItem[] {
    return db.getAllSync(
      `SELECT ci.id, ci.productId, ci.quantity, p.name, p.price, p.image
       FROM cart_items ci
       JOIN products p ON ci.productId = p.id
       WHERE ci.userId = ?`,
      [userId]
    ) as CartItem[];
  },

  /** Đếm tổng số lượng sản phẩm (tính cả quantity) - dùng cho badge trên icon giỏ hàng */
  getCartCount(userId: number): number {
    const r = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE userId = ?',
      [userId]
    );
    return r?.total ?? 0;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * Nếu sản phẩm đã có trong giỏ -> tăng quantity lên 1
   * Nếu chưa có -> tạo mới với quantity = 1
   */
  addToCart(userId: number, productId: number): void {
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM cart_items WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    if (existing) {
      db.runSync(
        'UPDATE cart_items SET quantity = quantity + 1 WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
    } else {
      db.runSync(
        'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, 1)',
        [userId, productId]
      );
    }
  },

  /** Cập nhật số lượng - nếu quantity <= 0 thì tự động xóa mặt hàng khỏi giỏ */
  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    db.runSync('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
  },

  /** Xóa 1 mặt hàng khỏi giỏ hàng theo ID */
  removeItem(itemId: number): void {
    db.runSync('DELETE FROM cart_items WHERE id = ?', [itemId]);
  },

  /** Xóa toàn bộ giỏ hàng của user (sau khi checkout hoặc user chọn xóa hết) */
  clearCart(userId: number): void {
    db.runSync('DELETE FROM cart_items WHERE userId = ?', [userId]);
  },
};
