# SHINEX Admin

Standalone administration frontend for SHINEX Marketplace. This is a
separate deployment from the public marketplace — it contains only
admin functionality, extracted from the marketplace frontend's
AdminDashboard, and talks to the same existing backend at
https://shinex-marketplace.onrender.com/api. No new backend, no new
database, no invented endpoints.

## Local development

```
npm install
cp .env.example .env.local   # adjust REACT_APP_API_URL if needed
npm start
```

## Build

```
npm run build
```

Output goes to `build/`, same as the main marketplace frontend (CRA).

## Deploying to Render as a Static Site

- **Build command:** `npm install && npm run build`
- **Publish directory:** `build`
- **Environment variable:** `REACT_APP_API_URL=https://shinex-marketplace.onrender.com/api`
  (CRA bakes `REACT_APP_*` vars in at *build* time — changing this
  requires a rebuild, not just a restart.)
- **Client-side routing:** this app uses react-router-dom, so a route
  like `/users` needs to resolve to `index.html` on a hard refresh.
  Either:
  - deploy via the included `render.yaml` (Render "Blueprint"), which
    already has the rewrite rule, or
  - in the Render dashboard, on this Static Site → **Redirects/Rewrites**,
    add: source `/*` → destination `/index.html` → action **Rewrite**.

## Security model

Admin access is **not** enforced by this frontend. Every `/admin/*`
route on the backend already requires a valid JWT *and*
`req.user.is_admin === true` (see `middleware/auth.js` and
`middleware/admin.js` in the backend repo). This app's login screen
and route guard (`ProtectedRoute`) are a convenience UX layer only —
a non-admin who somehow loaded this app would get a real 403 from
the backend on every actual admin action, regardless of what this
frontend shows or hides.

## What's intentionally not here

This app contains *only* admin functionality — no product browsing,
no cart, no favorites, no seller shop pages. Those remain in the
public marketplace frontend, unchanged.
