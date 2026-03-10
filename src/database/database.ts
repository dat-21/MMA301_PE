/**
 * DATABASE.TS - File cấu hình và khởi tạo cơ sở dữ liệu SQLite cho ứng dụng e-commerce
 * 
 * Chức năng chính:
 * 1. Tạo tất cả các bảng cần thiết (users, products, categories, cart_items, orders, order_items, wishlist, recently_viewed)
 * 2. Migration: thêm cột mới vào bảng cũ mà không bị lỗi nếu cột đã tồn tại
 * 3. Seed dữ liệu mẫu: danh mục, sản phẩm, tài khoản admin mặc định
 * 4. Export đối tượng database để các service sử dụng
 */

import * as SQLite from 'expo-sqlite'; // Thư viện SQLite của Expo (API đồng bộ)
import type { Product } from '../types/Product';
import type { User } from '../types/User';
import type { Order, OrderItem } from '../types/Order';
import type { Category } from '../types/Category';
import type { CartItem } from '../types/CartItem';

// Mở (hoặc tạo mới) database file 'pe_mma301.db' trên thiết bị
const db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('pe_mma301.db');

// ===== KHỞI TẠO CÁC BẢNG =====
// Sử dụng CREATE TABLE IF NOT EXISTS để không lỗi khi app chạy lại
db.execSync(`
  -- Bảng người dùng: lưu thông tin đăng ký, đăng nhập và phân quyền
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  -- Bảng danh mục sản phẩm: phân loại sản phẩm theo nhóm
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL
  );

  -- Bảng sản phẩm: thông tin chi tiết về từng sản phẩm bán ra
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    categoryId INTEGER,           -- Liên kết tới bảng categories
    stock INTEGER DEFAULT 50,     -- Số lượng tồn kho
    rating REAL DEFAULT 4.0,      -- Điểm đánh giá trung bình
    createdAt TEXT DEFAULT (datetime('now')), -- Thời gian tạo sản phẩm
    FOREIGN KEY(categoryId) REFERENCES categories(id)
  );

  -- Bảng giỏ hàng: lưu sản phẩm mà mỗi user thêm vào giỏ
  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Bảng đơn hàng: mỗi khi checkout thành công sẽ tạo 1 bản ghi ở đây
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',           -- Trạng thái đơn hàng
    shippingAddress TEXT,                    -- Địa chỉ giao hàng
    paymentMethod TEXT DEFAULT 'Cash on Delivery', -- Phương thức thanh toán
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  -- Bảng chi tiết đơn hàng: danh sách sản phẩm trong mỗi đơn hàng
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER,
    productId INTEGER,
    productName TEXT,        -- Snapshot tên sản phẩm tại thời điểm mua
    quantity INTEGER,
    price REAL,              -- Snapshot giá tại thời điểm mua
    image TEXT,
    FOREIGN KEY(orderId) REFERENCES orders(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  );

  -- Bảng wishlist: danh sách sản phẩm yêu thích của mỗi user
  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    UNIQUE(userId, productId),   -- Mỗi user chỉ thêm 1 sản phẩm 1 lần
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Bảng lịch sử xem: lưu sản phẩm mà user đã xem gần đây
  CREATE TABLE IF NOT EXISTS recently_viewed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    viewedAt TEXT DEFAULT (datetime('now')), -- Thời gian xem
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// ===== MIGRATION - THÊM CỘT MỚI AN TOÀN =====
// Hàm tryAlter chạy ALTER TABLE bên trong try/catch để không bị lỗi nếu cột đã tồn tại
const tryAlter = (sql: string) => {
  try { db.runSync(sql); } catch (_) { /* cột đã tồn tại - bỏ qua lỗi */ }
};

// Thêm các cột mới cho bảng cũ (hỗ trợ migration từ phiên bản JS cũ)
tryAlter("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
tryAlter('ALTER TABLE cart_items ADD COLUMN userId INTEGER');
tryAlter('ALTER TABLE orders ADD COLUMN userId INTEGER');
tryAlter('ALTER TABLE products ADD COLUMN categoryId INTEGER');
tryAlter('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 50');
tryAlter('ALTER TABLE products ADD COLUMN rating REAL DEFAULT 4.0');
tryAlter("ALTER TABLE products ADD COLUMN createdAt TEXT DEFAULT (datetime('now'))");
tryAlter("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'");
tryAlter('ALTER TABLE orders ADD COLUMN shippingAddress TEXT');
tryAlter("ALTER TABLE orders ADD COLUMN paymentMethod TEXT DEFAULT 'Cash on Delivery'");
tryAlter('ALTER TABLE order_items ADD COLUMN image TEXT');

// ===== SEED DANH MỤC MẶC ĐỊNH =====
// Chỉ chạy khi bảng categories trống (lần đầu cài app)
const catCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
if (!catCount || catCount.count === 0) {
  // 8 danh mục mặc định: [tên danh mục, tên icon Ionicons]
  const categories: Array<[string, string]> = [
    ['Electronics', 'phone-portrait-outline'],
    ['Fashion', 'shirt-outline'],
    ['Home & Living', 'home-outline'],
    ['Food & Drinks', 'fast-food-outline'],
    ['Accessories', 'watch-outline'],
    ['Sports', 'fitness-outline'],
    ['Books', 'book-outline'],
    ['Beauty', 'sparkles-outline'],
  ];
  for (const [name, icon] of categories) {
    db.runSync('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon]);
  }
}

// Gán sản phẩm chưa có danh mục vào Electronics (id=1)
db.runSync('UPDATE products SET categoryId = 1 WHERE categoryId IS NULL');

// Đặt giá trị mặc định cho stock/rating nếu chưa có
db.runSync('UPDATE products SET stock = 50 WHERE stock IS NULL OR stock = 0');
db.runSync('UPDATE products SET rating = ROUND(3.5 + (ABS(RANDOM()) % 15) / 10.0, 1) WHERE rating IS NULL OR rating = 0');

// ===== TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH =====
// Email: admin@mma301.com, Password: admin123, Vai trò: admin
const adminExists = db.getFirstSync<{ id: number }>(
  "SELECT id FROM users WHERE LOWER(email) = 'admin@mma301.com'"
);
if (!adminExists) {
  db.runSync(
    'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@mma301.com', 'admin123', 'admin']
  );
}

// ===== SEED SẢN PHẨM MẪU =====
// Chỉ chạy khi bảng products trống (lần đầu cài app)
// Mỗi sản phẩm gồm: [tên, mô tả, giá, URL ảnh, mã danh mục, tồn kho, đánh giá]
const prodCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM products');
if (!prodCount || prodCount.count === 0) {
  const sampleProducts: Array<[string, string, number, string, number, number, number]> = [
    ['iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip, titanium design', 1199.99, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 1, 30, 4.8],
    ['MacBook Air M3', 'Ultra-thin laptop with Apple M3 chip, 15-inch Liquid Retina display', 1299.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 1, 20, 4.9],
    ['Nike Air Max', 'Classic running shoes with Air cushioning technology', 159.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 2, 100, 4.5],
    ['Leather Jacket', 'Premium genuine leather jacket with modern fit', 299.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 2, 25, 4.3],
    ['Smart LED Lamp', 'WiFi-enabled lamp with 16M colors and voice control', 49.99, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 3, 80, 4.2],
    ['Organic Coffee Beans', 'Single-origin Arabica beans from Colombia, 1kg bag', 24.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 4, 200, 4.7],
    ['Apple Watch Ultra', 'Rugged smartwatch with precision GPS and 36hr battery', 799.99, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400', 5, 40, 4.6],
    ['Yoga Mat Pro', 'Non-slip exercise mat with alignment lines, 6mm thick', 39.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 6, 150, 4.4],
    ['Best-Seller Novel', 'Award-winning fiction, hardcover edition', 19.99, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 7, 300, 4.1],
    ['Skincare Set', 'Complete skincare routine kit with 5 premium products', 89.99, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', 8, 60, 4.5],
    ['AirPods Pro 2', 'Active noise cancellation with adaptive transparency', 249.99, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400', 1, 55, 4.7],
    ['Sony WH-1000XM5', 'Industry-leading noise cancelling headphones', 349.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 35, 4.8],
  ];

  for (const [name, desc, price, image, catId, stock, rating] of sampleProducts) {
    db.runSync(
      'INSERT INTO products (name, description, price, image, categoryId, stock, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [name, desc, price, image, catId, stock, rating]
    );
  }
}

console.log('Database initialized successfully'); // Log xác nhận DB đã khởi tạo xong

// Export đối tượng database để các service import và sử dụng
export default db;

/**
 * Hàm khởi tạo database (gọi để đảm bảo file database.ts đã được import)
 * Thực tế các bảng đã được tạo ngay khi import file, hàm này chỉ để tương thích API cũ
 */
export const initDatabase = (): void => {
  console.log('initDatabase called (tables already exist)');
};
