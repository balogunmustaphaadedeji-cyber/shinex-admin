import React from "react";
import { AdminTable } from "../components/AdminTable";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS } from "../components/ui";

/* PATCH /admin/products/:id/approve, /admin/products/:id/reject, DELETE /admin/products/:id */
export default function Products() {
  const toast = useToast();

  const approve = async (id, reload) => {
    try {
      await api(`/admin/products/${id}/approve`, { method: "PATCH" });
      toast.push("Product approved — now live on the marketplace", "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const reject = async (id, reload) => {
    const reason = window.prompt("Reason for rejection (shown to the seller):") || "";
    if (reason === null) return;
    try {
      await api(`/admin/products/${id}/reject`, { method: "PATCH", body: { reason } });
      toast.push("Product rejected", "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="products"
      columns={["name", "price", "user", "category", "approval_status", "is_sold", "created_at"]}
      title="Products"
      searchable
      deletable
      statusFilter={{
        default: "pending",
        options: [
          { label: "Pending review", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "All", value: "" },
        ],
      }}
      renderActions={(r, reload) => (
        <div className="flex items-center gap-2">
          {r.approval_status !== "approved" && (
            <button
              onClick={() => approve(r.id, reload)}
              className="text-xs font-semibold px-2 py-1 rounded-md border"
              style={{ color: COLORS.secondary, borderColor: COLORS.secondary }}
            >
              Approve
            </button>
          )}
          {r.approval_status !== "rejected" && (
            <button
              onClick={() => reject(r.id, reload)}
              className="text-xs font-semibold px-2 py-1 rounded-md border"
              style={{ color: "#B45309", borderColor: "#FCD34D" }}
            >
              Reject
            </button>
          )}
        </div>
      )}
    />
  );
}
