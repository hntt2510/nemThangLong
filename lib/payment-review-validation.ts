import { z } from "zod";

export const paymentReviewResolutionSchema = z.object({ action: z.enum(["FULFILL", "MANUAL_REFUND_RECORDED"]), confirmation: z.literal(true).optional(), note: z.string().trim().min(2).max(2000).optional() }).strict().superRefine((value, context) => { if (value.action === "MANUAL_REFUND_RECORDED" && (value.confirmation !== true || !value.note)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmation"], message: "Explicit confirmation and note are required." }); });
