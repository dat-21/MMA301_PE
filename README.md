# PE_MMA301 - Product Management App

Ứng dụng quản lý sản phẩm (Product Management) được xây dựng bằng **React Native** với **Expo SDK 54**, sử dụng **SQLite** làm cơ sở dữ liệu local.

---

## 📱 Tổng quan

Ứng dụng cho phép người dùng đăng ký, đăng nhập, quản lý sản phẩm (CRUD), thêm vào giỏ hàng, checkout đặt hàng, và xem thống kê doanh thu.

---

## 🛠 Tech Stack

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | 54.0.33 | Build & dev toolchain |
| React | 19.1.0 | UI library |
| React Navigation (Native Stack) | 7.x | Navigation |
| Expo SQLite | 16.0.10 | Database local |
| AsyncStorage | 2.2.0 | Lưu session user |
| Expo Image Picker | 17.0.10 | Chọn ảnh từ thư viện |
| Expo Vector Icons (Ionicons) | có sẵn | Icons |

---

## 📂 Cấu trúc dự án

```
PE_MMA301/
├── App.js                          # Entry point - wrap AuthProvider + AppNavigator
├── index.js                        # registerRootComponent
├── app.json                        # Expo config
├── package.json
├── assets/                         # Icons, splash screen
└── src/
    ├── components/
    │   ├── Toast.js                # Custom toast notification (thay thế Alert)
    │   └── ConfirmDialog.js        # Custom confirm dialog (thay thế Alert.alert)
    ├── context/
    │   └── AuthContext.js          # Auth state management (login/logout/user)
    ├── database/
    │   └── database.js             # SQLite init + tạo tables
    ├── hooks/
    │   └── useToast.js             # Hook quản lý toast state
    ├── navigation/
    │   └── AppNavigator.js         # Stack Navigator (auth flow + main flow)
    └── screens/
        ├── LoginScreen.js          # Đăng nhập
        ├── RegisterScreen.js       # Đăng ký
        ├── HomeScreen.js           # Trang chủ (menu chính)
        ├── ProductListScreen.js    # Danh sách sản phẩm (search, sort, CRUD)
        ├── ProductDetailScreen.js  # Chi tiết sản phẩm
        ├── AddEditProductScreen.js # Thêm/sửa sản phẩm
        ├── CartScreen.js           # Giỏ hàng
        └── RevenueScreen.js        # Thống kê doanh thu
```

---

## 🗄 Database Schema (SQLite)

File: `src/database/database.js` — Database name: `pe_mma301.db`

### Bảng `users`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INTEGER (PK, AUTO) | ID người dùng |
| fullName | TEXT NOT NULL | Họ tên |
| email | TEXT UNIQUE NOT NULL | Email (unique) |
| password | TEXT NOT NULL | Mật khẩu |

### Bảng `products`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INTEGER (PK, AUTO) | ID sản phẩm |
| name | TEXT NOT NULL | Tên sản phẩm |
| description | TEXT | Mô tả |
| price | REAL NOT NULL | Giá |
| image | TEXT | URL ảnh |

### Bảng `cart_items`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INTEGER (PK, AUTO) | ID item |
| productId | INTEGER (FK → products.id) | Sản phẩm |
| quantity | INTEGER DEFAULT 1 | Số lượng |

### Bảng `orders`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INTEGER (PK, AUTO) | ID đơn hàng |
| total | REAL NOT NULL | Tổng tiền |
| createdAt | TEXT NOT NULL | Thời gian tạo (ISO) |

### Bảng `order_items`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INTEGER (PK, AUTO) | ID item |
| orderId | INTEGER (FK → orders.id) | Đơn hàng |
| productId | INTEGER (FK → products.id) | Sản phẩm |
| productName | TEXT | Tên SP (snapshot) |
| quantity | INTEGER | Số lượng |
| price | REAL | Giá lúc mua |

---

## 🔐 Authentication Flow

```
AuthContext (React Context API + AsyncStorage)
│
├── Chưa login (user == null)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── Đã login (user != null)
    ├── HomeScreen
    ├── ProductListScreen
    ├── ProductDetailScreen
    ├── AddEditProductScreen
    ├── CartScreen
    └── RevenueScreen
```

- **AuthContext** quản lý state `user`, `loading`, `login()`, `logout()`
- Khi app khởi động, tự load user từ **AsyncStorage** (persist session)
- Login: query SQLite → so sánh email/password → lưu vào AsyncStorage
- Logout: xóa user khỏi AsyncStorage → set user = null
- **Remember Me**: lưu email/password vào AsyncStorage riêng

---

## 📄 Chi tiết từng Screen

### 1. LoginScreen
- Form: Email + Password
- Remember Me (Switch) — lưu credentials vào AsyncStorage
- Show/Hide password
- Validate: kiểm tra email + password không rỗng
- Chuyển đến RegisterScreen

### 2. RegisterScreen
- Form: Full Name + Email + Password + Confirm Password
- Validate: email format, password ≥ 3 ký tự, passwords match
- Insert vào SQLite `users` table
- Sau đăng ký → navigate về LoginScreen

### 3. HomeScreen
- Hiển thị avatar (initials), tên user, email
- Cart badge (số lượng items trong giỏ)
- Menu grid 4 ô: Products, Cart, Add Product, Revenue
- Animated cards (stagger animation)
- Nút Logout với ConfirmDialog

### 4. ProductListScreen
- Danh sách sản phẩm từ SQLite
- **Search** theo tên (LIKE query)
- **Sort** giá: Low→High / High→Low
- Mỗi product card: Ảnh, Tên, Mô tả, Giá
- Actions: Add to Cart, Edit, Delete
- **FAB** (Floating Action Button) thêm sản phẩm
- Delete dùng ConfirmDialog

### 5. ProductDetailScreen
- Hiển thị đầy đủ: Ảnh, Tên, Giá, Badge "In Stock", Description
- Actions: Add to Cart, Edit, Delete
- Delete dùng ConfirmDialog

### 6. AddEditProductScreen
- Chế độ Add / Edit (detect qua `route.params?.product`)
- Form: Product Name*, Description, Price*, Image URL
- **Image Picker** (expo-image-picker) — chọn ảnh từ thư viện
- Preview ảnh
- Validate: name required, price > 0

### 7. CartScreen
- Danh sách items (JOIN cart_items + products)
- Tăng/giảm số lượng, xóa item
- Tổng tiền + tổng items
- **Clear All** với ConfirmDialog
- **Checkout**: tạo order + order_items → xóa cart
- Empty state → nút "Browse Products"

### 8. RevenueScreen
- Lọc theo: All Time / Today / Month / Year
- Tổng doanh thu + số đơn hàng
- Danh sách orders (expandable → xem order items)
- Hiển thị ngày giờ, tổng tiền mỗi đơn

---

## 🎨 UI/UX Features

### Theme
- **Dark theme** toàn app: background `#0F0F1A`, card `#1E1E30`
- Accent colors: Purple `#7C3AED`, Green `#10B981`, Amber `#F59E0B`, Pink `#EC4899`

### Custom Components

#### Toast Notification (`src/components/Toast.js`)
- Thay thế hoàn toàn `Alert.alert()` cho thông báo
- 4 loại: `success` (xanh lá), `error` (đỏ), `warning` (vàng), `info` (xanh dương)
- Slide animation từ trên xuống (spring)
- Tự ẩn sau 2.5s, có nút đóng
- Sử dụng qua hook `useToast()`:
  ```js
  const { toast, showToast, hideToast } = useToast();
  showToast("Thành công!", "success");
  ```

#### ConfirmDialog (`src/components/ConfirmDialog.js`)
- Thay thế `Alert.alert()` có buttons confirm/cancel
- Modal với scale animation
- 4 loại: `danger`, `warning`, `info`, `success`
- Icon + màu tương ứng

### Animations
- **Fade + Slide** khi vào Login/Register
- **Stagger animation** cho menu cards ở HomeScreen
- **Spring animation** cho Toast
- **Scale animation** cho ConfirmDialog

### UX
- `Keyboard.dismiss()` khi submit form
- Delay navigation sau toast success (user thấy thông báo trước khi chuyển trang)
- Input focus highlighting (đổi border color)
- Show/Hide password toggle
- Search real-time trên ProductList

---

## 🚀 Cách chạy

### Yêu cầu
- Node.js ≥ 18
- Expo CLI (`npx expo`)
- Android Studio (emulator) hoặc điện thoại có Expo Go

### Cài đặt

```bash
cd PE_MMA301
npm install
```

### Chạy app

```bash
npm start
# hoặc
npx expo start
```

- Nhấn `a` để mở trên Android emulator
- Nhấn `i` để mở trên iOS simulator
- Scan QR code bằng Expo Go trên điện thoại

---

## 📋 Luồng sử dụng chính

```
1. Mở app → LoginScreen
2. Chưa có tài khoản → Register → Tạo account
3. Login → HomeScreen
4. Products → Xem danh sách → Thêm/Sửa/Xóa sản phẩm
5. Add to Cart → CartScreen → Checkout
6. Revenue → Xem thống kê doanh thu
7. Logout
```

---

## 📌 Lưu ý

- Database là **SQLite local** — dữ liệu chỉ lưu trên thiết bị
- Password lưu **plain text** (chỉ dùng cho PE, không dùng production)
- Ảnh sản phẩm hỗ trợ: URL online hoặc ảnh từ thư viện thiết bị (expo-image-picker)
- App hỗ trợ Android & iOS
