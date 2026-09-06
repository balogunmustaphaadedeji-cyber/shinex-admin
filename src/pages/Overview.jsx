import React, { useState, useEffect, useCallback } from "react";
import { Users, Package, Megaphone, Flag, CreditCard } from "lucide-react";
import { api } from "../lib/api";
import { COLORS, money, Skeleton, ErrorState } from "../components/ui";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [usersRes, productsRes, pendingProductsRes, adsRes, reportsRes, paymentsRes] = await Promise.all([
        api("/admin/users?limit=1"),
        api("/admin/products?limit=1"),
        api("/admin/products?status=pending&limit=1"),
        api("/admin/advertisements?approval=pending&limit=1"),
        api("/admin/reports?status=pending&limit=1"),
        api("/admin/payments/stats"),
      ]);
      setStats({
        users: usersRes.pagination?.total ?? usersRes.data?.length ?? 0,
        products: productsRes.pagination?.total ?? productsRes.data?.length ?? 0,
        pendingProducts: pendingProductsRes.pagination?.total ?? pendingProductsRes.data?.length ?? 0,
        pendingAds: adsRes.pagination?.total ?? adsRes.data?.length ?? 0,
        pendingReports: reportsRes.pagination?.total ?? reportsRes.data?.length ?? 0,
        revenue: paymentsRes.data?.total_revenue ?? 0,
        transactions: paymentsRes.data?.total_transactions ?? 0,
      });
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (status === "loading") return <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  if (status === "error") return <ErrorState message="Couldn't load dashboard stats." onRetry={load} />;

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, bg: COLORS.primary },
    { label: "Products", value: stats.products, icon: Package, bg: "#0D9488" },
    { label: "Pending Products", value: stats.pendingProducts, icon: Package, bg: "#B45309" },
    { label: "Advertisements", value: stats.pendingAds, icon: Megaphone, bg: "#D97706" },
    { label: "Pending Reports", value: stats.pendingReports, icon: Flag, bg: "#DC2626" },
    { label: "Revenue", value: money(stats.revenue), icon: CreditCard, bg: COLORS.secondary },
    { label: "Transactions", value: stats.transactions, icon: CreditCard, bg: "#4A32A3" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-5" style={{ backgroundColor: c.bg }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-white/15">
              <c.icon size={17} className="text-white" />
            </div>
            <p className="text-2xl font-extrabold text-white">{c.value ?? "—"}</p>
            <p className="text-xs text-white/75 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
