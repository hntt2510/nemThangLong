"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  BedDouble,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  ChevronDown
} from "lucide-react";
import { ZaloOrderCard } from "@/components/chat/zalo-order-card";
import { DraftOrderResult } from "@/lib/ai-assistant-tools";
import { SITE_CONFIG } from "@/config/site-config";
import { getHotlineTelLink } from "@/lib/utils/contact-helpers";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  orderCard?: DraftOrderResult | null;
  createdAt: Date;
}

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: `Kính chào Quý khách! Em là **Trợ Lý Tư Vấn Giấc Ngủ & Kỹ Thuật Đệm** của **${SITE_CONFIG.brand.name}**.\n\nEm được kết nối trực tiếp với kho dữ liệu xưởng để giúp Quý khách:\n• 🛏️ **Chọn đệm chuẩn y khoa:** Nâng đỡ thắt lưng, chống đau mỏi thoái hóa cột sống.\n• 💰 **Báo giá chính xác:** Mọi kích thước 1m0 - 1m8 và độ dày 10cm - 20cm.\n• 📍 **Chỉ đường đến 7 showroom:** Trực tiếp nằm thử thực tế tại Đồng Nai, Tây Ninh, Bình Phước, Long An.\n• 📦 **Tạo đơn dự thảo 1-Chạm:** Kích hoạt **${SITE_CONFIG.policies.sleepTrialNights} đêm nằm thử** và xác thực chính chủ qua Zalo xưởng.\n\nQuý khách đang muốn tìm kiếm tấm nệm thế nào cho gia đình mình ạ?`,
  createdAt: new Date()
};

const SUGGESTION_CHIPS = [
  { label: "🛏️ Tư vấn đau lưng / cột sống", text: "Tôi bị đau mỏi thắt lưng thì nên chọn dòng nệm nào và độ dày bao nhiêu phù hợp?" },
  { label: "📍 Tìm 7 showroom gần tôi", text: `Cho tôi xem danh sách 7 showroom ${SITE_CONFIG.brand.name} và giờ mở cửa.` },
  { label: "💰 Báo giá Classic 1m6 & 1m8", text: `Báo giá nệm ${SITE_CONFIG.brand.name} Classic kích thước 1m6x2m và 1m8x2m độ dày 10cm.` },
  { label: "📦 Đặt nệm & Xác thực Zalo", text: "Tôi muốn đặt mua nệm và giao tận phòng ngủ thì cần những thông tin gì?" }
];

export function ChatWidget() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: textToSend,
        createdAt: new Date()
      }
    ];

    setMessages(newMessages);
    if (!customText) setInput("");
    setIsLoading(true);

    try {
      // Send chat payload to Next.js API route
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`Mã lỗi: ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || "Dạ em đã ghi nhận thông tin của quý khách ạ!",
          orderCard: data.orderCard || null,
          createdAt: new Date()
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Dạ em gặp chút gián đoạn kết nối. Quý khách vui lòng thử gửi lại tin nhắn, hoặc liên hệ ngay hotline xưởng **${SITE_CONFIG.contact.hotlineDisplay}** để nhân viên hỗ trợ trực tiếp ạ!`,
          createdAt: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Helper to parse basic markdown bold and list items
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Bold replacer: **bold text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-[#1A2530]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-[#334155] leading-relaxed my-0.5">
            {formattedParts}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-[#334155] leading-relaxed my-1">
          {formattedParts}
        </p>
      );
    });
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right, above mobile sticky call bar) */}
      <div className="fixed bottom-20 lg:bottom-5 right-4 sm:right-5 z-50 flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full border border-[#D9D2C5] bg-[#1A2530] px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#253240] hover:shadow-2xl active:scale-95"
            aria-label="Mở khung tư vấn giấc ngủ AI"
          >
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8A27A] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#C8A27A]"></span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium tracking-wider text-[#C8A27A] uppercase">
                Tư Vấn Giấc Ngủ AI
              </span>
              <span className="text-[13px] font-semibold text-white">
                Hỏi Giá & Showroom
              </span>
            </div>

            <div className="ml-1 rounded-full bg-[#2A3745] p-1.5 text-white transition group-hover:bg-[#C8A27A] group-hover:text-[#1A2530]">
              <MessageSquare className="h-4 w-4" />
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F6] shadow-2xl sm:inset-auto sm:bottom-20 sm:right-6 sm:h-[620px] sm:w-[410px] sm:rounded-3xl sm:border sm:border-[#E8E4DA] sm:overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E4DA] bg-gradient-to-r from-[#1A2530] to-[#243342] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8A27A] to-[#9C7954] text-[#1A2530] shadow-sm">
                <Sparkles className="h-4 w-4 fill-[#1A2530]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] tracking-wide text-white">
                    {SITE_CONFIG.brand.name.toUpperCase()}
                  </span>
                  <span className="rounded bg-[#C8A27A]/25 px-1.5 py-0.2 text-[9.5px] font-semibold tracking-wider text-[#E8D6C1] uppercase">
                    KIRA AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#A6B5C5]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span>Tư Vấn Trực Tuyến 24/7</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                type="button"
                className="rounded-lg p-1.5 text-[#A6B5C5] transition hover:bg-white/10 hover:text-white"
                title="Làm mới đoạn hội thoại"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="rounded-lg p-1.5 text-[#A6B5C5] transition hover:bg-white/10 hover:text-white"
                title="Thu nhỏ"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="flex gap-2 overflow-x-auto border-b border-[#EDE8DE] bg-[#F5F2EC] px-3 py-2 text-[11px] no-scrollbar">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                type="button"
                className="shrink-0 rounded-full border border-[#DCD5C7] bg-white px-2.5 py-1 font-medium text-[#4A5568] shadow-xs transition hover:border-[#C8A27A] hover:bg-[#FAF8F5] hover:text-[#1A2530]"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "rounded-br-xs bg-[#1A2530] text-white"
                      : "rounded-bl-xs border border-[#E8E4DA] bg-white text-[#2D3748]"
                  }`}
                >
                  {renderFormattedContent(msg.content)}
                </div>

                {/* Inline Zalo Order Card if returned */}
                {msg.orderCard && (
                  <div className="w-full max-w-full">
                    <ZaloOrderCard order={msg.orderCard} />
                  </div>
                )}

                <span className="mt-1 px-1 text-[10px] text-[#A0AEC0]">
                  {msg.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-bl-xs border border-[#E8E4DA] bg-white px-3.5 py-2.5 text-[13px] text-[#718096] shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#C8A27A]" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#C8A27A]" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#C8A27A]" style={{ animationDelay: "300ms" }}></span>
                    <span className="ml-1.5 text-[11.5px] font-medium text-[#718096]">
                      Đang tra cứu kho xưởng...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Footer */}
          <div className="border-t border-[#E8E4DA] bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về nệm, kích thước, showroom..."
                className="flex-1 rounded-xl border border-[#DCD5C7] bg-[#FAF9F6] px-3.5 py-2 text-[13px] text-[#1A2530] placeholder-[#A0AEC0] outline-none transition focus:border-[#C8A27A] focus:bg-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A2530] text-white transition hover:bg-[#253240] disabled:opacity-40 disabled:hover:bg-[#1A2530]"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between px-1 text-[10.5px] text-[#A0AEC0]">
              <span>Tra cứu thời gian thực từ Xưởng {SITE_CONFIG.brand.name}</span>
              <a
                href={getHotlineTelLink()}
                className="flex items-center gap-1 font-medium text-[#4A5568] hover:text-[#1A2530]"
              >
                <PhoneCall className="h-3 w-3 text-emerald-600" />
                {SITE_CONFIG.contact.hotlineDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
