import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { ErrorState } from '../components/States';
import { listUsers } from '../api/users';
import { listProducts } from '../api/products';
import { listAds } from '../api/advertisements';
import { listReports } from '../api/reports';
import { listMessages } from '../api/contact';
import { getPaymentStats } from '../api/payments';
import { formatNaira } from '../utils/format';

// There is no single dashboard-stats endpoint on the backend, so every
// number here is a real count derived from the existing list endpoints
// (limit=1, reading .pagination.total) plus the one real aggregate that
// does exist: GET /admin/payments/stats.
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    Promise.all([
      listUsers({ limit: 1 }),
      listUsers({ limit: 1, status: 'active' }),
      listUsers({ limit: 1, status: 'suspended' }),
      listProducts({ limit: 1 }),
      listProducts({ limit: 1, status: 'pending' }),
      listProducts({ limit: 1, status: 'approved' }),
      listAds({ limit: 1, approval: 'pending' }),
      listReports({ limit: 1, status: 'pending' }),
      listMessages({ limit: 1, status: 'new' }),
      getPaymentStats()
    ]).then(([users, active, suspended, products, pending, approved, pendingAds, pendingReports, newMessages, paymentStats]) => {
      setStats({
        totalUsers: users.pagination.total,
        activeUsers: active.pagination.total,
        suspendedUsers: suspended.pagination.total,
        totalProducts: products.pagination.total,
        pendingProducts: pending.pagination.total,
        approvedProducts: approved.pagination.total,
        pendingAds: pendingAds.pagination.total,
        pendingReports: pendingReports.pagination.total,
        newMessages: newMessages.pagination.total,
        paymentStats
      });
      setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(load, []);

  return (
    <AdminLayout title="Dashboard">
      {status === 'loading' && (
        <div className="shx-stats-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shx-card shx-stat"><div className="shx-skel" style={{ height: 30 }} /></div>)}
        </div>
      )}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && stats && (
        <>
          <div className="shx-stats-grid">
            <Stat label="Total users" value={stats.totalUsers} />
            <Stat label="Active users" value={stats.activeUsers} />
            <Stat label="Suspended users" value={stats.suspendedUsers} />
            <Stat label="Total products" value={stats.totalProducts} />
            <Stat label="Pending products" value={stats.pendingProducts} to="/products?status=pending" highlight={stats.pendingProducts > 0} />
            <Stat label="Approved products" value={stats.approvedProducts} />
            <Stat label="Pending advertisements" value={stats.pendingAds} to="/advertisements?approval=pending" highlight={stats.pendingAds > 0} />
            <Stat label="Pending reports" value={stats.pendingReports} to="/reports?status=pending" highlight={stats.pendingReports > 0} />
            <Stat label="New contact messages" value={stats.newMessages} to="/contact?status=new" highlight={stats.newMessages > 0} />
            <Stat label="Total revenue" value={formatNaira(stats.paymentStats.total_revenue)} />
            <Stat label="Total transactions" value={stats.paymentStats.total_transactions} />
          </div>

          <div className="shx-card shx-mt-24" style={{ padding: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Payment status breakdown</p>
            <div className="shx-flex shx-gap-12" style={{ flexWrap: 'wrap' }}>
              {stats.paymentStats.status_breakdown?.map((s) => (
                <div key={s.status} className="shx-card" style={{ padding: '10px 16px' }}>
                  <p className="shx-muted shx-text-sm" style={{ textTransform: 'capitalize' }}>{s.status}</p>
                  <p style={{ fontWeight: 800, fontSize: 18 }}>{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function Stat({ label, value, to, highlight }) {
  const content = (
    <div className="shx-card shx-stat" style={highlight ? { borderColor: 'var(--shx-amber-600)' } : undefined}>
      <p className="shx-stat__label">{label}</p>
      <p className="shx-stat__value" style={highlight ? { color: 'var(--shx-amber-600)' } : undefined}>{value}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
