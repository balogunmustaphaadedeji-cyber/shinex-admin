import React from "react";
import { Navigate } from "react-router-dom";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, EmptyState, PageSpinner } from "./ui";

/* Client-side gating only decides what to SHOW — it is not the security
   boundary. Every admin action in this app calls the existing backend's
   /admin/* routes, which are what actually enforce admin authorization
   (a non-admin token gets rejected there regardless of what this
   component renders). */
export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF7F2]">
        <EmptyState
          icon={AlertCircle}
          title="Admins only"
          subtitle="Your account doesn't have admin permissions on SHINEX."
          action={
            <Button as="a" href="/login" onClick={(e) => { e.preventDefault(); window.location.href = "/login"; }}>
              <LayoutDashboard size={16} /> Back to login
            </Button>
          }
        />
      </div>
    );
  }

  return children;
}
