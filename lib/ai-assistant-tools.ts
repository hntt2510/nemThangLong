import { getPrisma } from "@/lib/db";
import { getProductTechSpec } from "@/lib/product-specs";
import { SHOWROOMS_DATA } from "@/lib/showrooms";
import { getProductEffectivePrice } from "@/lib/product-recommendations";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import { SITE_CONFIG } from "@/config/site-config";

export const HCM_HOTLINE = SITE_CONFIG.contact.hotlineRaw;
export const HCM_HOTLINE_DISPLAY = SITE_CONFIG.contact.hotlineDisplay;

export const KIRA_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "query_catalog_or_showrooms",
      description:
        "Tra cứu thông số kỹ thuật đệm, bảng giá theo kích thước/độ dày, độ êm/cứng, chứng chỉ y khoa, hoặc tìm danh sách showroom gần nhất từ hệ thống.",
      parameters: {
        type: "object",
        properties: {
          queryType: {
            type: "string",
            enum: ["product_specs", "price_lookup", "showroom_locator"],
            description: "Loại tra cứu: product_specs (thông số kỹ thuật), price_lookup (tra giá theo kích thước), showroom_locator (tìm showroom)"
          },
          productSlug: {
            type: "string",
            description:
              "Mã định danh sản phẩm: america, classic, hoat-tinh, memory-foam, cao-su-thien-nhien, khach-san"
          },
          dimension: {
            type: "string",
            description:
              "Kích thước đệm (ví dụ: 1m0x2m, 1m2x2m, 1m4x2m, 1m6x2m, 1m8x2m, 160x200cm)"
          },
          thickness: {
            type: "string",
            description: "Độ dày đệm (ví dụ: 10cm, 15cm, 20cm)"
          },
          province: {
            type: "string",
            description:
              "Tỉnh/thành showroom cần tìm (Đồng Nai, Tây Ninh, Bình Phước, Long An)"
          }
        },
        required: ["queryType"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_draft_order",
      description:
        "Tạo đơn hàng dự thảo và xuất thẻ xác thực Zalo 1-Chạm chống đơn ảo/giả mạo. BẮT BUỘC người dùng phải cung cấp đủ họ tên, số điện thoại (10 số) và email trước khi gọi tool này.",
      parameters: {
        type: "object",
        properties: {
          customerName: { type: "string", description: "Họ và tên người nhận hàng" },
          phoneNumber: {
            type: "string",
            description: "Số điện thoại người nhận (10 chữ số, bắt đầu bằng số 0)"
          },
          customerEmail: {
            type: "string",
            description: "Địa chỉ email chính xác để gửi hóa đơn và phiếu bảo hành điện tử"
          },
          shippingAddress: {
            type: "string",
            description: "Địa chỉ nhận hàng chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành)"
          },
          productSlug: {
            type: "string",
            description: "Slug sản phẩm (america, classic, hoat-tinh, memory-foam, cao-su-thien-nhien, khach-san)"
          },
          productName: { type: "string", description: "Tên đầy đủ của sản phẩm nệm" },
          dimension: {
            type: "string",
            description: "Kích thước đệm (ví dụ: 1m6x2m, 1m8x2m, 160x200cm)"
          },
          thickness: {
            type: "string",
            description: "Độ dày đệm (ví dụ: 10cm, 15cm, 20cm)"
          },
          quantity: { type: "number", default: 1, description: "Số lượng tấm đệm đặt mua" },
          notes: {
            type: "string",
            description: "Ghi chú thêm (thời gian giao thuận tiện, tầng lầu, cầu thang hẹp...)"
          }
        },
        required: [
          "customerName",
          "phoneNumber",
          "customerEmail",
          "shippingAddress",
          "productSlug",
          "productName",
          "dimension",
          "thickness"
        ]
      }
    }
  }
];

export function parseWidthFromString(dim?: string): number {
  if (!dim) return 160;
  const s = dim.toLowerCase().replace(/\s/g, "");
  if (s.includes("1m8") || s.includes("180")) return 180;
  if (s.includes("1m6") || s.includes("160")) return 160;
  if (s.includes("1m4") || s.includes("140")) return 140;
  if (s.includes("1m2") || s.includes("120")) return 120;
  if (s.includes("1m0") || s.includes("100") || s.includes("1m")) return 100;
  return 160;
}

export function parseThicknessFromString(thick?: string): number {
  if (!thick) return 10;
  const match = thick.match(/\d+/);
  if (match) {
    const val = parseInt(match[0], 10);
    if (val >= 18) return 20;
    if (val >= 13) return 15;
    return 10;
  }
  return 10;
}

/**
 * Executes query_catalog_or_showrooms against Prisma and tech specs database
 */
export async function executeCatalogOrShowroomsQuery(args: {
  queryType: "product_specs" | "price_lookup" | "showroom_locator";
  productSlug?: string;
  dimension?: string;
  thickness?: string;
  province?: string;
}) {
  let prisma;
  try {
    prisma = getPrisma();
  } catch {
    prisma = null;
  }

  if (args.queryType === "showroom_locator") {
    const provinceQuery = args.province?.trim().toLowerCase();
    let results = SHOWROOMS_DATA;
    if (provinceQuery) {
      results = SHOWROOMS_DATA.filter(
        (s) =>
          s.province.toLowerCase().includes(provinceQuery) ||
          s.address.toLowerCase().includes(provinceQuery)
      );
      if (results.length === 0) {
        results = SHOWROOMS_DATA;
      }
    }

    return {
      totalShowrooms: results.length,
      showrooms: results.map((s) => ({
        code: s.code,
        name: s.name,
        province: s.province,
        address: s.address,
        hours: s.hours,
        phone: s.phone || SITE_CONFIG.contact.hotlineDisplay,
        landmark: s.landmark || "Tuyến đường trung tâm thuận tiện đỗ xe",
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`
      })),
      hotline: SITE_CONFIG.contact.hotlineDisplay,
      policy: `Trải nghiệm ${SITE_CONFIG.policies.sleepTrialNights} đêm nằm thử tại nhà, đổi trả nếu không phù hợp độ êm.`
    };
  }

  if (args.queryType === "product_specs") {
    const slug = args.productSlug || "classic";
    const spec = getProductTechSpec(slug);

    return {
      productSlug: slug,
      brand: spec.brand,
      origin: spec.origin,
      coreMaterial: spec.coreMaterial,
      coverMaterial: spec.coverMaterial,
      firmnessIndex: spec.firmnessIndex,
      dimensions: spec.dimensions,
      thicknessOptions: spec.thicknessOptions,
      ventilationTech: spec.ventilationTech,
      certifications: spec.certifications,
      warrantyYears: spec.warrantyYears,
      spineSupportRating: spec.spineSupportRating,
      idealFor: spec.idealFor,
      washableCover: spec.washableCover
    };
  }

  if (args.queryType === "price_lookup") {
    const slug = args.productSlug || "classic";
    const width = parseWidthFromString(args.dimension);
    const thickness = parseThicknessFromString(args.thickness);

    let variantPrice: number | null = null;
    let sku = `NTL-${slug.toUpperCase()}-${width}X200-${thickness}`;
    let stock = 10;

    if (prisma) {
      try {
        const v = await prisma.productVariant.findFirst({
          where: {
            product: { slug: { contains: slug.replace("nem-", "").replace("-thang-long", "") } },
            width,
            thickness,
            active: true
          }
        });
        if (v && v.price) {
          variantPrice = v.price;
          sku = v.sku;
          stock = v.stock;
        }
      } catch {
        // Prisma fallback
      }
    }

    if (!variantPrice) {
      const base = getProductEffectivePrice({ slug });
      const sizeMultiplier = width === 180 ? 1.25 : width === 160 ? 1.15 : width === 140 ? 1.05 : 1.0;
      const thickMultiplier = thickness === 20 ? 1.2 : thickness === 15 ? 1.1 : 1.0;
      variantPrice = Math.round((base * sizeMultiplier * thickMultiplier) / 10000) * 10000;
    }

    return {
      productSlug: slug,
      width,
      length: 200,
      thickness,
      formattedDimension: `${width}x200cm`,
      formattedThickness: `${thickness}cm`,
      unitPrice: variantPrice,
      formattedPrice: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(variantPrice),
      sku,
      inStock: stock > 0,
      deliveryNote: "Miễn phí giao tận phòng, hỗ trợ đặt lên giường và kiểm tra nệm trước khi thanh toán."
    };
  }

  return { error: "Không xác định được loại truy vấn yêu cầu." };
}

export interface DraftOrderResult {
  success: boolean;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  customerEmail: string;
  shippingAddress: string;
  productSlug: string;
  productName: string;
  dimension: string;
  thickness: string;
  quantity: number;
  unitPrice: number;
  formattedUnitPrice: string;
  totalAmount: number;
  formattedTotalAmount: string;
  notes: string;
  zaloUrl: string;
  hotline: string;
  verificationStatus: "PENDING_ZALO_VERIFICATION";
  orderSummaryMessage: string;
}

/**
 * Executes create_draft_order with Anti-Fraud 1-Tap Zalo Verification Gate
 */
export async function executeCreateDraftOrder(args: {
  customerName: string;
  phoneNumber: string;
  customerEmail: string;
  shippingAddress: string;
  productSlug: string;
  productName: string;
  dimension: string;
  thickness: string;
  quantity?: number;
  notes?: string;
}): Promise<DraftOrderResult> {
  // 1. Strict Validation Check
  if (!args.customerName?.trim()) {
    throw new Error("Vui lòng cung cấp họ và tên người nhận hàng để tạo đơn dự thảo.");
  }

  const phone = args.phoneNumber?.replace(/\s/g, "");
  if (!phone || !/^0\d{9}$/.test(phone)) {
    throw new Error("Số điện thoại không hợp lệ. Vui lòng cung cấp đúng 10 chữ số bắt đầu bằng 0 (ví dụ: 0911251004).");
  }

  const email = args.customerEmail?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email không hợp lệ. Xưởng nệm cần email chính xác để gửi hóa đơn và phiếu bảo hành điện tử 10-15 năm.");
  }

  if (!args.shippingAddress?.trim()) {
    throw new Error("Vui lòng cung cấp địa chỉ nhận hàng chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành).");
  }

  // 2. Parse dimensions & calculate pricing
  const width = parseWidthFromString(args.dimension);
  const thickness = parseThicknessFromString(args.thickness);
  const qty = Math.max(1, args.quantity || 1);

  let unitPrice = 0;
  let prisma;
  try {
    prisma = getPrisma();
  } catch {
    prisma = null;
  }

  let dbVariant: { id: string; sku: string; price: number | null } | null = null;
  if (prisma) {
    try {
      const dbProduct = await prisma.product.findFirst({
        where: { slug: { contains: args.productSlug.replace("nem-", "").replace("-thang-long", "") } },
        include: { variants: true }
      });
      if (dbProduct && dbProduct.variants) {
        const matched = dbProduct.variants.find(
          (v: { width: number; thickness: number; active: boolean }) => v.width === width && v.thickness === thickness && v.active
        );
        if (matched) {
          dbVariant = matched;
          if (matched.price) {
            unitPrice = matched.price;
          }
        }
      }
    } catch {
      // Ignore DB errors during lookup
    }
  }

  if (!unitPrice) {
    const base = getProductEffectivePrice({ slug: args.productSlug });
    const sizeMultiplier = width === 180 ? 1.25 : width === 160 ? 1.15 : width === 140 ? 1.05 : 1.0;
    const thickMultiplier = thickness === 20 ? 1.2 : thickness === 15 ? 1.1 : 1.0;
    unitPrice = Math.round((base * sizeMultiplier * thickMultiplier) / 10000) * 10000;
  }

  const totalAmount = unitPrice * qty;
  const orderCode = `NTL-${Math.floor(100000 + Math.random() * 900000)}`;
  const formattedUnitPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(unitPrice);
  const formattedTotalAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount);

  // 3. Construct 1-Tap Zalo Verification URL with prefilled text
  const zaloMessage = [
    `Xác nhận đơn hàng Nệm Thắng Long:`,
    `- Mã đơn: ${orderCode}`,
    `- Khách hàng: ${args.customerName.trim()} - ${phone}`,
    `- Email: ${email}`,
    `- Sản phẩm: ${args.productName}`,
    `- Kích thước: ${width}x200cm, độ dày ${thickness}cm`,
    `- Số lượng: ${qty}`,
    `- Địa chỉ nhận: ${args.shippingAddress.trim()}`,
    `- Tạm tính: ${formattedTotalAmount}`,
    `Tôi xác nhận đặt hàng nệm chính hãng và muốn nhân viên tư vấn gọi lại xác thực lịch giao tận phòng!`
  ].join("\n");

  const zaloUrl = `https://zalo.me/${SITE_CONFIG.contact.hotlineRaw}?text=${encodeURIComponent(zaloMessage)}`;

  // 4. Record to Database if Prisma is available and we have a valid variant
  if (prisma && dbVariant) {
    try {
      await prisma.order.create({
        data: {
          code: orderCode,
          customerName: args.customerName.trim(),
          guestEmail: email,
          customerPhone: phone,
          shippingAddress: {
            line1: args.shippingAddress.trim(),
            notes: args.notes?.trim() || "",
            zaloVerificationStatus: "PENDING_ZALO_VERIFICATION",
            verificationMethod: "ZALO_1TAP"
          },
          subtotal: totalAmount,
          shippingFee: 0,
          total: totalAmount,
          paymentMethod: "COD",
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: [
              {
                variantId: dbVariant.id,
                productName: args.productName,
                sku: dbVariant.sku || `NTL-${args.productSlug}-${width}X200-${thickness}`,
                width,
                length: 200,
                thickness,
                quantity: qty,
                unitPrice
              }
            ]
          }
        }
      });
    } catch (e) {
      console.warn("[executeCreateDraftOrder] Prisma draft order create error (non-fatal):", e);
    }
  }

  // 5. Fire-and-forget confirmation email
  sendOrderConfirmationEmail({
    orderCode,
    customerName: args.customerName.trim(),
    customerEmail: email,
    phoneNumber: phone,
    shippingAddress: args.shippingAddress.trim(),
    productName: args.productName,
    dimension: `${width}x200cm`,
    thickness: `${thickness}cm`,
    quantity: qty,
    totalPrice: totalAmount,
    zaloUrl
  }).catch((err) => console.warn("[executeCreateDraftOrder] sendOrderConfirmationEmail err:", err));

  return {
    success: true,
    orderCode,
    customerName: args.customerName.trim(),
    phoneNumber: phone,
    customerEmail: email,
    shippingAddress: args.shippingAddress.trim(),
    productSlug: args.productSlug,
    productName: args.productName,
    dimension: `${width}x200cm`,
    thickness: `${thickness}cm`,
    quantity: qty,
    unitPrice,
    formattedUnitPrice,
    totalAmount,
    formattedTotalAmount,
    notes: args.notes?.trim() || "",
    zaloUrl,
    hotline: HCM_HOTLINE_DISPLAY,
    verificationStatus: "PENDING_ZALO_VERIFICATION",
    orderSummaryMessage: `Đơn hàng dự thảo #${orderCode} đã được lập thành công trên hệ thống. Để chống đơn đặt nhầm/giả mạo và kích hoạt ưu đãi giao tận phòng miễn phí, quý khách vui lòng bấm nút bên dưới để gửi tin nhắn xác nhận qua Zalo Xưởng Nệm Thắng Long.`
  };
}
