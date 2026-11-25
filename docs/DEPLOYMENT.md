# Vercel frontend and Cloudflare backend

Repository: `Suraj1812/LIDRESS`.

- Frontend: https://lidress.vercel.app
- API: https://lidress-api.singhsuraj44500-0a3.workers.dev

## Vercel

Use the Next.js preset, root directory `frontend`, Node.js 22.12 or later, and the default workspace-aware install/build settings. Enable source files outside the root so the app can import `shared`.

Set `API_URL` (or the existing `NEXT_PUBLIC_API_URL`) to the Worker origin without an `/api` suffix. Set `NEXT_PUBLIC_SITE_URL` to the public storefront origin. Browser requests use `/api` on the storefront; its server gateway forwards them to Cloudflare. This keeps HTTP-only session cookies first-party.

## Cloudflare

The Worker is `lidress-api`. Its configuration is in `backend/wrangler.jsonc` and requires a D1 database named `lidress-commerce`, bound as `DB`. Wrangler can provision the missing database during deployment. Keep the generated database ID in the configuration once provisioned.

Git-connected Workers Build settings:

| Setting        | Value                                |
| -------------- | ------------------------------------ |
| Build root     | Repository root                      |
| Build command  | `npm ci`                             |
| Deploy command | `npm run deploy --workspace backend` |

Or from an authenticated terminal:

```sh
npm ci
npm run deploy --workspace backend
```

The deploy script publishes the Worker and applies remote D1 migrations. Apply migrations before allowing checkout traffic. The initial migration creates tables and stock triggers; the second seeds 80 inventory rows. Later inventory migrations must preserve existing stock.

`ALLOWED_ORIGINS` must contain exact storefront origins, comma-separated. Production uses `https://lidress.vercel.app`. `ENVIRONMENT=production` enables Secure session cookies. Local development overrides both values. Auth is rate-limited to 30 attempts per minute per connecting IP.

No camera, AI provider key, or paid AI service is used. Keep runtime credentials out of source control. Back up D1 before destructive schema changes.

## Verify a deployment

1. Worker `/api/health` returns `status: ok` and `database: connected`.
2. Storefront `/api/products?limit=80` returns 80 products through the gateway.
3. Open a product and all gallery images; test search, filters, bag and wishlist.
4. Use a dedicated verification account to save an address and submit an unpaid order request. No payment should be collected.
5. Check order history and cancellation, then confirm the stock reservation is restored.
6. Check mobile navigation and keyboard access.

## API groups

| Prefix                   | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `/api/auth`              | Register, login, logout, current session            |
| `/api/products`          | Search/filter products, product details and reviews |
| `/api/account`           | Saved bag, wishlist and addresses                   |
| `/api/orders`            | Unpaid order requests, history, detail and cancellation     |
| `/api/delivery/:pincode` | PIN-based location preferences                  |

Mutations require an allowed Origin. Authenticated routes require a valid session cookie. Prices and totals are recalculated on the server. Orders reserve stock inside a database transaction; repeated checkout keys return the original order.
