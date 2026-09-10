import { SITE_CONFIG } from "@/config/site-config";

/** Sinh deep-link Zalo 1-chạm với nội dung soạn sẵn */
export function createZaloOrderLink(orderCode: string, customerName: string, details: string): string {
  const message =
    `[NỆM THẮNG LONG] XÁC NHẬN ĐƠN HÀNG\n` +
    `• Mã đơn: ${orderCode}\n` +
    `• Khách hàng: ${customerName}\n` +
    `• Thông tin: ${details}\n\n` +
    `Tôi gửi tin nhắn này để xác nhận đặt hàng. Shop kiểm tra kho và xếp xe giao giúp tôi nhé!`;
  return `https://zalo.me/${SITE_CONFIG.contact.zaloPhone}?text=${encodeURIComponent(message)}`;
}

/** Trả về chuỗi `tel:` chuẩn */
export function getHotlineTelLink(): string {
  return `tel:${SITE_CONFIG.contact.hotlineRaw}`;
}

/** Trả về chuỗi `mailto:` chuẩn */
export function getSupportMailtoLink(): string {
  return `mailto:${SITE_CONFIG.contact.supportEmail}`;
}
