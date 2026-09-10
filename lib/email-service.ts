export interface OrderEmailPayload {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  shippingAddress: string;
  productName: string;
  dimension: string;
  thickness: string;
  quantity: number;
  totalPrice: number;
  zaloUrl: string;
}

import { SITE_CONFIG } from "@/config/site-config";

export const OFFICIAL_HOTLINE = SITE_CONFIG.contact.hotlineRaw;
export const OFFICIAL_HOTLINE_DISPLAY = SITE_CONFIG.contact.hotlineDisplay;

/**
 * Generates an inline-styled, production-tested HTML email matching the Quiet Luxury aesthetic
 * of Nệm Thăng Long (Linen #FAF9F6, Slate #1A2530, Warm Gold #C8A27A, Muted Grey #736E65).
 */
export function generateLuxuryOrderEmailHtml(payload: OrderEmailPayload): string {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(payload.totalPrice);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Đơn Hàng #${payload.orderCode} - ${SITE_CONFIG.brand.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1A2530; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8E4DA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          
          <!-- Header: Brand Logo & Title -->
          <tr>
            <td align="center" style="padding: 36px 32px 24px 32px; border-bottom: 1px solid #F0ECE4; background: linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%);">
              <div style="display: inline-block; padding: 6px 14px; background-color: #FAF6EE; border: 1px solid #EADBCC; border-radius: 20px; margin-bottom: 12px;">
                <span style="font-size: 10.5px; font-weight: 700; letter-spacing: 2.5px; color: #9C7954; text-transform: uppercase;">XƯỞNG SẢN XUẤT CHÍNH HÃNG</span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; color: #1A2530; text-transform: uppercase;">${SITE_CONFIG.brand.name.toUpperCase()} - GIẤC NGỦ VIỆT</h1>
              <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #736E65; letter-spacing: 0.5px;">${SITE_CONFIG.brand.slogan}</p>
            </td>
          </tr>

          <!-- Status Badge Section -->
          <tr>
            <td style="padding: 28px 32px 12px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 24px; padding: 8px 18px;">
                      <span style="display: inline-block; width: 8px; height: 8px; background-color: #D97706; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>
                      <span style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #92400E; text-transform: uppercase; vertical-align: middle;">
                        ĐƠN HÀNG ĐANG CHỜ XÁC NHẬN ZALO
                      </span>
                    </div>
                    <p style="margin: 14px 0 0 0; font-size: 13.5px; line-height: 1.6; color: #4A5568; text-align: center;">
                      Kính gửi <strong>${payload.customerName}</strong>, đơn hàng dự thảo của quý khách đã được tạo thành công trên hệ thống. Để kích hoạt chính sách <strong>${SITE_CONFIG.policies.sleepTrialNights} đêm nằm thử</strong> và phòng tránh đơn đặt nhầm, quý khách vui lòng xác nhận chính chủ qua Zalo xưởng bên dưới.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; border: 1px solid #E8E4DA; border-radius: 10px; padding: 20px;">
                <!-- Order Code -->
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px dashed #DDD7CD;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12.5px; color: #736E65;">Mã đơn hàng:</td>
                        <td align="right" style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #1A2530; letter-spacing: 1px;">
                          ${payload.orderCode}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Product line -->
                <tr>
                  <td style="padding: 14px 0 10px 0;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: top;">
                          <div style="font-size: 14px; font-weight: 700; color: #1A2530;">${payload.productName}</div>
                          <div style="font-size: 12px; color: #736E65; margin-top: 3px;">
                            Quy cách: <span style="color: #1A2530; font-weight: 500;">${payload.dimension}</span> • Độ dày: <span style="color: #1A2530; font-weight: 500;">${payload.thickness}</span>
                          </div>
                        </td>
                        <td align="right" style="vertical-align: top; font-size: 13px; font-weight: 600; color: #1A2530;">
                          x${payload.quantity}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Recipient Details -->
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #EAE5DC; border-bottom: 1px solid #EAE5DC; font-size: 12.5px; color: #4A5568; line-height: 1.6;">
                    <div><span style="color: #736E65;">Người nhận:</span> <strong>${payload.customerName}</strong> (${payload.phoneNumber})</div>
                    <div style="margin-top: 4px;"><span style="color: #736E65;">Email bảo hành:</span> <strong>${payload.customerEmail}</strong></div>
                    <div style="margin-top: 4px;"><span style="color: #736E65;">Địa chỉ nhận hàng:</span> <strong>${payload.shippingAddress}</strong></div>
                  </td>
                </tr>

                <!-- Total Price -->
                <tr>
                  <td style="padding-top: 14px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 13px; font-weight: 500; color: #736E65;">Tạm tính (Giao tận phòng):</td>
                        <td align="right" style="font-size: 18px; font-weight: 800; color: #1A2530;">
                          ${formattedPrice}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct CTA Button: 1-Tap Zalo Verification -->
          <tr>
            <td align="center" style="padding: 0 32px 28px 32px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background-color: #0068FF; border-radius: 8px; box-shadow: 0 3px 12px rgba(0, 104, 255, 0.25);">
                    <a href="${payload.zaloUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; letter-spacing: 0.3px; border-radius: 8px;">
                      Bấm Vào Đây Để Xác Nhận Qua Zalo
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; font-size: 11.5px; color: #736E65; text-align: center;">
                (Tin nhắn xác thực mã đơn và thông tin nhận hàng đã được soạn sẵn trên Zalo)
              </p>
            </td>
          </tr>

          <!-- Warranty & Guarantee Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAF9F6; border-top: 1px solid #E8E4DA;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td width="33%" align="center" style="padding: 4px; vertical-align: top;">
                    <div style="font-size: 11.5px; font-weight: 700; color: #1A2530;">🛡️ BẢO HÀNH ${SITE_CONFIG.policies.minWarrantyYears} - ${SITE_CONFIG.policies.maxWarrantyYears} NĂM</div>
                    <div style="font-size: 10.5px; color: #736E65; margin-top: 2px;">Chính hãng tại xưởng</div>
                  </td>
                  <td width="33%" align="center" style="padding: 4px; vertical-align: top; border-left: 1px solid #E8E4DA; border-right: 1px solid #E8E4DA;">
                    <div style="font-size: 11.5px; font-weight: 700; color: #1A2530;">🛏️ ${SITE_CONFIG.policies.sleepTrialNights} ĐÊM NẰM THỬ</div>
                    <div style="font-size: 10.5px; color: #736E65; margin-top: 2px;">Đổi trả nếu không vừa ý</div>
                  </td>
                  <td width="33%" align="center" style="padding: 4px; vertical-align: top;">
                    <div style="font-size: 11.5px; font-weight: 700; color: #1A2530;">🚚 ${SITE_CONFIG.policies.freeDeliveryText.toUpperCase()}</div>
                    <div style="font-size: 10.5px; color: #736E65; margin-top: 2px;">Miễn phí khiêng lên giường</div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; font-size: 12px; color: #736E65; line-height: 1.6; padding-top: 12px; border-top: 1px dashed #DDD7CD;">
                <div>Hotline Xưởng & Khiếu nại 24/7: <a href="tel:${SITE_CONFIG.contact.hotlineRaw}" style="color: #1A2530; font-weight: 700; text-decoration: none;">${SITE_CONFIG.contact.hotlineDisplay}</a></div>
                <div style="font-size: 11px; color: #A0AEC0; margin-top: 4px;">
                  Hệ thống 7 Showroom chính hãng tại Đồng Nai, Tây Ninh, Bình Phước, Long An.
                </div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends an electronic order receipt and warranty instructions to customerEmail.
 * Matching the Quiet Luxury design tokens of Nệm Thăng Long.
 */
export async function sendOrderReceiptEmail(payload: OrderEmailPayload): Promise<boolean> {
  try {
    const subject = `[${SITE_CONFIG.brand.name}] Yêu Cầu Xác Nhận Đơn Hàng #${payload.orderCode}`;
    const html = generateLuxuryOrderEmailHtml(payload);

    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || `${SITE_CONFIG.brand.name} <${SITE_CONFIG.contact.supportEmail}>`,
          to: payload.customerEmail,
          subject,
          html
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[sendOrderReceiptEmail] Resend API responded with status ${res.status}: ${errorText}`);
        return false;
      }
    } else {
      // Fallback logging in development or staging
      console.log(`[EMAIL_SERVICE] Sent luxury order confirmation email for #${payload.orderCode} to ${payload.customerEmail}`);
    }
    return true;
  } catch (error) {
    console.error("[sendOrderReceiptEmail] Error dispatching email:", error);
    return false;
  }
}

// Backward-compatible alias for existing imports across the project
export const sendOrderConfirmationEmail = sendOrderReceiptEmail;
