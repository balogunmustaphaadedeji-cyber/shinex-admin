import React from "react";
import { Check, Ban, Pause } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS } from "../components/ui";
import { AdminTable } from "../components/AdminTable";

/* PATCH approve/reject/pause, DELETE */
export default function Advertisements() {
  const toast = useToast();
  const act = async (id, action, reload) => {
    try {
      if (action === "reject") {
        const reason = window.prompt("Reason for rejection:");
        if (!reason) return;
        await api(`/admin/advertisements/${id}/reject`, { method: "PATCH", body: { reason } });
      } else {
        await api(`/admin/advertisements/${id}/${action}`, { method: "PATCH" });
      }
      toast.push(`Advertisement ${action}d`, "success");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="advertisements"
      columns={["title", "user", "payment_status", "approval_status", "created_at"]}
      title="Advertisements"
      searchable
      deletable
      renderActions={(r, reload) => (
        <div className="flex gap-1.5">
          {r.approval_status === "pending" && (
            <>
              <button onClick={() => act(r.id, "approve", reload)} className="p-1 rounded-md border text-white" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }} title="Approve">
                <Check size={13} />
              </button>
              <button onClick={() => act(r.id, "reject", reload)} className="p-1 rounded-md border text-red-500 border-red-200" title="Reject">
                <Ban size={13} />
              </button>
            </>
          )}
          {r.approval_status === "approved" && (
            <button onClick={() => act(r.id, "pause", reload)} className="p-1 rounded-md border text-amber-600 border-amber-200" title="Pause">
              <Pause size={13} />
            </button>
          )}
        </div>
      )}
    />
  );
}
