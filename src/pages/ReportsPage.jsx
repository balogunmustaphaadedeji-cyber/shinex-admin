import React from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import AdminTable from "../components/AdminTable";

/* Reports: PATCH /admin/reports/:id/resolve|dismiss — no delete endpoint */
export default function ReportsPage() {
  const toast = useToast();
  const act = async (id, action, reload) => {
    try {
      const admin_notes = window.prompt(`Notes for this ${action} (optional):`) || "";
      await api(`/admin/reports/${id}/${action}`, { method: "PATCH", body: { admin_notes } });
      toast.push(action === "resolve" ? "Report resolved" : "Report dismissed", "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="reports"
      columns={["reason", "status", "reporter", "target_product", "created_at"]}
      title="Reports"
      searchable={false}
      renderActions={(r, reload) =>
        r.status === "pending" && (
          <div className="flex gap-1.5">
            <button onClick={() => act(r.id, "resolve", reload)} className="text-xs font-semibold px-2 py-1 rounded-md border" style={{ color: "#159A61", borderColor: "#159A61" }}>
              Resolve
            </button>
            <button onClick={() => act(r.id, "dismiss", reload)} className="text-xs font-semibold px-2 py-1 rounded-md border text-gray-500 border-gray-300">
              Dismiss
            </button>
          </div>
        )
      }
    />
  );
}
