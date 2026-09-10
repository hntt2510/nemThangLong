export type ShippingPolicy = { shippingFee: number | null; freeShippingThreshold: number | null };

export function shippingFeeForSubtotal(subtotal: number, policy: ShippingPolicy) {
  if (policy.shippingFee === null) return null;
  if (policy.freeShippingThreshold !== null && subtotal >= policy.freeShippingThreshold) return 0;
  return policy.shippingFee;
}
