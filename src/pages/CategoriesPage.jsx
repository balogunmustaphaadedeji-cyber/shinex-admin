import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { useCategories } from "../context/CategoriesContext";
import { Skeleton, EmptyState, ErrorState, Button } from "../components/ui";

export default function CategoriesPage() {
  const toast = useToast();
  const { reload: reloadGlobalCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [newCat, setNewCat] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await api("/admin/categories");
      setCategories(data || []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newCat.trim()) return;
    try {
      await api("/admin/categories", { method: "POST", body: { name: newCat } });
      setNewCat("");
      toast.push("Category added", "success");
      load();
      reloadGlobalCategories();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api(`/admin/categories/${id}`, { method: "DELETE" });
      toast.push("Category removed", "success");
      load();
      reloadGlobalCategories();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Categories</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex gap-3">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20"
        />
        <Button onClick={add}><Plus size={16} /> Add</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-2">
        {status === "loading" && <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>}
        {status === "error" && <ErrorState message="Couldn't load categories." onRetry={load} />}
        {status === "ready" && categories.length === 0 && <EmptyState icon={Tag} title="No categories yet" />}
        {status === "ready" && categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{c.icon ? `${c.icon} ` : ""}{c.name}</span>
            <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
