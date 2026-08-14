import type { ProductContent } from "@/lib/types";

export type PublishedTitledSection = { published: true; title: string; body: string };
export type PublishedBodySection = { published: true; title?: string; body: string };
export type SanitizedComfort = {
  published: true;
  firmnessLabel?: string;
  firmnessScore: number | null;
  support: number | null;
  breathability: number | null;
  motionIsolation: number | null;
};

export type SanitizedProductContent = {
  comfort: SanitizedComfort | null;
  audience: PublishedTitledSection | null;
  materialStory: PublishedTitledSection | null;
  delivery: PublishedBodySection | null;
  warranty: PublishedBodySection | null;
};

function score(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5 ? value : null;
}

function titledSection(value: unknown): PublishedTitledSection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (item.published !== true || typeof item.title !== "string" || typeof item.body !== "string") return null;
  const title = item.title.trim();
  const body = item.body.trim();
  return title && body ? { published: true, title, body } : null;
}

function bodySection(value: unknown): PublishedBodySection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (item.published !== true || typeof item.body !== "string") return null;
  const body = item.body.trim();
  if (!body) return null;
  const title = typeof item.title === "string" && item.title.trim() ? item.title.trim() : undefined;
  return title ? { published: true, title, body } : { published: true, body };
}

export function sanitizePublishedContent(value: unknown): SanitizedProductContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { comfort: null, audience: null, materialStory: null, delivery: null, warranty: null };
  }
  const source = value as Record<string, unknown>;
  const rawComfort = source.comfort;
  let comfort: SanitizedComfort | null = null;
  if (rawComfort && typeof rawComfort === "object" && !Array.isArray(rawComfort) && (rawComfort as Record<string, unknown>).published === true) {
    const item = rawComfort as Record<string, unknown>;
    comfort = {
      published: true,
      firmnessLabel: typeof item.firmnessLabel === "string" && item.firmnessLabel.trim() ? item.firmnessLabel.trim() : undefined,
      firmnessScore: score(item.firmnessScore),
      support: score(item.support),
      breathability: score(item.breathability),
      motionIsolation: score(item.motionIsolation),
    };
  }
  return {
    comfort,
    audience: titledSection(source.audience),
    materialStory: titledSection(source.materialStory),
    delivery: bodySection(source.delivery),
    warranty: bodySection(source.warranty),
  };
}

export function sanitizeProductContent(value: unknown): ProductContent | null {
  const content = sanitizePublishedContent(value);
  if (!content.comfort && !content.audience && !content.materialStory && !content.delivery && !content.warranty) return null;
  return {
    comfort: content.comfort ?? undefined,
    audience: content.audience ?? undefined,
    materialStory: content.materialStory ?? undefined,
    delivery: content.delivery ?? undefined,
    warranty: content.warranty ?? undefined,
  };
}
