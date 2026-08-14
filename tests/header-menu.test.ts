import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteHeaderClient } from "@/components/site-header-client";
import { initialHeaderMenuState, reduceHeaderMenu } from "@/lib/header-menu";
import { defaultNavigation } from "@/lib/navigation";
import { CartProvider } from "@/lib/cart-context";

describe("shared header menu state", () => {
  it("keeps mobile and mega menu state independent", () => {
    const mobile = reduceHeaderMenu(initialHeaderMenuState, { type: "toggle-mobile" });
    const mega = reduceHeaderMenu(mobile, { type: "toggle-mega" });
    expect(mobile).toEqual({ mobileOpen: true, megaOpen: false });
    expect(mega).toEqual({ mobileOpen: true, megaOpen: true });
    expect(reduceHeaderMenu(mega, { type: "escape" })).toEqual({ mobileOpen: true, megaOpen: false });
    expect(reduceHeaderMenu({ mobileOpen: true, megaOpen: false }, { type: "escape" })).toEqual(initialHeaderMenuState);
    expect(reduceHeaderMenu(mega, { type: "outside" })).toEqual(initialHeaderMenuState);
    expect(reduceHeaderMenu(mega, { type: "navigate" })).toEqual(initialHeaderMenuState);
  });

  it("renders the cart, independent controls and primary navigation in static markup", () => {
    const markup = renderToStaticMarkup(createElement(CartProvider, null, createElement(SiteHeaderClient, { navigation: defaultNavigation, solid: true })));
    expect(markup).toContain('href="/gio-hang"');
    expect(markup).toContain('aria-controls="mobile-navigation"');
    expect(markup).toContain('aria-controls="mattress-menu"');
    expect(markup).toContain("Theo nhu cầu");
    expect(markup).toContain("Khách sạn &amp; dự án");
  });
});
