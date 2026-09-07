import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import { SearchIcon, XIcon } from '../components/Icons';
import { listPayments, getPayment, getPaymentStats } from '../api/payments';
import { formatNaira, formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const showToast = useToast();

  useEffect(() => { getPaymentStats().then(setStats).catch(() => {}); }, []);

  const load = (p = 1) => {
    setStatus('loading');
    listPayments({ status: statusFilter || undefined, search: search || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(() => load(1), [statusFilter]); // eslint-disable-line

  const openDetail = async (id) => { try { setSelected(await getPayment(id)); } catch (err) { showToast(err.message); } };

  return (
    <AdminLayout title="Payments" subtitle="Advertisement payments processed via Paystack.">
      {stats && (
        <div className="shx-stats-grid shx-mt-8" style={{ marginBottom: 20 }}>
          <div className="shx-card shx-stat"><p className="shx-stat__label">Total revenue</p><p className="shx-stat__value">{formatNaira(stats.total_revenue)}</p></div>
          <div className="shx-card shx-stat"><p className="shx-stat__label">Transactions</p><p className="shx-stat__value">{stats.total_transactions}</p></div>
          {stats.status_breakdown?.slice(0, 2).map((s) => (
            <div key={s.status} className="shx-card shx-stat"><p className="shx-stat__label" style={{ textTransform: 'capitalize' }}>{s.status}</p><p className="shx-stat__value">{s.count}</p></div>
          ))}
        </div>
      )}

      <form className="shx-toolbar" onSubmit={(e) => { e.preventDefault(); load(1); }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shx-slate-500)' }} />
          <input className="shx-input" style={{ paddingLeft: 32 }} placeholder="Search reference…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="shx-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button className="shx-btn shx-btn--dark" type="submit">Search</button>
      </form>

      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorState onRetry={() => load(1)} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No payments found" />}
      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Reference</th><th>User</th><th>Advertisement</th><th>Amount</th><th>Status</th><th>Paid</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(p.id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{p.paystack_reference}</td>
                    <td>@{p.user?.username}</td>
                    <td>{p.advertisement?.title || '—'}</td>
                    <td>{formatNaira(p.amount)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{formatDate(p.paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="shx-pagination" style={{ padding: '12px 16px' }}>
              <button className="shx-btn shx-btn--outline" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
              <span className="shx-muted shx-text-sm">Page {page} of {pagination.totalPages || 1}</span>
              <button className="shx-btn shx-btn--outline" disabled={page >= pagination.totalPages} onClick={() => load(page + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="shx-modal-overlay" onClick={() => setSelected(null)}>
          <div className="shx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shx-flex-between" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 15 }}>Payment detail</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            <Row label="Reference" value={selected.paystack_reference} />
            <Row label="Amount" value={formatNaira(selected.amount)} />
            <Row label="Status" value={<StatusBadge status={selected.status} />} />
            <Row label="User" value={`@${selected.user?.username} (${selected.user?.email})`} />
            {selected.advertisement && <Row label="Advertisement" value={`${selected.advertisement.title} (${selected.advertisement.duration_days} days)`} />}
            <Row label="Paid at" value={formatDate(selected.paid_at)} />
            <Row label="Created" value={formatDate(selected.created_at)} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ label, value }) {
  return <div className="shx-flex-between shx-text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--shx-border)' }}><span className="shx-muted">{label}</span><span style={{ fontWeight: 600 }}>{value}</span></div>;
}
