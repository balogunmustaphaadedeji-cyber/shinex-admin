/* ------------------------------------------------------------
   API HELPER — SHINEX Admin talks to the SAME existing SHINEX
   backend the public marketplace uses. Nothing here is a new
   backend or a new endpoint; it's the same envelope contract:
     { success: boolean, message?: string, data?: any }

   The backend URL is only configurable via REACT_APP_API_URL
   (see .env.example) — never hard-coded, and no service-role /
   secret keys live in this frontend.
   ------------------------------------------------------------ */
export const API_BASE = process.env.REACT_APP_API_URL || "https://shinex-marketplace.onrender.com/api";

// Admin app uses its own localStorage key so it never collides with
// the public marketplace frontend if both are ever opened in the
// same browser profile.
export const TOKEN_KEY = "shinex_admin_token";

export async function api(path, { method = "GET", body, auth = true, formData = false } = {}) {
  const headers = {};
  if (!formData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? (formData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (e) {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    payload = null;
  }
  if (!res.ok || (payload && payload.success === false)) {
    const msg =
      (payload && (payload.message || (Array.isArray(payload.errors) && payload.errors[0]))) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  // Backend always envelopes as { success, message, data, pagination? }.
  // Return the full payload so callers can read data/pagination as needed —
  // this matches how the marketplace frontend already consumes it.
  return payload || {};
}
