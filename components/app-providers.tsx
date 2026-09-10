"use client";

import { CartProvider } from "@/lib/cart-context";
import { ChatWidget } from "@/components/chat/chat-widget";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <ChatWidget />
    </CartProvider>
  );
}
