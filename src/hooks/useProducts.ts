/**
 * HOOK useProducts - Quản lý việc tải danh sách sản phẩm với infinite scroll (phân trang vô hạn)
 * 
 * Tính năng:
 * - Tải sản phẩm theo trang (phân trang)
 * - Hỗ trợ tìm kiếm, lọc theo danh mục, sắp xếp theo giá
 * - refresh(): tải lại từ đầu
 * - loadMore(): tải thêm trang tiếp theo
 * - hasMore: còn trang tiếp để tải không
 * 
 * Sử dụng: const { products, loading, refresh, loadMore, hasMore } = useProducts({ search, categoryId });
 */

import { useState, useCallback } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/Product';

// Tùy chọn cho hook
interface UseProductsOptions {
  search?: string;                    // Từ khóa tìm kiếm
  categoryId?: number;                // Lọc theo danh mục
  sortOrder?: 'asc' | 'desc' | null;  // Sắp xếp giá
  pageSize?: number;                  // Số sản phẩm mỗi trang (mặc định 20)
}

export default function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);  // Danh sách sản phẩm đã tải
  const [loading, setLoading] = useState(false);             // Đang tải hay không
  const [page, setPage] = useState(0);                       // Trang hiện tại
  const [hasMore, setHasMore] = useState(true);              // Còn dữ liệu để tải tiếp không

  const pageSize = options.pageSize ?? 20;

  /**
   * Hàm tải sản phẩm chính
   * reset = true: tải lại từ đầu (khi thay đổi bộ lọc/tìm kiếm)
   * reset = false: tải thêm trang kế tiếp (infinite scroll)
   */
  const loadProducts = useCallback(
    (reset = false) => {
      const currentPage = reset ? 0 : page;
      setLoading(true);

      const result = productService.getAll({
        search: options.search,
        categoryId: options.categoryId,
        sortOrder: options.sortOrder,
        limit: pageSize,
        offset: currentPage * pageSize,
      });

      if (reset) {
        setProducts(result);
        setPage(1);
      } else {
        setProducts((prev) => [...prev, ...result]);
        setPage((p) => p + 1);
      }

      setHasMore(result.length >= pageSize);
      setLoading(false);
    },
    [options.search, options.categoryId, options.sortOrder, page, pageSize]
  );

  /** Tải lại từ đầu - gọi khi pull-to-refresh hoặc thay đổi bộ lọc */
  const refresh = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  /** Tải thêm trang kế tiếp - gọi khi scroll gần đáy danh sách */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(false);
    }
  }, [loading, hasMore, loadProducts]);

  return { products, loading, refresh, loadMore, hasMore };
}
