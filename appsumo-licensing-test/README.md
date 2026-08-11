# AppSumo Licensing

Production endpoints are **branded on protocol100.xyz** (not Convex `.site` URLs).

## Partner Portal URLs (use these)

| Setting | URL |
|---------|-----|
| **Webhook URL** | `https://protocol100.xyz/v2/webhooks` |
| **OAuth Redirect URL** | `https://protocol100.xyz/appsumo` |

Alias webhook (same handler): `https://protocol100.xyz/webhook/appsumo`

## How it works

1. Vercel serves branded paths and proxies webhooks → Convex (`api/v2/webhooks.ts`)
2. Convex `src/convex/appsumo.ts` stores licenses and updates `users.isPaid`
3. OAuth lands on the SPA at `/appsumo`, exchanges `code`, links the Clerk user

## Convex env vars

Set on the Convex deployment:

- `APPSUMO_API_KEY` — HMAC + Licensing API
- `APPSUMO_CLIENT_ID` / `APPSUMO_CLIENT_SECRET` — after URLs validate
- `APPSUMO_REDIRECT_URI` — **must match exactly:** `https://protocol100.xyz/appsumo`
- `SITE_URL` — `https://protocol100.xyz`

## Vercel env vars

- `CONVEX_SITE_URL` (preferred) or `VITE_CONVEX_SITE_URL` — e.g. `https://tame-hawk-970.convex.site`

## Local stub (optional)

```bash
cd appsumo-licensing-test
npm install && node server.js
# ngrok http 8083  — only if testing Partner Portal against localhost
```

Prefer pointing the Partner Portal at the production branded URLs above.
