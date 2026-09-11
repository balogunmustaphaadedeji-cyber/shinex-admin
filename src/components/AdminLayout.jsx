import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, LayoutDashboard, Users, Package, Tag,
  Megaphone, CreditCard, Flag, Mail
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo, COLORS } from "./ui";

const NAV_ITEMS = [
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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <button className="md:hidden fixed bottom-6 right-5 z-30 bg-white rounded-full p-3 shadow-lg border" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} style={{ color: COLORS.primary }} />
      </button>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-4 flex flex-col transform transition-transform md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex items-center justify-between mb-2">
            <Logo size={24} />
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          {user && (
            <div className="px-1 py-3 mb-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400 truncate">@{user.username}</p>
            </div>
          )}

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={({ isActive }) =>
                  isActive ? { backgroundColor: `${COLORS.primary}14`, color: COLORS.primary } : { color: "#4B5563" }
                }
              >
                <item.icon size={17} /> {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 mt-2"
          >
            <LogOut size={17} /> Logout
          </button>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
