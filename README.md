# SHINEX Admin

A completely separate, independently deployable React + Vite app for
SHINEX marketplace administrators. Shares no code with the user app —
only the same backend API.

## Project structure

```
src/
  api/          Thin fetch wrappers, one file per /admin route group
  components/   AdminLayout (sidebar/topbar), tables, modals, states
  context/      AuthContext — logs in via /auth/login, requires is_admin
  pages/        Dashboard, Users, Products, Categories, Advertisements
                 (+ Durations), Payments, Reports, Contact, Admin Management
  styles/       Design tokens + global CSS
```

## Getting started

```bash
npm install
cp .env.example .env      # then set VITE_API_BASE_URL to your backend
npm run dev                 # http://localhost:5174
```

## Production build

```bash
npm run build
npm run preview
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the SHINEX Express API, e.g. `https://your-backend.onrender.com/api` |

## Authentication & authorization

This app reuses the **same** `/auth/login` endpoint as the user app —
there is no separate admin login system, no hardcoded credentials, and no
second database. After login, the frontend checks the returned
`user.is_admin` flag purely as a UX convenience (to bounce non-admins
back to the login screen with a clear message). It is **not** a security
boundary: every `/admin/*` request is independently authorized by the
backend's `authMiddleware` + `adminMiddleware`, so a non-admin token is
rejected by the server regardless of what the frontend does.

## Deployment

Static SPA after `npm run build` — deploy `dist/` to any static host.
Configure your host to rewrite all paths to `index.html` for the client
router. Deploy this to a **different URL/subdomain** than the user app
(e.g. `admin.yourdomain.com`) since it's a fully separate project.

## What's covered

Every screen here is backed by a real endpoint:

- **Dashboard** — there's no single `/admin/dashboard` endpoint, so these
  numbers are assembled from real `pagination.total` counts across the
  existing list endpoints, plus the one real aggregate that does exist:
  `GET /admin/payments/stats`.
- **Users** — list/search/filter, suspend/unsuspend, delete, and admin
  grant/revoke (`PATCH /admin/users/:id/set-admin`).
- **Products** — list/search/filter by approval status, approve, reject
  (with reason), delete.
- **Categories** — full CRUD.
- **Advertisements** — list/filter by approval status, approve, reject,
  pause, delete; plus **Durations & pricing** CRUD in the same page.
- **Payments** — list/search/filter, detail view, and the real stats
  aggregate.
- **Reports** — list/filter by status, resolve/dismiss with notes.
- **Contact Messages** — list/filter, mark read/replied, delete.
- **Admin Management** — grant/revoke admin access on any user account.

## What's intentionally not here

Role-based permissions (Super Admin / Finance Admin / Moderator / etc.),
audit logs, and session/login-history tracking aren't in the backend —
there's a single `is_admin` boolean and no audit table. Nothing here
fakes those; add them to this app once the backend supports them.
