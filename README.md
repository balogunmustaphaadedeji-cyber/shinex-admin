# SHINEX Admin Frontend

Independent React/Vite administration frontend. This is a separate deployable application and is not mounted under the user frontend.

## Production API
`https://shinex-marketplace.onrender.com/api`

## Run
1. `npm install`
2. Copy `.env.example` to `.env` if needed.
3. `npm run dev`
4. `npm run build`

## Render
Deploy as a separate Static Site with `npm install && npm run build`, publish `dist`, and enable the included SPA fallback in `render.yaml`.

## Security
Admin access is granted only when the existing backend login response contains `is_admin: true`. No credentials or admin bypass are included in the frontend.

## Contact replies
The current backend supports message status updates but has no admin reply-delivery endpoint or conversation storage. The UI intentionally does not fake replies.
