import { z } from "zod";
import { CATALOG_SLUGS } from "@/lib/product-data";

export const catalogSlugSchema = z.enum(CATALOG_SLUGS);
export type CatalogSlug = z.infer<typeof catalogSlugSchema>;

const nullableNonNegative = z.number().int().min(0).nullable();
export const adminVariantSchema = z.object({
  id: z.string().min(1).optional(),
  width: z.number().int().positive(),
  length: z.number().int().positive(),
  thickness: z.number().int().positive(),
  price: nullableNonNegative,
  compareAtPrice: nullableNonNegative.optional(),
  sku: z.string().trim().min(1).max(120),
  active: z.boolean(),
}).strict();

export const adminMediaSchema = z.object({
  id: z.string().min(1).optional(), type: z.enum(["image", "video", "model"]),
  url: z.string().min(1), alt: z.string().trim().min(1).max(300), aspect: z.string().nullable().optional(),
  focalX: z.number().min(0).max(1).optional(), focalY: z.number().min(0).max(1).optional(),
  fit: z.enum(["cover", "contain"]).optional(), sortOrder: z.number().int().nonnegative(), isDemo: z.boolean().optional(),
}).strict();

export const adminLayerSchema = z.object({
  id: z.string().min(1).optional(), sortOrder: z.number().int().nonnegative(), name: z.string().trim().min(1).max(160),
  material: z.string().nullable().optional(), thickness: z.string().nullable().optional(), description: z.string().nullable().optional(),
  textureUrl: z.string().url().nullable().optional(), nodeName: z.string().nullable().optional(), explodeDistance: z.number().nonnegative().optional(),
  showHotspot: z.boolean().optional(), published: z.boolean(),
}).strict();

const publishedText = z.object({ published: z.boolean(), title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(5000) }).strict();
const publishedBody = z.object({ published: z.boolean(), title: z.string().trim().min(1).max(200).optional(), body: z.string().trim().min(1).max(5000) }).strict();
const comfort = z.object({ published: z.boolean(), firmnessLabel: z.string().trim().max(120).optional(), firmnessScore: z.number().finite().min(1).max(5).nullable().optional(), support: z.number().finite().min(1).max(5).nullable().optional(), breathability: z.number().finite().min(1).max(5).nullable().optional(), motionIsolation: z.number().finite().min(1).max(5).nullable().optional() }).strict();
export const adminContentSchema = z.object({ comfort, audience: publishedText, materialStory: publishedText, delivery: publishedBody, warranty: publishedBody }).partial().strict();

export const adminProductDocumentSchema = z.object({
  updatedAt: z.string().datetime(),
  general: z.object({ name: z.string().trim().min(2).max(200), eyebrow: z.string().trim().max(200).nullable().optional(), description: z.string().trim().max(10000).nullable().optional(), status: z.enum(["DRAFT", "PUBLISHED"]), isDemo: z.boolean(), mattressLab: z.boolean(), modelUrl: z.string().min(1).nullable().optional(), posterUrl: z.string().min(1).nullable().optional(), content: adminContentSchema.nullable().optional() }).strict(),
  variants: z.array(adminVariantSchema), media: z.array(adminMediaSchema), layers: z.array(adminLayerSchema),
}).strict();
export type AdminProductDocument = z.infer<typeof adminProductDocumentSchema>;
