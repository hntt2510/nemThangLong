# Thăng Long Luxury Commerce

Luxury product-detail V1 built with Next.js, TypeScript, Prisma and a custom admin foundation.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run db:dev:up
npm run db:migrate:dev
npm run db:dev:bootstrap
npm run dev
```

The storefront is available at `http://localhost:3000/nem/luxury`.

Without `DATABASE_URL`, the app uses the seeded Luxury demo product so the visual storefront and checkout flow can be reviewed locally. Configure Neon, R2, Resend and MoMo variables from `.env.example` before enabling production integrations.

Useful routes:

- `/nem/luxury` — responsive Luxury PDP
- `/nem/luxury/lab` — Mattress Lab fallback/viewer shell
- `/gio-hang` and `/checkout` — cart and checkout
- `/admin` — custom product editor foundation
