import React from "react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS } from "../components/ui";
import { AdminTable } from "../components/AdminTable";

/* PATCH /admin/users/:id/suspend|unsuspend, /set-admin, DELETE /admin/users/:id */
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

  const setAdmin = async (id, isAdmin, reload) => {
    const verb = isAdmin ? "grant admin access to" : "revoke admin access from";
    if (!window.confirm(`Are you sure you want to ${verb} this user?`)) return;
    try {
      await api(`/admin/users/${id}/set-admin`, { method: "PATCH", body: { is_admin: isAdmin } });
      toast.push(isAdmin ? "Admin access granted" : "Admin access revoked", "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="users"
      columns={["username", "full_name", "email", "phone", "is_admin", "is_suspended", "created_at"]}
      title="Users"
      searchable
      deletable
      renderActions={(r, reload) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdmin(r.id, !r.is_admin, reload)}
            className="text-xs font-semibold px-2 py-1 rounded-md border"
            style={r.is_admin ? { color: "#B91C1C", borderColor: "#FCA5A5" } : { color: COLORS.primary, borderColor: "#DDD6FE" }}
          >
            {r.is_admin ? "Revoke admin" : "Make admin"}
          </button>
          <button
            onClick={() => suspendUser(r.id, !r.is_suspended, reload)}
            className="text-xs font-semibold px-2 py-1 rounded-md border"
            style={r.is_suspended ? { color: COLORS.secondary, borderColor: COLORS.secondary } : { color: "#B45309", borderColor: "#FCD34D" }}
          >
            {r.is_suspended ? "Unsuspend" : "Suspend"}
          </button>
        </div>
      )}
    />
  );
}
