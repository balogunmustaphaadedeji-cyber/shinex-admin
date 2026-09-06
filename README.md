# SHINEX Admin

Independent administrator-only frontend for the SHINEX Marketplace backend.

## Run locally

```bash
npm install
PORT=5174 BASE_PATH=/shinex-admin/ npm run dev
```

Build and preview:

```bash
PORT=5174 BASE_PATH=/shinex-admin/ npm run build
PORT=5174 BASE_PATH=/shinex-admin/ npm run serve
```

The workspace runtime normally supplies `PORT` and `BASE_PATH`. Set
`VITE_SHINEX_API_URL` to the deployed backend API base (for example
`https://shinex-marketplace.onrender.com/api`) or leave it as `/api` when the
API is proxied from the same origin.

## Authentication and authorization

The console uses the existing `POST /auth/login`, `GET /auth/me`, and
`POST /auth/logout` endpoints. The returned backend JWT is sent as a bearer
token and requests also include cookies. After authentication, the app makes a
real `GET /admin/users?limit=1` request before rendering any admin screen.
That request is the authorization gate; the client never grants access based
on a URL, a hardcoded account, or a local `is_admin` flag.

## Supported admin surfaces

Dashboard, users, admin management, products, categories, advertisements,
advertisement duration pricing, payments and payment stats, reports, and
contact messages are connected to their documented `/admin/*` endpoints.
Settings and audit logs are intentionally rendered as explicit unsupported
states because the supplied backend has no corresponding admin endpoints.
Orders, refunds, subscriptions, roles, exports, and other absent endpoints are
not fabricated.

## Structure

- `src/lib/shinex-admin-api.ts`: typed fetch client, token handling, exact API paths
- `src/App.tsx`: auth gate, responsive shell, routes, screens, loading/error/empty states
- `src/index.css`: SHINEX visual tokens and admin layout
- `public/manifest.webmanifest`, `public/sw.js`: PWA shell

No backend, database, payment secret, or service credential is included or
changed by this project.