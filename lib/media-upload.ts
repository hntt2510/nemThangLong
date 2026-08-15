export function buildFinalizedMediaData(input: { productId: string; type: string; url: string; alt: string; aspect?: string | null }) {
  return { productId: input.productId, type: input.type, url: input.url, alt: input.alt, aspect: input.aspect, isDemo: true };
}
