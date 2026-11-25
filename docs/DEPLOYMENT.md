# Deployment: Vercel + Cloudflare

The frontend and backend are separate deployments from the same GitHub repository: `Suraj1812/LIDRESS`.

## Vercel frontend

Import the repository and choose:

| Setting                               | Value                                    |
| ------------------------------------- | ---------------------------------------- |
| Project name                          | `lidress`                                |
| Framework                             | Next.js                                  |
| Root directory                        | `frontend`                               |
| Node.js                               | 22.x or newer                            |
| Build command                         | `npm run build`                          |
| Install command                       | Default workspace-aware installation     |
| Output directory                      | Default Next.js output                   |
| Include source outside root directory | Enabled (needed for `shared/catalog.ts`) |

Set `NEXT_PUBLIC_API_URL` to the deployed Worker's HTTPS origin, with no `/api` suffix. This value is public and is embedded at build time. Redeploy the frontend when it changes. Do not put a Decart permanent key in Vercel frontend variables.

You may deploy the frontend first. Free try-on is independent of the API; an unavailable health endpoint simply leaves the optional AI action hidden.

## Cloudflare backend

The Worker name is `lidress-api`. It needs no database or object storage.

For a Git-connected Workers Build, use the repository root as the build root, `npm ci` as the build command, and `npm run deploy --workspace backend` as the deploy command. The workspace script resolves `backend/wrangler.jsonc`.

Alternatively, from an authenticated terminal at the repository root:

```sh
npm ci
npm run deploy --workspace backend
```

Before production deployment, set these values in `backend/wrangler.jsonc`:

```json
"vars": {
  "ALLOWED_ORIGINS": "https://YOUR-VERCEL-PRODUCTION-DOMAIN",
  "ENVIRONMENT": "production"
}
```

Use the actual assigned domain, not an assumed `lidress.vercel.app` domain. Add other exact origins as a comma-separated string only if needed. Avoid wildcard Vercel preview origins. Local development can include `http://localhost:3000`.

The `TOKEN_RATE_LIMITER` binding is declared in the configuration. It limits token creation to five requests per minute per IP. CORS and IP rate limits are basic abuse controls, not user authentication or an account-wide spending budget. For a public paid AI launch, add store authentication or Turnstile plus provider spending controls. Free overlay mode never calls the token endpoint.

If you enable paid Decart, store the permanent key as a Cloudflare runtime secret:

```sh
cd backend
npx wrangler secret put DECART_API_KEY
```

You can also add it in the Cloudflare Worker dashboard's runtime Variables and Secrets section. Do not add it as a plain variable, repository secret file, or build log. Without the key, health returns `aiConfigured: false`, token creation returns `503`, and free try-on continues to work.

## Connect and verify

1. Deploy the Worker and copy its exact HTTPS origin.
2. Set `NEXT_PUBLIC_API_URL` in Vercel, then deploy/redeploy the frontend.
3. Put the exact Vercel production origin in the Worker's `ALLOWED_ORIGINS`, set `ENVIRONMENT` to `production`, and redeploy the Worker. Keep source configuration in sync with dashboard changes.
4. Visit `/api/health` on the Worker. Expect `status: "ok"`.
5. Open the Vercel site over HTTPS. Test filtering, the bag, and **Start free try-on**.
6. Allow the camera, keep both shoulders in view, change garments, adjust placement, compare the original, and save a snapshot. Check that **End session** releases the browser camera indicator.
7. If Decart is enabled, explicitly start its AI mode and verify provider credits and the returned WebRTC stream. A configured key alone does not prove the account has credits or the service is available.

The MediaPipe model and matching runtime are served from the same frontend origin. Camera access works on HTTPS or localhost. No cross-origin isolation headers are required.

## API routes

| Method  | Path                     | Purpose                                      |
| ------- | ------------------------ | -------------------------------------------- |
| GET     | `/api/health`            | Health and whether optional AI is configured |
| GET     | `/api/products`          | Shared men's demo catalogue                  |
| POST    | `/api/try-on/token`      | Mint a restricted Decart client credential   |
| OPTIONS | Any allowed-origin route | Browser CORS preflight                       |

Tokens expire after 60 seconds, allow only `lucy-vton-3.6`, are restricted to the requesting frontend origin, and limit realtime sessions to 120 seconds. Responses are not cached. Camera media goes directly from browser to Decart only in explicit paid AI mode; the Worker does not relay or save video.

Reference: [Vercel monorepos](https://vercel.com/docs/monorepos), [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Decart SDK](https://docs.platform.decart.ai/sdks/javascript).
