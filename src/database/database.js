import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("pe_mma301.db");

// Initialize tables immediately at module level to avoid timing issues
db.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL 
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER,
    productId INTEGER,
    productName TEXT,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(orderId) REFERENCES orders(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  );
`);

console.log("Database initialized successfully");

export default db;

export const initDatabase = () => {
  console.log("initDatabase called (tables already exist)");
};
