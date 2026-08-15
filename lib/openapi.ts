import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { checkoutSchema } from "@/lib/validation";
import { addressInputSchema, profileUpdateSchema } from "@/lib/account-validation";
import { publicLeadSchema, adminLeadUpdateSchema } from "@/lib/lead-validation";
import { afterSalesAdminUpdateSchema, afterSalesCreateSchema } from "@/lib/after-sales-validation";
import { adminOrderActionSchema, orderFiltersSchema } from "@/lib/admin-order-validation";
import { inventoryAdjustmentSchema } from "@/lib/inventory-validation";
import { paymentReviewResolutionSchema } from "@/lib/payment-review-validation";
import { adminProductDocumentSchema, catalogSlugSchema } from "@/lib/admin-product-validation";
import { adminSettingsSchema, momoCreateSchema, registerSchema, uploadFinalizeSchema, uploadPresignSchema } from "@/lib/api-validation";

extendZodWithOpenApi(z);

export const OPENAPI_ROUTE_INVENTORY = [
  ["PATCH", "/api/account/addresses/[id]"], ["DELETE", "/api/account/addresses/[id]"], ["GET", "/api/account/addresses"], ["POST", "/api/account/addresses"], ["POST", "/api/account/after-sales"], ["PATCH", "/api/account/profile"],
  ["GET", "/api/admin/after-sales/[id]"], ["PATCH", "/api/admin/after-sales/[id]"], ["GET", "/api/admin/after-sales"], ["GET", "/api/admin/dashboard"], ["GET", "/api/admin/inventory"], ["POST", "/api/admin/inventory"], ["GET", "/api/admin/leads/[id]"], ["PATCH", "/api/admin/leads/[id]"], ["GET", "/api/admin/leads"], ["GET", "/api/admin/orders/[id]"], ["PATCH", "/api/admin/orders/[id]"], ["GET", "/api/admin/orders"], ["GET", "/api/admin/payment-reviews/[id]"], ["PATCH", "/api/admin/payment-reviews/[id]"], ["GET", "/api/admin/payment-reviews"], ["GET", "/api/admin/products/[slug]"], ["PUT", "/api/admin/products/[slug]"], ["GET", "/api/admin/products"], ["POST", "/api/admin/products"], ["GET", "/api/admin/settings"], ["PUT", "/api/admin/settings"],
  ["POST", "/api/auth/register"], ["POST", "/api/checkout"], ["GET", "/api/cron/release-reservations"], ["POST", "/api/leads"], ["GET", "/api/orders/result/[token]"], ["POST", "/api/payments/momo/create"], ["POST", "/api/payments/momo/ipn"], ["POST", "/api/uploads/finalize"], ["POST", "/api/uploads/presign"],
  ["GET", "/api/openapi"], ["GET", "/api/health/live"], ["GET", "/api/health/ready"],
] as const;

export const OPENAPI_ROUTE_EXCEPTIONS = {
  "/api/auth/[...nextauth]": ["GET", "POST"],
} as const;

const registry = new OpenAPIRegistry();
const anyObject = z.record(z.unknown());
const anyArray = z.array(anyObject);
const errorSchema = registry.register("Error", z.object({ error: z.string(), fields: z.record(z.array(z.string())).optional(), issues: z.unknown().optional() }).strict());
const okSchema = registry.register("Ok", z.object({ ok: z.boolean() }).strict());
const profileSchema = registry.register("AccountProfile", z.object({ id: z.string(), name: z.string().nullable(), email: z.string().email(), phone: z.string().nullable() }).strict());
const addressSchema = registry.register("AccountAddress", z.object({ id: z.string(), label: z.string().nullable(), fullName: z.string(), phone: z.string(), line1: z.string(), province: z.string(), district: z.string().nullable(), postalCode: z.string().nullable() }).strict());
const healthSchema = registry.register("HealthStatus", z.object({ status: z.enum(["ok", "unavailable"]) }).strict());
const paymentReviewSchema = registry.register("PaymentReview", z.object({
  id: z.string(), code: z.string(), total: z.number(), status: z.string(), paymentStatus: z.string(), customerName: z.string(), customerPhone: z.string().nullable(), guestEmail: z.string().nullable(), createdAt: z.string().datetime(),
  items: z.array(z.object({ id: z.string(), variantId: z.string(), productName: z.string(), sku: z.string(), width: z.number(), length: z.number(), thickness: z.number(), quantity: z.number(), variant: z.object({ stock: z.number() }).strict() }).strict()),
  payments: z.array(z.object({ id: z.string(), status: z.string(), amount: z.number(), providerTransactionId: z.string().nullable(), expiresAt: z.string().datetime().nullable(), updatedAt: z.string().datetime() }).strict()),
  reservations: z.array(z.object({ id: z.string(), variantId: z.string(), quantity: z.number(), status: z.string(), expiresAt: z.string().datetime(), releasedAt: z.string().datetime().nullable() }).strict()),
}).strict());

function body(schema: z.ZodTypeAny) { return { content: { "application/json": { schema } } }; }
function response(schema: z.ZodTypeAny, description = "Successful response") { return { description, content: { "application/json": { schema } } }; }
function errors(statuses: readonly number[]) { return Object.fromEntries(statuses.map((status) => [String(status), response(errorSchema, status === 401 ? "Unauthenticated" : status === 403 ? "Forbidden" : status === 404 ? "Not found" : status === 409 ? "Conflict" : status === 413 ? "Payload too large" : status === 429 ? "Rate limited" : status === 503 ? "Service unavailable" : "Validation or request error")])); }
function register(config: Record<string, unknown>) { registry.registerPath(config as never); }

const session = [{ sessionCookie: [] }];
const admin = { security: session, description: "ADMIN only." };
const editor = { security: session, description: "ADMIN or EDITOR." };
const customer = { security: session, description: "Authenticated session; data is scoped to the current account." };

const pathId = z.object({ id: z.string().min(1) }).strict();
const pathSlug = z.object({ slug: catalogSlugSchema }).strict();
const pathToken = z.object({ token: z.string().min(20) }).strict();
const leadFilters = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "CLOSED"]).optional(), type: z.enum(["CONSULTATION", "B2B_PROJECT"]).optional(), q: z.string().max(100).optional(), page: z.coerce.number().int().positive().max(1000).optional() }).strict();
const afterSalesFilters = z.object({ type: z.enum(["WARRANTY_REVIEW", "PRODUCT_SUPPORT"]).optional(), status: z.enum(["SUBMITTED", "REVIEWING", "RESOLVED", "CLOSED"]).optional(), q: z.string().max(100).optional(), page: z.coerce.number().int().positive().max(1000).optional() }).strict();
const inventoryFilters = z.object({ slug: z.string().max(80).optional(), active: z.enum(["0", "1"]).optional(), zeroStock: z.literal("1").optional(), page: z.coerce.number().int().positive().max(1000).optional() }).strict();
const dashboardQuery = z.object({ range: z.enum(["7d", "30d"]).optional() }).strict();

register({ method: "patch", path: "/api/account/profile", tags: ["Account"], operationId: "updateAccountProfile", ...customer, request: { body: body(profileUpdateSchema) }, responses: { "200": response(profileSchema), ...errors([400, 401, 503]) } });
register({ method: "get", path: "/api/account/addresses", tags: ["Account"], operationId: "listAccountAddresses", ...customer, responses: { "200": response(z.array(addressSchema)), ...errors([401, 503]) } });
register({ method: "post", path: "/api/account/addresses", tags: ["Account"], operationId: "createAccountAddress", ...customer, request: { body: body(addressInputSchema) }, responses: { "201": response(addressSchema), ...errors([400, 401, 503]) } });
register({ method: "patch", path: "/api/account/addresses/{id}", tags: ["Account"], operationId: "updateAccountAddress", ...customer, request: { params: pathId, body: body(addressInputSchema) }, responses: { "200": response(addressSchema), ...errors([400, 401, 404, 503]) } });
register({ method: "delete", path: "/api/account/addresses/{id}", tags: ["Account"], operationId: "deleteAccountAddress", ...customer, request: { params: pathId }, responses: { "200": response(okSchema), ...errors([401, 404, 409, 503]) } });
register({ method: "post", path: "/api/account/after-sales", tags: ["After Sales"], operationId: "createAfterSalesRequest", ...customer, request: { body: body(afterSalesCreateSchema) }, responses: { "201": response(okSchema), ...errors([400, 401, 404, 503]) } });

register({ method: "get", path: "/api/admin/after-sales", tags: ["After Sales"], operationId: "listAdminAfterSales", ...admin, request: { query: afterSalesFilters }, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "get", path: "/api/admin/after-sales/{id}", tags: ["After Sales"], operationId: "getAdminAfterSales", ...admin, request: { params: pathId }, responses: { "200": response(anyObject), ...errors([401, 403, 404, 503]) } });
register({ method: "patch", path: "/api/admin/after-sales/{id}", tags: ["After Sales"], operationId: "updateAdminAfterSales", ...admin, request: { params: pathId, body: body(afterSalesAdminUpdateSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/dashboard", tags: ["Internal"], operationId: "getAdminDashboard", ...admin, request: { query: dashboardQuery }, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "get", path: "/api/admin/inventory", tags: ["Inventory"], operationId: "listInventory", ...admin, request: { query: inventoryFilters }, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "post", path: "/api/admin/inventory", tags: ["Inventory"], operationId: "adjustInventory", ...admin, request: { body: body(inventoryAdjustmentSchema) }, responses: { "201": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/leads", tags: ["Leads"], operationId: "listAdminLeads", ...admin, request: { query: leadFilters }, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "get", path: "/api/admin/leads/{id}", tags: ["Leads"], operationId: "getAdminLead", ...admin, request: { params: pathId }, responses: { "200": response(anyObject), ...errors([401, 403, 404, 503]) } });
register({ method: "patch", path: "/api/admin/leads/{id}", tags: ["Leads"], operationId: "updateAdminLead", ...admin, request: { params: pathId, body: body(adminLeadUpdateSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/orders", tags: ["Admin Orders"], operationId: "listAdminOrders", ...editor, request: { query: orderFiltersSchema }, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "get", path: "/api/admin/orders/{id}", tags: ["Admin Orders"], operationId: "getAdminOrder", ...editor, request: { params: pathId }, responses: { "200": response(anyObject), ...errors([401, 403, 404, 503]) } });
register({ method: "patch", path: "/api/admin/orders/{id}", tags: ["Admin Orders"], operationId: "updateAdminOrder", ...editor, request: { params: pathId, body: body(adminOrderActionSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/payment-reviews", tags: ["Payment Review"], operationId: "listPaymentReviews", ...admin, responses: { "200": response(z.array(paymentReviewSchema)), ...errors([401, 403, 503]) } });
register({ method: "get", path: "/api/admin/payment-reviews/{id}", tags: ["Payment Review"], operationId: "getPaymentReview", ...admin, request: { params: pathId }, responses: { "200": response(paymentReviewSchema), ...errors([401, 403, 404, 503]) } });
register({ method: "patch", path: "/api/admin/payment-reviews/{id}", tags: ["Payment Review"], operationId: "resolvePaymentReview", ...admin, request: { params: pathId, body: body(paymentReviewResolutionSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/products", tags: ["Admin Products"], operationId: "listAdminProducts", ...editor, responses: { "200": response(anyArray), ...errors([401, 403, 503]) } });
register({ method: "post", path: "/api/admin/products", tags: ["Admin Products"], operationId: "initializeAdminProduct", ...admin, request: { body: body(z.object({ slug: catalogSlugSchema }).strict()) }, responses: { "201": response(anyObject), ...errors([400, 401, 403, 503]) } });
register({ method: "get", path: "/api/admin/products/{slug}", tags: ["Admin Products"], operationId: "getAdminProduct", ...editor, request: { params: pathSlug }, responses: { "200": response(anyObject), ...errors([401, 403, 404, 503]) } });
register({ method: "put", path: "/api/admin/products/{slug}", tags: ["Admin Products"], operationId: "saveAdminProduct", ...editor, request: { params: pathSlug, body: body(adminProductDocumentSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 404, 409, 503]) } });
register({ method: "get", path: "/api/admin/settings", tags: ["Settings"], operationId: "getAdminSettings", ...editor, responses: { "200": response(anyObject), ...errors([401, 403, 503]) } });
register({ method: "put", path: "/api/admin/settings", tags: ["Settings"], operationId: "updateAdminSettings", ...editor, request: { body: body(adminSettingsSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 503]) } });

register({ method: "post", path: "/api/auth/register", tags: ["Storefront"], operationId: "registerAccount", request: { body: body(registerSchema) }, responses: { "200": response(okSchema), ...errors([400, 409, 503]) } });
register({ method: "post", path: "/api/checkout", tags: ["Checkout"], operationId: "createCheckout", security: [{ sessionCookie: [] }, {}], description: "Guest checkout is supported when guestEmail is supplied.", request: { body: body(checkoutSchema) }, responses: { "200": response(anyObject), ...errors([400, 409, 503]) } });
register({ method: "get", path: "/api/cron/release-reservations", tags: ["Internal"], operationId: "releaseExpiredReservations", security: [{ cronBearer: [] }], description: "Internal scheduled job authenticated with an opaque CRON_SECRET bearer value; not a JWT.", responses: { "200": response(anyObject), ...errors([401, 503]) } });
register({ method: "post", path: "/api/leads", tags: ["Leads"], operationId: "createPublicLead", request: { body: body(publicLeadSchema) }, responses: { "201": response(okSchema), ...errors([400, 413, 429, 503]) } });
register({ method: "get", path: "/api/orders/result/{token}", tags: ["Checkout"], operationId: "getOrderResult", request: { params: pathToken }, responses: { "200": response(anyObject), ...errors([404, 503]) } });
register({ method: "post", path: "/api/payments/momo/create", tags: ["Payments"], operationId: "createMomoPayment", request: { body: body(momoCreateSchema) }, responses: { "200": response(anyObject), ...errors([404, 409, 502, 503]) } });
register({ method: "post", path: "/api/payments/momo/ipn", tags: ["Payments"], operationId: "receiveMomoIpn", description: "MoMo provider callback authenticated by its signed request body. No session cookie is used.", request: { body: body(anyObject) }, responses: { "204": { description: "Callback accepted or ignored." }, ...errors([503]) } });
register({ method: "post", path: "/api/uploads/presign", tags: ["Uploads"], operationId: "presignUpload", ...editor, request: { body: body(uploadPresignSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 429, 503]) } });
register({ method: "post", path: "/api/uploads/finalize", tags: ["Uploads"], operationId: "finalizeUpload", ...editor, request: { body: body(uploadFinalizeSchema) }, responses: { "200": response(anyObject), ...errors([400, 401, 403, 409, 503]) } });
register({ method: "get", path: "/api/openapi", tags: ["Internal"], operationId: "getOpenApi", ...admin, responses: { "200": response(anyObject), ...errors([401, 403]) } });
register({ method: "get", path: "/api/health/live", tags: ["Internal"], operationId: "healthLive", responses: { "200": response(healthSchema) } });
register({ method: "get", path: "/api/health/ready", tags: ["Internal"], operationId: "healthReady", responses: { "200": response(healthSchema), "503": response(healthSchema, "Required dependency unavailable") } });

let cachedDocument: Record<string, unknown> | null = null;

export function getOpenApiDocument() {
  if (!cachedDocument) {
    const generated = new OpenApiGeneratorV31(registry.definitions).generateDocument({
      openapi: "3.1.0",
      info: { title: "Nệm Thăng Long API", version: "1.0.0", description: "OpenAPI contract for the existing Next.js Route Handlers." },
      servers: [{ url: "/" }],
      tags: ["Storefront", "Checkout", "Payments", "Account", "Leads", "After Sales", "Admin Products", "Admin Orders", "Inventory", "Payment Review", "Uploads", "Settings", "Internal"].map((name) => ({ name })),
    }) as unknown as Record<string, unknown>;
    cachedDocument = {
      ...generated,
      components: {
        ...(generated.components as Record<string, unknown> | undefined),
        securitySchemes: {
          sessionCookie: { type: "apiKey", in: "cookie", name: "authjs.session-token", description: "Auth.js session cookie; HTTPS deployments may use the __Secure- prefixed cookie name." },
          cronBearer: { type: "http", scheme: "bearer", bearerFormat: "opaque", description: "Opaque CRON_SECRET value. This is not a JWT." },
        },
      },
    };
  }
  return cachedDocument;
}
