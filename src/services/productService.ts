/**
 * PRODUCT SERVICE - Dịch vụ quản lý sản phẩm
 * 
 * Cung cấp tất cả các thao tác liên quan đến sản phẩm:
 * - CRUD sản phẩm (tạo, đọc, cập nhật, xóa)
 * - Lấy danh sách sản phẩm với tìm kiếm, lọc theo danh mục, sắp xếp giá, phân trang
 * - Sản phẩm nổi bật (theo rating), bán chạy (theo số lượng đã bán), mới nhất (theo ngày tạo)
 * - Quản lý wishlist (yêu thích) và lịch sử xem gần đây
 * - Lấy danh sách danh mục sản phẩm
 */

import db from '../database/database';
import type { Product } from '../types/Product';
import type { Category } from '../types/Category';

// Kiểu dữ liệu cho tùy chọn query sản phẩm
interface ProductQueryOptions {
  search?: string;               // Từ khóa tìm kiếm theo tên sản phẩm
  categoryId?: number;           // Lọc theo mã danh mục
  sortOrder?: 'asc' | 'desc' | null; // Thứ tự sắp xếp theo giá (tăng/giảm)
  limit?: number;                // Số lượng sản phẩm tối đa trả về (phân trang)
  offset?: number;               // Vị trí bắt đầu lấy (phân trang)
}

export const productService = {
  /**
   * Lấy danh sách sản phẩm với nhiều tùy chọn lọc/sắp xếp/phân trang
   * Xây dựng câu query SQL động dựa trên các options truyền vào
   */
  getAll(options: ProductQueryOptions = {}): Product[] {
    let query = 'SELECT * FROM products';
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    // Tìm kiếm theo tên sản phẩm (không phân biệt hoa thường)
    if (options.search?.trim()) {
      conditions.push('LOWER(name) LIKE ?');
      params.push(`%${options.search.trim().toLowerCase()}%`);
    }
    // Lọc theo danh mục
    if (options.categoryId) {
      conditions.push('categoryId = ?');
      params.push(options.categoryId);
    }

    // Ghép điều kiện WHERE nếu có
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sắp xếp theo giá hoặc mặc định theo id mới nhất
    if (options.sortOrder === 'asc') query += ' ORDER BY price ASC';
    else if (options.sortOrder === 'desc') query += ' ORDER BY price DESC';
    else query += ' ORDER BY id DESC';

    // Phân trang: LIMIT + OFFSET
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    return db.getAllSync(query, params) as Product[];
  },

  /** Lấy sản phẩm theo ID - trả về null nếu không tìm thấy */
  getById(id: number): Product | null {
    return db.getFirstSync<Product>('SELECT * FROM products WHERE id = ?', [id]) ?? null;
  },

  /** Lấy sản phẩm nổi bật - sắp xếp theo rating cao nhất */
  getFeatured(limit = 6): Product[] {
    return db.getAllSync(
      'SELECT * FROM products ORDER BY rating DESC LIMIT ?',
      [limit]
    ) as Product[];
  },

  /** Lấy sản phẩm bán chạy nhất - JOIN với order_items để tính tổng số lượng đã bán */
  getBestSellers(limit = 6): Product[] {
    return db.getAllSync(
      `SELECT p.* FROM products p
       LEFT JOIN (SELECT productId, SUM(quantity) as sold FROM order_items GROUP BY productId) oi
       ON p.id = oi.productId
       ORDER BY COALESCE(oi.sold, 0) DESC LIMIT ?`,
      [limit]
    ) as Product[];
  },

  /** Lấy sản phẩm mới nhất - sắp xếp theo ngày tạo gần nhất */
  getNewArrivals(limit = 6): Product[] {
    return db.getAllSync(
      'SELECT * FROM products ORDER BY createdAt DESC, id DESC LIMIT ?',
      [limit]
    ) as Product[];
  },

  /** Lấy sản phẩm theo danh mục cụ thể */
  getByCategory(categoryId: number, limit = 10): Product[] {
    return db.getAllSync(
      'SELECT * FROM products WHERE categoryId = ? ORDER BY id DESC LIMIT ?',
      [categoryId, limit]
    ) as Product[];
  },

  /** Lấy sản phẩm liên quan - cùng danh mục nhưng khác sản phẩm hiện tại, sắp xếp theo rating */
  getRelated(productId: number, categoryId: number | null, limit = 6): Product[] {
    if (!categoryId) return [];
    return db.getAllSync(
      'SELECT * FROM products WHERE categoryId = ? AND id != ? ORDER BY rating DESC LIMIT ?',
      [categoryId, productId, limit]
    ) as Product[];
  },

  /** Tạo sản phẩm mới - trả về ID vừa tạo */
  create(product: Omit<Product, 'id' | 'createdAt'>): number {
    const result = db.runSync(
      'INSERT INTO products (name, description, price, image, categoryId, stock, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [product.name, product.description ?? '', product.price, product.image ?? '', product.categoryId ?? 1, product.stock ?? 50, product.rating ?? 4.0]
    );
    return result.lastInsertRowId;
  },

  /** Cập nhật thông tin sản phẩm theo ID */
  update(id: number, product: Partial<Product>): void {
    db.runSync(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ?, categoryId = ?, stock = ? WHERE id = ?',
      [product.name ?? '', product.description ?? '', product.price ?? 0, product.image ?? '', product.categoryId ?? 1, product.stock ?? 50, id]
    );
  },

  /** Xóa sản phẩm và xóa luôn khỏi giỏ hàng của tất cả users */
  delete(id: number): void {
    db.runSync('DELETE FROM products WHERE id = ?', [id]);
    db.runSync('DELETE FROM cart_items WHERE productId = ?', [id]);
  },

  /** Đếm tổng số sản phẩm trong hệ thống */
  getCount(): number {
    const r = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM products');
    return r?.count ?? 0;
  },

  /** Lấy tất cả danh mục sản phẩm - dùng cho bộ lọc và form thêm/sửa sản phẩm */
  getCategories(): Category[] {
    return db.getAllSync('SELECT * FROM categories ORDER BY id') as Category[];
  },

  /**
   * Thêm sản phẩm vào danh sách đã xem gần đây
   * Nếu đã tồn tại thì xóa cũ và thêm mới (để cập nhật thời gian xem)
   * Giới hạn tối đa 20 sản phẩm gần đây nhất
   */
  addToRecentlyViewed(userId: number, productId: number): void {
    db.runSync('DELETE FROM recently_viewed WHERE userId = ? AND productId = ?', [userId, productId]);
    db.runSync('INSERT INTO recently_viewed (userId, productId) VALUES (?, ?)', [userId, productId]);
    // Keep only last 20
    db.runSync(
      `DELETE FROM recently_viewed WHERE userId = ? AND id NOT IN (
        SELECT id FROM recently_viewed WHERE userId = ? ORDER BY viewedAt DESC LIMIT 20
      )`,
      [userId, userId]
    );
  },

  /** Lấy danh sách sản phẩm đã xem gần đây - JOIN với bảng products để lấy thông tin đầy đủ */
  getRecentlyViewed(userId: number, limit = 10): Product[] {
    return db.getAllSync(
      `SELECT p.* FROM recently_viewed rv
       JOIN products p ON rv.productId = p.id
       WHERE rv.userId = ?
       ORDER BY rv.viewedAt DESC LIMIT ?`,
      [userId, limit]
    ) as Product[];
  },

  /**
   * Bật/tắt wishlist cho sản phẩm (toggle)
   * Nếu đã có trong wishlist -> xóa (bỏ yêu thích) -> return false
   * Nếu chưa có -> thêm vào (yêu thích) -> return true
   */
  toggleWishlist(userId: number, productId: number): boolean {
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM wishlist WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    if (existing) {
      db.runSync('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      return false;
    } else {
      db.runSync('INSERT INTO wishlist (userId, productId) VALUES (?, ?)', [userId, productId]);
      return true;
    }
  },

  /** Kiểm tra sản phẩm có trong wishlist của user không */
  isInWishlist(userId: number, productId: number): boolean {
    const r = db.getFirstSync<{ id: number }>(
      'SELECT id FROM wishlist WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    return !!r;
  },

  /** Lấy toàn bộ danh sách sản phẩm yêu thích - JOIN với products */
  getWishlist(userId: number): Product[] {
    return db.getAllSync(
      `SELECT p.* FROM wishlist w JOIN products p ON w.productId = p.id WHERE w.userId = ? ORDER BY w.id DESC`,
      [userId]
    ) as Product[];
  },

  /** Đếm số sản phẩm trong wishlist */
  getWishlistCount(userId: number): number {
    const r = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM wishlist WHERE userId = ?',
      [userId]
    );
    return r?.count ?? 0;
  },
};
