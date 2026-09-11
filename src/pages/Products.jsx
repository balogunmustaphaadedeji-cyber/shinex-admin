import React from "react";
import { Check, Ban, RotateCcw } from "lucide-react";
import { AdminTable } from "../components/AdminTable";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { COLORS } from "../components/ui";

/* Listing lifecycle: pending -> approved | rejected. Approved listings can
   later be archived by the subscription-expiration job (see
   services/subscriptions.js on the backend), and archived listings can be
   restored by the seller or an admin. NOTE: the backend's /restore route
   only works on listings whose listing_status is currently "archived" — a
   "rejected" listing has to be brought back via /approve instead, since
   that route sets listing_status="approved" unconditionally regardless of
   current status. Calling /restore on a rejected listing 404s. */
export default function Products() {
  const toast = useToast();

  const approve = async (r, load) => {
    try {
      await api(`/admin/products/${r.id}/approve`, { method: "PATCH" });
      toast.push("Listing approved", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const reject = async (r, load) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await api(`/admin/products/${r.id}/reject`, { method: "PATCH", body: { reason } });
      toast.push("Listing rejected", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const restore = async (r, load) => {
    try {
      await api(`/admin/products/${r.id}/restore`, { method: "PATCH" });
      toast.push("Listing restored", "success");
      load();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <AdminTable
      resource="products"
      columns={["name", "price", "user", "category", "listing_status", "is_sold", "created_at"]}
      title="Products & moderation"
      searchable
      deletable
      renderActions={(r, load) => (
        <div className="flex gap-1.5">
          {r.listing_status === "pending" && (
            <>
              <button onClick={() => approve(r, load)} className="p-1 rounded-md border text-white" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }} title="Approve">
                <Check size={13} />
              </button>
              <button onClick={() => reject(r, load)} className="p-1 rounded-md border text-red-500 border-red-200" title="Reject">
                <Ban size={13} />
              </button>
            </>
          )}
          {r.listing_status === "rejected" && (
            <button onClick={() => approve(r, load)} className="p-1 rounded-md border text-white" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }} title="Approve">
              <Check size={13} />
            </button>
          )}
          {r.listing_status === "archived" && (
            <button onClick={() => restore(r, load)} className="p-1 rounded-md border text-amber-600 border-amber-200" title="Restore">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      )}
    />
  );
}
