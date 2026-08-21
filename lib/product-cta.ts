export interface PdpCtaLabels {
  purchase: string;
  contact: string;
  disabled: string;
}

export type PdpCtaState =
  | { type: "purchase"; label: string }
  | { type: "contact"; label: string; href: string }
  | { type: "disabled"; label: string };

const DEFAULT_LABELS: PdpCtaLabels = {
  purchase: "Mua ngay",
  contact: "Tư vấn",
  disabled: "Liên hệ",
};

/**
 * Resolves the primary CTA for a product detail page (PDP).
 *
 * Rules:
 * 1. If the selected variant is purchasable, returns a "purchase" action.
 * 2. If not purchasable and a contact link is provided (e.g. tel:, mailto:, or /lien-he),
 *    returns a "contact" action with the native link.
 * 3. Otherwise returns a disabled state with no broken navigation.
 */
export function resolvePdpCta(
  canPurchase: boolean,
  contactHref?: string | null,
  customLabels?: Partial<PdpCtaLabels>
): PdpCtaState {
  const labels: PdpCtaLabels = { ...DEFAULT_LABELS, ...customLabels };

  if (canPurchase) {
    return {
      type: "purchase",
      label: labels.purchase,
    };
  }

  const trimmedHref = contactHref?.trim();
  if (trimmedHref && trimmedHref.length > 0) {
    return {
      type: "contact",
      label: labels.contact,
      href: trimmedHref,
    };
  }

  return {
    type: "disabled",
    label: labels.disabled,
  };
}
