"use client";

import React, { useState } from "react";
import { DraftOrderResult } from "@/lib/ai-assistant-tools";
import { SITE_CONFIG } from "@/config/site-config";
import { getHotlineTelLink } from "@/lib/utils/contact-helpers";
import {
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Truck,
  PhoneCall,
  Clock,
  Sparkles
} from "lucide-react";

interface ZaloOrderCardProps {
  order: DraftOrderResult;
}

export function ZaloOrderCard({ order }: ZaloOrderCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#E8E4DA] bg-[#FFFDF9] shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Top Banner / Verification Gate Header */}
      <div className="border-b border-[#F0EBE0] bg-gradient-to-r from-[#FAF6EE] to-[#F5EFE4] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
            <span className="text-[12px] font-semibold tracking-wide text-amber-900 uppercase">
              Chờ xác thực Zalo chính chủ
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-[#DDD5C5] bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-[#4A5568] transition hover:bg-[#FAF8F5]"
            title="Sao chép mã đơn"
          >
            <span>{order.orderCode}</span>
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3 text-[#718096]" />
            )}
          </button>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-[#718096]">
          Để chống đơn hàng giả mạo và kích hoạt <b>100 đêm nằm thử</b>, quý khách vui lòng bấm nút xác thực Zalo 1-chạm bên dưới.
        </p>
      </div>

      {/* Order Specification Sheet */}
      <div className="space-y-3 px-4 py-3.5 text-[13px] text-[#2D3748]">
        {/* Product line */}
        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#F5EFE6]">
          <div>
            <div className="font-semibold text-[#1A2530] text-[14px]">
              {order.productName}
            </div>
            <div className="mt-0.5 text-[12px] text-[#718096]">
              Quy cách: <span className="font-medium text-[#2D3748]">{order.dimension}</span> • Dày: <span className="font-medium text-[#2D3748]">{order.thickness}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-[#EFECE6] px-2 py-0.5 text-[11px] font-medium text-[#4A5568]">
              x{order.quantity}
            </span>
          </div>
        </div>

        {/* Customer & Address detail */}
        <div className="grid grid-cols-1 gap-2 text-[12px]">
          <div className="flex items-center justify-between text-[#4A5568]">
            <span className="text-[#718096]">Người nhận:</span>
            <span className="font-medium text-[#1A2530]">
              {order.customerName} ({order.phoneNumber})
            </span>
          </div>
          <div className="flex items-center justify-between text-[#4A5568]">
            <span className="text-[#718096]">Email nhận bảo hành:</span>
            <span className="font-medium text-[#1A2530] truncate max-w-[200px]" title={order.customerEmail}>
              {order.customerEmail}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 text-[#4A5568]">
            <span className="text-[#718096] shrink-0">Địa chỉ giao:</span>
            <span className="font-medium text-right text-[#1A2530] leading-snug">
              {order.shippingAddress}
            </span>
          </div>
        </div>

        {/* Price Total */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#F5EFE6]">
          <span className="text-[12px] font-medium text-[#718096]">Tạm tính (Giao tận giường):</span>
          <span className="text-[17px] font-bold text-[#1A2530] tracking-tight">
            {order.formattedTotalAmount}
          </span>
        </div>
      </div>

      {/* 1-Tap Zalo Verification CTA */}
      <div className="bg-[#FAF8F5] p-3 border-t border-[#EFEBE3]">
        <a
          href={order.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#0057D6] hover:shadow active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4 fill-white" />
          <span>Xác Nhận Qua Zalo (1-Chạm)</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-80 transition group-hover:translate-x-0.5" />
        </a>

        <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-[#718096]">
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3 text-emerald-600" />
            {SITE_CONFIG.policies.freeDeliveryText}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Bảo hành {SITE_CONFIG.policies.minWarrantyYears} - {SITE_CONFIG.policies.maxWarrantyYears} năm
          </span>
        </div>

        <div className="mt-2 text-center text-[10.5px] text-[#A0AEC0]">
          Hoặc gọi hotline xưởng hỗ trợ:{" "}
          <a
            href={getHotlineTelLink()}
            className="font-medium text-[#4A5568] hover:text-[#1A2530] underline"
          >
            {order.hotline || SITE_CONFIG.contact.hotlineDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
