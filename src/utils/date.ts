// Shared date utilities
// Lưu ý: không thay đổi logic hiện tại, chỉ tách ra util để tái sử dụng.

/**
 * Trả về chuỗi ngày dạng YYYY-MM-DD, loại bỏ phần thời gian nếu có (ví dụ ISO 8601)
 */
export function toYMD(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const raw = String(dateStr).trim();
  const ymd = raw.includes('T') ? raw.split('T')[0] : raw; // YYYY-MM-DD
  return ymd;
}

/**
 * Định dạng ngày cho UI theo dạng DD/MM/YYYY.
 * Nếu không đúng định dạng YYYY-MM-DD thì trả nguyên chuỗi đã strip thời gian.
 */
export function formatDateOnly(dateStr: string | null | undefined): string {
  const ymd = toYMD(dateStr);
  const parts = ymd.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y && m && d) return `${d}/${m}/${y}`;
  }
  return ymd;
}
