"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { formatDimension, formatVnd } from "@/lib/format";

gsap.registerPlugin(useGSAP);

type OrderItem = {
  id: string;
  productName: string;
  sku: string;
  width: number;
  length: number;
  thickness: number;
  quantity: number;
  unitPrice: number;
  variant?: {
    product?: {
      mediaLinks?: Array<{ mediaAsset: { url: string; alt: string } }>;
      media?: Array<{ url: string; alt: string }>;
    };
  };
};

type AccountOrder = {
  code: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  publicToken?: string;
  shippingAddress: Record<string, string | undefined> | unknown;
  items: OrderItem[];
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán chưa hoàn tất",
  REVIEW_REQUIRED: "Cần đối soát",
  REFUNDED: "Đã hoàn tiền",
};

const paymentMethodLabels: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "MoMo",
  SEPAY: "SePay",
};

function getItemImage(item: OrderItem) {
  return item.variant?.product?.mediaLinks?.[0]?.mediaAsset ?? item.variant?.product?.media?.[0] ?? null;
}

export function AccountOrderExperience({ order }: { order: AccountOrder }) {
  const root = useRef<HTMLElement>(null);
  const featuredItem = order.items[0];
  const featuredImage = featuredItem ? getItemImage(featuredItem) : null;
  const address = typeof order.shippingAddress === "object" && order.shippingAddress !== null
    ? order.shippingAddress as Record<string, string | undefined>
    : null;
  const orderStatus = orderStatusLabels[order.status] ?? order.status;
  const paymentStatus = paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus;
  const paymentMethod = paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod;
  const createdAt = new Date(order.createdAt);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = gsap.utils.toArray<HTMLElement>("[data-order-reveal]");
    gsap.from(reveal, {
      autoAlpha: 0,
      y: 18,
      duration: 0.72,
      ease: "power2.out",
      stagger: 0.08,
    });
    gsap.from(".account-order-ambient-image", {
      autoAlpha: 0,
      scale: 1.045,
      duration: 1.15,
      ease: "power2.out",
    });
  }, { scope: root });

  return (
    <main ref={root} className="account-page account-order-experience">
      <section className="account-order-hero">
        {featuredImage && (
          <div className="account-order-ambient" aria-hidden="true">
            <img className="account-order-ambient-image" src={featuredImage.url} alt="" />
          </div>
        )}
        <div className="account-order-hero-copy">
          <Link href="/tai-khoan/don-hang" className="account-order-back" data-order-reveal>
            <span aria-hidden="true">←</span>
            <span>Quay lại</span>
            <strong>Danh sách đơn hàng</strong>
          </Link>
          <p className="eyebrow" data-order-reveal>CHI TIẾT ĐƠN HÀNG</p>
          <h1 data-order-reveal>{order.code}</h1>
          <div className="account-order-statuses" aria-label="Trạng thái đơn hàng" data-order-reveal>
            <span><small>Đơn hàng</small>{orderStatus}</span>
            <span><small>Thanh toán</small>{paymentStatus}</span>
            <span><small>Phương thức</small>{paymentMethod}</span>
          </div>
          <p className="account-order-date" data-order-reveal>Ngày đặt: {Number.isNaN(createdAt.getTime()) ? "—" : createdAt.toLocaleString("vi-VN")}</p>
          {order.paymentMethod === "SEPAY" && order.paymentStatus === "PENDING" && order.publicToken && (
            <Link href={("/checkout/result?token=" + order.publicToken) as never} className="button button-primary" data-order-reveal>Tiếp tục thanh toán SePay</Link>
          )}
        </div>

        {featuredItem && (
          <aside className="account-order-hero-product" data-order-reveal aria-label="Sản phẩm chính trong đơn hàng">
            <p className="eyebrow">NỆM ĐÃ CHỌN</p>
            <strong>{featuredItem.productName}</strong>
            <p>{formatDimension(featuredItem.width)} × {formatDimension(featuredItem.length)} × {featuredItem.thickness}cm</p>
            <span>{featuredItem.quantity} sản phẩm · {formatVnd(featuredItem.unitPrice * featuredItem.quantity)}</span>
          </aside>
        )}
      </section>

      <div className="container account-order-layout">
        <section className="account-order-detail" data-order-reveal>
          <div className="account-order-section-heading">
            <p className="eyebrow">TÓM TẮT ĐƠN HÀNG</p>
            <h2>Thông tin thanh toán</h2>
          </div>
          <ul className="account-order-items-list">
            {order.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <small>{item.sku} · {formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm</small>
                </div>
                <div className="account-item-pricing">
                  <span>{item.quantity} × {formatVnd(item.unitPrice)}</span>
                  <strong>{formatVnd(item.unitPrice * item.quantity)}</strong>
                </div>
              </li>
            ))}
          </ul>
          <dl className="account-order-summary-dl">
            <dt>Tạm tính</dt>
            <dd>{formatVnd(order.subtotal)}</dd>
            <dt>Phí giao hàng</dt>
            <dd>{formatVnd(order.shippingFee)}</dd>
            <dt className="total-label">Tổng cộng</dt>
            <dd className="total-value">{formatVnd(order.total)}</dd>
            <dt>Phương thức thanh toán</dt>
            <dd>{paymentMethod} · {paymentStatus}</dd>
          </dl>
          <div className="account-shipping-info">
            <h2>Địa chỉ nhận hàng</h2>
            {address ? (
              <div className="account-address-card">
                {address.customerName && <p><strong>{address.customerName}</strong></p>}
                {address.customerPhone && <p>{address.customerPhone}</p>}
                {address.guestEmail && <p>{address.guestEmail}</p>}
                <p>{[address.line1, address.district, address.province].filter(Boolean).join(", ")}</p>
              </div>
            ) : (
              <pre className="bank-transfer-info">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
            )}
          </div>
        </section>

        <aside className="account-order-product-aside" data-order-reveal aria-label="Sản phẩm trong đơn">
          <div className="account-order-aside-heading">
            <p className="eyebrow">SẢN PHẨM ĐÃ CHỌN</p>
            <h2>Chi tiết nệm</h2>
          </div>
          {order.items.map((item) => {
            const image = getItemImage(item);
            return (
              <article className="account-order-product-card" key={item.id}>
                {image ? (
                  <img src={image.url} alt={image.alt || item.productName} />
                ) : (
                  <div className="account-order-product-placeholder" aria-hidden="true">NỆM THĂNG LONG</div>
                )}
                <div>
                  <strong>{item.productName}</strong>
                  <p>{formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm</p>
                  <span>Số lượng {item.quantity}</span>
                </div>
              </article>
            );
          })}
          <Link href="/nem" className="account-order-continue-link">Xem thêm sản phẩm <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </main>
  );
}
