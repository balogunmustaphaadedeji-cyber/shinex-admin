import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="shx-state"><p className="shx-state__title">Checking your session…</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
