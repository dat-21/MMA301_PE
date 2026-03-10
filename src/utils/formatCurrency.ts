/**
 * Hàm định dạng số tiền thành chuỗi tiền tệ USD (VD: 29.99 => "$29.99")
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi tiền tệ với ký hiệu $ và 2 chữ số thập phân
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Hàm định dạng chuỗi ISO date thành dạng dễ đọc (VD: "Mar 10, 2026, 02:30 PM")
 * @param isoString - Chuỗi ngày giờ ISO (từ database)
 * @returns Chuỗi ngày giờ đã định dạng theo locale tiếng Anh
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Hàm lấy chữ cái đầu của tên để hiển thị avatar (VD: "Nguyen Van A" => "NV")
 * @param name - Họ tên đầy đủ
 * @returns Tối đa 2 chữ cái đầu in hoa
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
