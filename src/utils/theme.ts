/**
 * Bảng màu chủ đạo của ứng dụng - sử dụng Dark Theme
 * Tất cả màn hình và component đều tham chiếu từ đây để đảm bảo đồng bộ giao diện
 */
export const COLORS = {
  background: '#0F0F1A',      // Màu nền chính của ứng dụng (tối đen)
  card: '#1E1E30',            // Màu nền các thẻ/card
  cardHeader: '#13131F',      // Màu header của navigation bar
  primary: '#7C3AED',         // Màu chủ đạo tím (nút bấm, highlight)
  primaryLight: '#A78BFA',    // Màu tím nhạt (text link, icon active)
  primaryDark: '#5B21B6',     // Màu tím đậm (hover, pressed state)
  secondary: '#10B981',       // Màu xanh lá (thành công, còn hàng)
  secondaryDark: '#059669',   // Màu xanh đậm
  accent: '#F59E0B',          // Màu vàng nhấn mạnh (sao đánh giá, cảnh báo)
  accentDark: '#D97706',      // Màu vàng đậm
  danger: '#EF4444',          // Màu đỏ (xóa, lỗi, hết hàng)
  dangerLight: '#F87171',     // Màu đỏ nhạt
  dangerBg: '#2D1515',        // Màu nền cho badge nguy hiểm
  info: '#3B82F6',            // Màu xanh dương (thông tin)
  infoDark: '#1D4ED8',        // Màu xanh dương đậm
  pink: '#EC4899',            // Màu hồng (wishlist, yêu thích)
  pinkDark: '#BE185D',        // Màu hồng đậm
  indigo: '#6366F1',          // Màu chàm (icon analytics)
  indigoDark: '#4338CA',      // Màu chàm đậm
  text: '#F9FAFB',            // Màu chữ chính (trắng sáng)
  textSecondary: '#D1D5DB',   // Màu chữ phụ (xám nhạt)
  textMuted: '#9CA3AF',       // Màu chữ mờ (placeholder, label)
  textDim: '#6B7280',         // Màu chữ rất mờ
  textDark: '#4B5563',        // Màu chữ tối nhất (không hoạt động)
  border: '#2D2D45',          // Màu viền (border, separator)
  surface: '#111827',         // Màu bề mặt (input background)
  overlay: 'rgba(0,0,0,0.65)', // Màu lớp phủ (modal backdrop)
  glass: 'rgba(255,255,255,0.08)',       // Hiệu ứng kính mờ (glassmorphism) nhẹ
  glassStrong: 'rgba(255,255,255,0.18)', // Hiệu ứng kính mờ mạnh hơn
} as const;

/**
 * Các hiệu ứng bóng đổ (shadow) cho component
 * Dùng với StyleSheet để tạo chiều sâu cho card, nút bấm
 */
export const SHADOWS = {
  // Bóng thường cho các card
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8, // Android shadow level
  },
  // Bóng tím cho các nút chính (primary button)
  primary: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  // Bóng phát sáng mạnh (glow effect) cho các phần nổi bật
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

/**
 * Hệ thống kích thước chuẩn cho font size và border radius
 * Giúp đồng bộ kích thước xuyên suốt ứng dụng
 */
export const SIZES = {
  xs: 10,       // Font cực nhỏ (badge, caption)
  sm: 12,       // Font nhỏ (label phụ)
  md: 14,       // Font trung bình (body text)
  base: 16,     // Font cơ bản (nội dung chính)
  lg: 18,       // Font lớn (tiêu đề phụ)
  xl: 20,       // Font rất lớn (giá, số liệu)
  xxl: 24,      // Font cực lớn (tiêu đề màn hình)
  xxxl: 30,     // Font lớn nhất (tiêu đề chính, hero text)
  radius: {
    sm: 8,      // Bo tròn nhỏ (badge, chip)
    md: 12,     // Bo tròn trung bình (card, input)
    lg: 16,     // Bo tròn lớn (button, dialog)
    xl: 20,     // Bo tròn rất lớn (container)
    round: 99,  // Bo tròn hoàn toàn (avatar, dot)
  },
} as const;
