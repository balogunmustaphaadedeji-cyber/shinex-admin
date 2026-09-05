import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS, money, Skeleton, EmptyState, ErrorState } from "./ui";

export function renderCell(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return value.name || value.username || value.title || JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/* Generic admin table for resources with simple GET (list) + optional DELETE */
export function AdminTable({ resource, columns, title, searchable, deletable, renderActions }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const q = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) q.set("search", search);
      const { data } = await api(`/admin/${resource}?${q.toString()}`);
      setRows(data || []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, [resource, page, search]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm("Delete this permanently?")) return;
    try {
      await api(`/admin/${resource}/${id}`, { method: "DELETE" });
      toast.push("Removed", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {searchable && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5B3FC6]/20"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {status === "loading" && <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>}
        {status === "error" && <ErrorState message={`Couldn't load ${title.toLowerCase()}.`} onRetry={load} />}
        {status === "ready" && rows.length === 0 && <EmptyState icon={Package} title={`No ${title.toLowerCase()} found`} subtitle="Try a different search, or check back later." />}
        {status === "ready" && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  {columns.map((c) => <th key={c} className="px-4 py-3 font-medium capitalize whitespace-nowrap">{c.replace(/_/g, " ")}</th>)}
                  {(deletable || renderActions) && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[220px] truncate">
                        {c === "price" || c === "amount" ? money(r[c]) : renderCell(r[c])}
                      </td>
                    ))}
                    {(deletable || renderActions) && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          {renderActions && renderActions(r, load)}
                          {deletable && (
                            <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {status === "ready" && rows.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 text-sm font-medium disabled:opacity-40" style={{ color: COLORS.primary }}>
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button disabled={rows.length < pageSize} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 text-sm font-medium disabled:opacity-40" style={{ color: COLORS.primary }}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
