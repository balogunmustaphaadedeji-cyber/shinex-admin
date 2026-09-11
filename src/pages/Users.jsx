import React from "react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS } from "../components/ui";
import { AdminTable } from "../components/AdminTable";

/* PATCH /admin/users/:id/suspend|unsuspend, DELETE /admin/users/:id */
export default function Users() {
  const toast = useToast();
  const suspendUser = async (id, suspend, reload) => {
    try {
      if (suspend) {
        const reason = window.prompt("Reason for suspension (optional):") || "";
        await api(`/admin/users/${id}/suspend`, { method: "PATCH", body: { reason } });
      } else {
        await api(`/admin/users/${id}/unsuspend`, { method: "PATCH" });
      }
      toast.push(suspend ? "User suspended" : "User unsuspended", "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="users"
      columns={["username", "full_name", "email", "phone", "is_suspended", "created_at"]}
      title="Users"
      searchable
      deletable
      renderActions={(r, reload) => (
        <button
          onClick={() => suspendUser(r.id, !r.is_suspended, reload)}
          className="text-xs font-semibold px-2 py-1 rounded-md border"
          style={r.is_suspended ? { color: COLORS.secondary, borderColor: COLORS.secondary } : { color: "#B45309", borderColor: "#FCD34D" }}
        >
          {r.is_suspended ? "Unsuspend" : "Suspend"}
        </button>
      )}
    />
  );
}
