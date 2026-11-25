# LIDRESS

**Find your everyday.** A shopping product inspired by familiar Indian marketplaces, with an original olive identity.

Browse 80 demo products across men's fashion, footwear, watches, mobiles, electronics, home, accessories, sports and grooming. Each product has six or seven gallery images: 500 local files in total. The camera and virtual try-on features have been removed.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The Cloudflare API runs on http://localhost:8787. Local D1 migrations run automatically before the API starts, and rerun when the database configuration or SQL migration files change. No API key is required. An optional `frontend/.env.local` can override the API origin; see `frontend/.env.example`.

## Features

- Search suggestions, categories, brand/price/rating filters, sorting and pagination.
- Product galleries, zoom, size selection, related products and reviews.
- Guest bag and wishlist saved on the device, with account sync after sign-in.
- Account registration, password sign-in, HTTP-only sessions and saved addresses.
- Demo checkout, server-calculated totals, welcome coupon, order history and cancellation.
- Transactional inventory reservations and idempotent order creation in Cloudflare D1.
- Responsive layouts, keyboard-accessible dialogs and reduced-motion support.

Checkout is a simulation: no payments are collected and nothing is shipped. Product prices, ratings and delivery estimates are sample data. Real payments, fulfilment, seller onboarding, email verification and password recovery are not implemented.

## Code map

| Folder                  | Responsibility                                |
| ----------------------- | --------------------------------------------- |
| `frontend/app`          | Next.js pages and same-origin API gateway     |
| `frontend/components`   | UI grouped by shopping feature                |
| `frontend/lib/store.ts` | Guest bag, wishlist and UI state              |
| `backend/src/routes`    | Auth, catalogue, account and order APIs       |
| `backend/src/auth.ts`   | Password hashing and session lifecycle        |
| `backend/migrations`    | Database tables, inventory and stock triggers |
| `shared/products.json`  | Editable product catalogue                    |
| `shared/catalog.ts`     | Catalogue types, pricing and totals           |
| `shared/schemas.ts`     | Shared request validation                     |
| `scripts`               | Repeatable image preparation and validation   |

TypeScript is used throughout. React Query manages API data, Zustand manages local shopping state, Radix handles dialogs and menus, React Hook Form and Zod validate forms, and Hono routes the Worker API.

## Validate changes

```sh
npm run typecheck
npm test
npm run build
npm run format:check
node scripts/check-catalog.mjs
```

The integration suite uses a real local D1 runtime to verify account sessions, validation, saved shopping data, order ownership, stock rollback, cancellation and duplicate submission handling.

See [deployment instructions](docs/DEPLOYMENT.md) and [asset provenance](docs/ASSETS.md).
