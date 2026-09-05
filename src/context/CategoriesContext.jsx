import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

/* ------------------------------------------------------------
   CATEGORIES CONTEXT — GET /products/categories/all
   { id, name, slug, description, icon, is_active }
   Same public endpoint the marketplace frontend uses.
   ------------------------------------------------------------ */
const CategoriesContext = createContext({ categories: [], status: "loading", reload: () => {} });

export function useCategories() {
  return useContext(CategoriesContext);
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await api("/products/categories/all", { auth: false });
      setCategories(data || []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <CategoriesContext.Provider value={{ categories, status, reload: load }}>{children}</CategoriesContext.Provider>;
}
