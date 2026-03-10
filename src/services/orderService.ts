/**
 * ORDER SERVICE - Dịch vụ quản lý đơn hàng
 * 
 * Cung cấp:
 * - Thanh toán (checkout): tạo đơn hàng + chi tiết đơn hàng + giảm tồn kho + xóa giỏ hàng
 * - Lấy đơn hàng theo user / lấy tất cả đơn hàng (admin)
 * - Thống kê doanh thu theo ngày/tháng/năm
 * - Phân tích: sản phẩm bán chạy, giá trị trung bình đơn hàng, tổng sản phẩm đã bán
 */

import db from '../database/database';
import type { Order, OrderItem } from '../types/Order';
import type { CartItem } from '../types/CartItem';

// Kiểu dữ liệu cho thông tin thanh toán
interface CheckoutData {
  userId: number;            // ID người dùng thanh toán
  cartItems: CartItem[];     // Danh sách sản phẩm trong giỏ
  total: number;             // Tổng tiền đơn hàng
  shippingAddress: string;   // Địa chỉ giao hàng
  paymentMethod: string;     // Phương thức thanh toán (card/cash/paypal)
}

export const orderService = {
  /**
   * Thanh toán đơn hàng - Quy trình:
   * 1. Tạo bản ghi đơn hàng mới trong bảng orders
   * 2. Tạo các bản ghi chi tiết (order_items) cho từng sản phẩm
   * 3. Giảm số lượng tồn kho (stock) của mỗi sản phẩm
   * 4. Xóa toàn bộ giỏ hàng của user
   * @returns ID của đơn hàng vừa tạo
   */
  checkout(data: CheckoutData): number {
    const now = new Date().toISOString();
    const result = db.runSync(
      'INSERT INTO orders (userId, total, createdAt, status, shippingAddress, paymentMethod) VALUES (?, ?, ?, ?, ?, ?)',
      [data.userId, data.total, now, 'pending', data.shippingAddress, data.paymentMethod]
    );
    const orderId = result.lastInsertRowId;

    for (const item of data.cartItems) {
      db.runSync(
        'INSERT INTO order_items (orderId, productId, productName, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.productId, item.name ?? '', item.quantity, item.price ?? 0, item.image ?? '']
      );
      // Decrease stock
      db.runSync('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', [item.quantity, item.productId]);
    }

    db.runSync('DELETE FROM cart_items WHERE userId = ?', [data.userId]);
    return orderId;
  },

  /** Lấy tất cả đơn hàng của một user - sắp xếp mới nhất trước */
  getUserOrders(userId: number): Order[] {
    return db.getAllSync(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    ) as Order[];
  },

  /** Lấy tất cả đơn hàng (admin) - JOIN với users để lấy tên/email người đặt */
  getAllOrders(): Order[] {
    return db.getAllSync(
      `SELECT o.*, u.fullName as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC`
    ) as Order[];
  },

  /** Lấy danh sách sản phẩm trong một đơn hàng cụ thể */
  getOrderItems(orderId: number): OrderItem[] {
    return db.getAllSync(
      'SELECT * FROM order_items WHERE orderId = ?',
      [orderId]
    ) as OrderItem[];
  },

  /** Đếm tổng số đơn hàng trong hệ thống */
  getOrderCount(): number {
    const r = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM orders');
    return r?.count ?? 0;
  },

  /** Lấy tổng doanh thu tất cả đơn hàng */
  getTotalRevenue(): number {
    const r = db.getFirstSync<{ total: number }>('SELECT COALESCE(SUM(total), 0) as total FROM orders');
    return r?.total ?? 0;
  },

  /**
   * Lấy đơn hàng theo bộ lọc thời gian
   * 'all' = tất cả, 'day' = hôm nay, 'month' = tháng này, 'year' = năm nay
   */
  getRevenueByFilter(filter: 'all' | 'day' | 'month' | 'year'): Order[] {
    let query = 'SELECT * FROM orders';
    const now = new Date();

    if (filter === 'day') {
      const today = now.toISOString().split('T')[0];
      query += ` WHERE createdAt LIKE '${today}%'`;
    } else if (filter === 'month') {
      const yearMonth = now.toISOString().slice(0, 7);
      query += ` WHERE createdAt LIKE '${yearMonth}%'`;
    } else if (filter === 'year') {
      const year = now.getFullYear().toString();
      query += ` WHERE createdAt LIKE '${year}%'`;
    }

    query += ' ORDER BY createdAt DESC';
    return db.getAllSync(query) as Order[];
  },

  /** Thống kê doanh thu theo ngày - dùng cho biểu đồ trong màn hình Analytics */
  getRevenueByDay(limit = 7): Array<{ day: string; revenue: number; orders: number }> {
    return db.getAllSync(
      `SELECT DATE(createdAt) as day, SUM(total) as revenue, COUNT(*) as orders
       FROM orders GROUP BY DATE(createdAt) ORDER BY day DESC LIMIT ?`,
      [limit]
    ) as Array<{ day: string; revenue: number; orders: number }>;
  },

  /** Thống kê doanh thu theo tháng - dùng cho biểu đồ trong màn hình Analytics */
  getRevenueByMonth(limit = 6): Array<{ month: string; revenue: number; orders: number }> {
    return db.getAllSync(
      `SELECT SUBSTR(createdAt, 1, 7) as month, SUM(total) as revenue, COUNT(*) as orders
       FROM orders GROUP BY SUBSTR(createdAt, 1, 7) ORDER BY month DESC LIMIT ?`,
      [limit]
    ) as Array<{ month: string; revenue: number; orders: number }>;
  },

  /** Lấy top sản phẩm bán chạy nhất - tính từ bảng order_items */
  getTopSellingProducts(limit = 10): Array<{ productName: string; totalSold: number; totalRevenue: number }> {
    return db.getAllSync(
      `SELECT productName, SUM(quantity) as totalSold, SUM(quantity * price) as totalRevenue
       FROM order_items GROUP BY productName ORDER BY totalSold DESC LIMIT ?`,
      [limit]
    ) as Array<{ productName: string; totalSold: number; totalRevenue: number }>;
  },

  /** Lấy thống kê hôm nay: số đơn hàng và doanh thu */
  getTodayStats(): { orders: number; revenue: number } {
    const today = new Date().toISOString().split('T')[0];
    const ordersToday = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM orders WHERE createdAt LIKE ?',
      [`${today}%`]
    );
    const revenueToday = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE createdAt LIKE ?',
      [`${today}%`]
    );
    return {
      orders: ordersToday?.count ?? 0,
      revenue: revenueToday?.total ?? 0,
    };
  },

  /** Tính giá trị trung bình mỗi đơn hàng */
  getAvgOrderValue(): number {
    const r = db.getFirstSync<{ avg: number }>('SELECT COALESCE(AVG(total), 0) as avg FROM orders');
    return r?.avg ?? 0;
  },

  /** Tính tổng số sản phẩm đã bán ra (tất cả đơn hàng) */
  getTotalItemsSold(): number {
    const r = db.getFirstSync<{ total: number }>('SELECT COALESCE(SUM(quantity), 0) as total FROM order_items');
    return r?.total ?? 0;
  },
};
