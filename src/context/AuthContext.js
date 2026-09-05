import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, TOKEN_KEY } from "../lib/api";

// There is no separate "admin login" endpoint on the backend — admins
// are just users with is_admin = true. This app calls the SAME
// POST /auth/login used by the public marketplace, then checks
// is_admin from GET /auth/me. That check here is a UX convenience
// only (redirect a non-admin away with a clear message) — the real
// security boundary is server-side: every /admin/* route already
// requires middleware/auth.js + middleware/admin.js, so a non-admin's
// token is rejected with a genuine 403 on every actual admin action
// no matter what this frontend does or doesn't show.
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
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}
