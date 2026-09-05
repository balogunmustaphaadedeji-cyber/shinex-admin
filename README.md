# SHINEX Admin

Standalone admin frontend for SHINEX, extracted from the existing
SHINEX Marketplace frontend (`shinexmarket-main/src/App.jsx`).

This is a **separate React app** with its own `package.json`. It does
**not** include a backend, a database, or any marketplace/browsing
pages — only the admin panel that used to live inside the marketplace
frontend at `nav.page === "admin"`.

## Architecture

- **Public marketplace** (unchanged): `https://shinexmarket.onrender.com`
- **Backend / API** (unchanged, single source of truth): `https://shinex-marketplace.onrender.com`
- **This app**: `https://shinex-admin.onrender.com`

SHINEX Admin talks **only** to the existing backend's REST API — the
same `/admin/*`, `/auth/*` and `/products/categories/all` routes the
marketplace frontend already calls. No new backend, no new database,
no new endpoints were invented.

## What was extracted

From `App.jsx` in the uploaded zip:

- `AdminDashboard`, `AdminOverview`, `AdminTable`, `AdminUsersTable`,
  `AdminReportsTable`, `AdminAdsTable`, `AdminCategories`,
  `AdminDurations` → now their own files under `src/pages/` and
  `src/components/AdminTable.jsx`.
- `LoginPage` / `AuthLayout` → `src/pages/LoginPage.jsx` (marketplace
  registration/forgot-password/browsing pages were **not** copied —
  they belong to the public frontend, not admin).
- `AuthContext`, `ToastContext`, `CategoriesContext` → `src/context/`.
- Shared UI primitives (`Logo`, `Button`, `Input`, `Select`,
  `Skeleton`, `EmptyState`, `ErrorState`, `PageSpinner`, `money`) →
  `src/components/ui.jsx`, unchanged visually (same Tailwind classes,
  same `#5B3FC6` / `#159A61` SHINEX colors).
- The `api()` fetch helper → `src/api.js`, same envelope handling
  (`{ success, message, data }`), now reading the backend URL from
  `REACT_APP_API_URL` instead of a hard-coded constant.

Nothing was redesigned. Section labels, endpoints, request bodies,
and confirm/prompt flows are copied as-is from the original file.

## Routing

The original app used in-memory state routing (`nav.page`, no
`react-router`). This app adds `react-router-dom` (a new dependency,
just for routing — no other new dependency was introduced) so admin
pages have real, refreshable URLs:

| Route             | Page                                  |
|--------------------|----------------------------------------|
| `/login`          | Admin login                            |
| `/dashboard`      | Overview (stats)                       |
| `/users`          | User management (suspend/unsuspend/delete) |
| `/products`       | Product management                     |
| `/categories`     | Categories                             |
| `/advertisements` | Advertisement approval/rejection/pause |
| `/pricing`        | Advertisement duration/pricing plans   |
| `/payments`       | Payments                               |
| `/reports`        | Reports (resolve/dismiss)              |
| `/messages`       | Contact messages                       |

## Authorization

This frontend is **not** the security boundary:

- `RequireAdmin` only controls what's *rendered* — it checks the
  logged-in user's `is_admin` flag (from `GET /auth/me`) and shows an
  "Admins only" screen if it's false, or redirects to `/login` if
  there's no session.
- Every actual admin action (list, suspend, approve, delete, etc.)
  calls the backend's existing `/admin/*` routes with the user's
  bearer token. If a non-admin token hits those routes, the backend
  itself must reject it — this app has no way to bypass that, and
  isn't meant to.

## Environment variables

Only one, and it's not a secret:

```
REACT_APP_API_URL=https://shinex-marketplace.onrender.com/api
```

See `.env.example`. Copy it to `.env` for local development, or set
`REACT_APP_API_URL` in Render's dashboard for the deployed site.

No Supabase service-role key, Paystack secret key, Cloudinary secret,
or JWT secret is present anywhere in this project — only the public
API base URL.

## Local development

```bash
npm install
cp .env.example .env
npm start
```

## Build

```bash
npm run build
```

Outputs to `build/`.

## Deploying to Render (Static Site)

1. Push this project to its own Git repo (separate from the
   marketplace frontend repo).
2. In Render: **New → Static Site**, connect the repo.
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add environment variable: `REACT_APP_API_URL=https://shinex-marketplace.onrender.com/api`
6. Client-side routing on refresh: `public/_redirects` (`/* /index.html 200`)
   is already included, and `render.yaml` also declares the same
   rewrite — either is picked up by Render automatically, so routes
   like `/users` or `/reports` won't 404 on a hard refresh.

## What's intentionally NOT here

- No product browsing, shop pages, registration, favorites, "sell",
  "advertise" (buyer-side), settings, or legal pages — those stay in
  the public marketplace frontend, untouched.
- No new backend routes, no mock/demo data, no new Supabase project.
