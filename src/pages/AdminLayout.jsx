import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Tag, Megaphone, CreditCard, Flag, Mail,
  Menu, X, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui";

const ADMIN_SECTIONS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/advertisements", label: "Advertisements", icon: Megaphone },
  { to: "/pricing", label: "Ad Pricing", icon: CreditCard },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/messages", label: "Contact", icon: Mail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#EFF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <button className="md:hidden fixed bottom-6 right-5 z-30 bg-white rounded-full p-3 shadow-lg border" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} style={{ color: "#5B3FC6" }} />
        </button>

        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-4 flex flex-col transform transition-transform md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex items-center justify-between mb-6">
            <Logo size={26} />
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          <nav className="space-y-1 flex-1">
            {ADMIN_SECTIONS.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                style={({ isActive }) => (isActive ? { backgroundColor: "#5B3FC614", color: "#5B3FC6" } : undefined)}
              >
                <s.icon size={17} /> {s.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="px-1 mb-2">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={doLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <LogOut size={17} /> Log out
            </button>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
