export function formatVnd(value: number | null | undefined) {
  if (value === null || value === undefined) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDimension(value: number) {
  return value + "cm";
}
