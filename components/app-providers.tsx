"use client";

import { CartProvider } from "@/lib/cart-context";
import { ShowcaseProvider } from "@/components/showcase-provider";

export function AppProviders({
  showcaseMode = false,
  children,
}: {
  showcaseMode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ShowcaseProvider showcaseMode={showcaseMode}>
      <CartProvider showcaseMode={showcaseMode}>{children}</CartProvider>
    </ShowcaseProvider>
  );
}

