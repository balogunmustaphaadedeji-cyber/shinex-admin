import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner, EmptyState, Button } from "./ui";
import { AlertCircle } from "lucide-react";

// This gate is a UX convenience, not the security boundary. Every real
// admin action still goes through the backend's own authMiddleware +
// adminMiddleware on every /admin/* route — a non-admin's token is
// rejected there with a genuine 403 regardless of what this component
// does. This just avoids showing a logged-out or non-admin visitor a
// dashboard shell that would fail on every request.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Admins only"
          subtitle="This account doesn't have permission to view SHINEX Admin."
          action={<Button onClick={() => { window.location.href = "/login"; }}>Back to sign in</Button>}
        />
      </div>
    );
  }

  return children;
}
