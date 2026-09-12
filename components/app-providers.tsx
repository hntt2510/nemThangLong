"use client";

import { CartProvider } from "@/lib/cart-context";
import { ChatWidget } from "@/components/chat/chat-widget";
import { FloatingCallBar } from "@/components/floating-call-bar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <ChatWidget />
      <FloatingCallBar />
    </CartProvider>
  );
}
