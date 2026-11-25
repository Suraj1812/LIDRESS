# LIDRESS

**Your next look. Already on you.**

A men's clothing storefront with a free, body-tracked virtual fitting room. Built with Next.js, React, TypeScript, Tailwind CSS, MediaPipe, and a Cloudflare Worker. Decart realtime AI is an optional paid integration; it is not required for the default experience.

## Run locally

Use Node.js 22.12 or newer. From the repository root:

```sh
npm install
cp frontend/.env.example frontend/.env.local
npm run dev
```

- Storefront: <http://localhost:3000>
- Backend health: <http://localhost:8787/api/health>
- Catalogue API: <http://localhost:8787/api/products>

Allow the camera when you click **Start free try-on**. Face the camera with both shoulders visible. Choose another garment, adjust scale and vertical position, compare with the original camera, or download your look. The first start loads the local pose model and WebAssembly runtime.

Free mode runs entirely in your browser: no API key, no subscription, no camera uploads. It uses a 2D texture mesh: the torso follows the shoulders and hips, sleeves follow elbows and wrists, and the face and hands are kept in front. It cannot predict real fit or fabric drape; seams and occlusion can still look approximate.

## What works

- Seven men's pieces: three shirts, two T-shirts, a field jacket, and a denim jacket.
- Product filtering, price sorting, search, and saved pieces.
- Shopping bag with size, quantity, and subtotal, saved on the device.
- Camera permission handling, body tracking, smoothing, scale/position controls, original comparison, and composed snapshots.
- Cloudflare health, catalogue, and short-lived Decart-token endpoints.
- Optional Decart WebRTC sessions, garment switching, limited session duration, CORS restrictions, and token rate limiting.

This is a working storefront prototype. Prices and catalogue images are illustrative. Orders, inventory, payments, accounts, and fulfillment are not connected.

## Find your way around the code

```text
frontend/
  app/                 Next.js page, metadata, and responsive styles
  components/          Header, catalogue, camera view, product selection, dialogs
  hooks/
    use-storefront.ts  Store, saved pieces, filtering, and bag state
    use-fitting-room.ts  Camera lifecycle and optional Decart connection
    use-body-overlay.ts  On-device pose detection and canvas rendering
    use-dialog.ts     Accessible dialog focus handling
    store-context.tsx Shared store access for UI components
  lib/
    overlay-geometry.ts  Pure shoulder/torso placement and smoothing
    garment-renderer.ts  Articulated torso/sleeve textures and face/hand occlusion
    api.ts            Calls to the Cloudflare backend
  public/             Local garment images, pose model, and matching WASM runtime
backend/
  src/index.ts        Cloudflare Worker routes and token boundary
  test/               API and overlay geometry tests
  wrangler.jsonc      Worker deployment, origins, and rate limiter
shared/catalog.ts     The single catalogue used by the frontend and API
scripts/              Garment asset preparation
```

To add a garment, edit `shared/catalog.ts`, add a transparent front-view PNG under `frontend/public/images/`, and set its overlay anchors. `torsoLeft` and `torsoRight` define the source texture’s torso edges. `sleeve` selects long, short, or three-quarter articulation, and `sleeveBottom` marks the source cuff position. Prices are in INR. The current model tracks one person.

The frontend uses the shared catalogue directly so free try-on works independently of the API. `/api/products` exposes the same data for integrations. Replace both with your inventory service when connecting a real store.

## Optional Decart AI

1. Copy `backend/.dev.vars.example` to `backend/.dev.vars`.
2. Set `DECART_API_KEY` in that local file. Never add it to a `NEXT_PUBLIC_` variable.
3. Restart `npm run dev`. The fitting room offers **Start live AI try-on** when the backend reports the key is configured.

Only that explicit AI action sends video and garment references to Decart. A fresh restricted token is minted for each session. Sessions end after two minutes. Decart requires its own credits; free body overlays do not.

## Checks and formatting

```sh
npm run typecheck
npm test
npm run build
npm run format:check
npm run format
```

Code uses two-space indentation, named components, focused hooks, and Prettier. The CI workflow runs formatting, TypeScript, tests, and production builds.

## Deploy

Deploy `frontend/` to Vercel and `backend/` to Cloudflare Workers. See [the deployment guide](docs/DEPLOYMENT.md) for exact settings and the connection checklist. Free try-on works even while the optional API is not configured.

See [asset credits](docs/ASSETS.md) for demo imagery and model sources.
