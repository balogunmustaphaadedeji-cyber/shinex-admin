import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import RequireAdmin from "./components/RequireAdmin";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import Overview from "./pages/Overview";
import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import AdvertisementsPage from "./pages/AdvertisementsPage";
import DurationsPage from "./pages/DurationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import MessagesPage from "./pages/MessagesPage";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CategoriesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/advertisements" element={<AdvertisementsPage />} />
                <Route path="/pricing" element={<DurationsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </CategoriesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
