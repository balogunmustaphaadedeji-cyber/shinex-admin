import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { Button, Skeleton, EmptyState, ErrorState } from "../components/ui";

/* Ad pricing == /admin/durations (duration_days, price, is_active). Edited per-row (no bulk update endpoint). */
export default function Durations() {
  const toast = useToast();
  const [durations, setDurations] = useState([]);
  const [status, setStatus] = useState("loading");
  const [savingId, setSavingId] = useState(null);
  const [newDuration, setNewDuration] = useState({ duration_days: "", price: "" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await api("/admin/durations");
      setDurations(data || []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateField = (id, field, value) =>
    setDurations((ds) => ds.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  const save = async (d) => {
    setSavingId(d.id);
    try {
      await api(`/admin/durations/${d.id}`, {
        method: "PUT",
        body: { duration_days: Number(d.duration_days), price: Number(d.price), is_active: d.is_active },
      });
      toast.push("Duration updated", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this duration plan?")) return;
    try {
      await api(`/admin/durations/${id}`, { method: "DELETE" });
      toast.push("Duration removed", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const create = async () => {
    if (!newDuration.duration_days || !newDuration.price) {
      toast.push("Enter both duration and price.", "error");
      return;
    }
    setCreating(true);
    try {
      await api("/admin/durations", {
        method: "POST",
        body: { duration_days: Number(newDuration.duration_days), price: Number(newDuration.price), is_active: true },
      });
      setNewDuration({ duration_days: "", price: "" });
      toast.push("Duration created", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Ad Pricing</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex flex-wrap items-end gap-3">
        <div className="w-28">
          <span className="block text-xs font-medium text-gray-500 mb-1">Days</span>
          <input type="number" value={newDuration.duration_days} onChange={(e) => setNewDuration((d) => ({ ...d, duration_days: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20" />
        </div>
        <div className="w-32">
          <span className="block text-xs font-medium text-gray-500 mb-1">Price (₦)</span>
          <input type="number" value={newDuration.price} onChange={(e) => setNewDuration((d) => ({ ...d, price: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20" />
        </div>
        <Button onClick={create} disabled={creating}><Plus size={16} /> {creating ? "Adding..." : "Add plan"}</Button>
      </div>

      {status === "loading" ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : status === "error" ? (
        <ErrorState message="Couldn't load ad pricing." onRetry={load} />
      ) : durations.length === 0 ? (
        <EmptyState icon={CreditCard} title="No duration plans yet" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {durations.map((d) => (
            <div key={d.id} className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <input type="number" value={d.duration_days} onChange={(e) => updateField(d.id, "duration_days", e.target.value)} className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20" />
                <span className="text-xs text-gray-500">days</span>
              </div>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input type="number" value={d.price} onChange={(e) => updateField(d.id, "price", e.target.value)} className="w-full rounded-lg border border-gray-200 pl-6 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20" />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <input type="checkbox" checked={!!d.is_active} onChange={(e) => updateField(d.id, "is_active", e.target.checked)} /> Active
              </label>
              <Button onClick={() => save(d)} disabled={savingId === d.id} className="!py-1.5 !px-3 ml-auto">
                {savingId === d.id ? "Saving..." : "Save"}
              </Button>
              <button onClick={() => remove(d.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
