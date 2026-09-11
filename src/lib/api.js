// Single API communication layer for SHINEX Admin.
// Talks to the EXISTING SHINEX backend only — no new endpoints, no
// separate admin API. Every admin route already requires a valid JWT
// AND req.user.is_admin server-side (middleware/auth.js +
// middleware/admin.js), so this frontend is a convenience UI, not the
// security boundary: a non-admin token gets a real 403 from the
// backend on every admin call, regardless of what this app shows.
const API_BASE = process.env.REACT_APP_API_URL || "https://shinex-marketplace.onrender.com/api";
const TOKEN_KEY = "shinex_admin_token";

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
  return payload || {};
}

export { TOKEN_KEY };
