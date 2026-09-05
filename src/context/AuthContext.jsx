import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, TOKEN_KEY } from "../api";

/* ------------------------------------------------------------
   AUTH CONTEXT
   Talks to the existing SHINEX backend's real auth routes
   (POST /auth/login, GET /auth/me, POST /auth/logout) — the
   same routes the public marketplace frontend uses.

   Backend user fields: id, username, email, full_name, phone,
   avatar_url, bio, location, whatsapp, shop_name,
   shop_description, is_admin, is_suspended, created_at

   This context does NOT decide admin authorization on its own —
   it only reflects what the backend returns. Every admin-only
   page/action still calls the backend's /admin/* routes, which
   are the actual source of truth for authorization.
   ------------------------------------------------------------ */
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api("/auth/me");
      setUser(data.user);
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user || null);
    return data;
  };

  const logout = () => {
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}
