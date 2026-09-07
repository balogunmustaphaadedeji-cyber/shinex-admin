import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import { XIcon, CheckIcon } from '../components/Icons';
import { listReports, getReport, resolveReport, dismissReport } from '../api/reports';
import { formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

const TABS = [{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'resolved', label: 'Resolved' }, { key: 'dismissed', label: 'Dismissed' }];

export default function Reports() {
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (p = 1) => {
    setStatus('loading');
    listReports({ status: tab || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(() => load(1), [tab]); // eslint-disable-line

  const openDetail = async (id) => { setNotes(''); try { setSelected(await getReport(id)); } catch (err) { showToast(err.message); } };
  const target = (r) => {
    if (r?.target_product) return `Product: ${r.target_product.name}`;
    if (r?.target_user) return `User: @${r.target_user.username}`;
    if (r?.target_advertisement) return `Ad: ${r.target_advertisement.title}`;
    return '—';
  };

  const doResolve = async () => { setBusy(true); try { await resolveReport(selected.id, notes); showToast('Report resolved'); setSelected(null); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };
  const doDismiss = async () => { setBusy(true); try { await dismissReport(selected.id, notes); showToast('Report dismissed'); setSelected(null); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };

  return (
    <AdminLayout title="Reports" subtitle="User-submitted reports on products, sellers and advertisements.">
      <div className="shx-tabs">{TABS.map((t) => <button key={t.key} className={`shx-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}</div>

      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorState onRetry={() => load(1)} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="Nothing here" description="No reports match this filter." />}
      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Reason</th><th>Target</th><th>Reported by</th><th>Status</th><th>Filed</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(r.id)}>
                    <td style={{ fontWeight: 700 }}>{r.reason}</td>
                    <td>{target(r)}</td>
                    <td>@{r.reporter?.username}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{formatDate(r.created_at)}</td>
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
              <p style={{ fontWeight: 800, fontSize: 15 }}>{selected.reason}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            <p className="shx-text-sm shx-muted" style={{ marginBottom: 12 }}>Target: {target(selected)}</p>
            {selected.description && <p className="shx-text-sm" style={{ marginBottom: 12 }}>{selected.description}</p>}
            <p className="shx-text-sm shx-muted">Filed by @{selected.reporter?.username} on {formatDate(selected.created_at)}</p>

            {selected.status === 'pending' && (
              <>
                <div className="shx-field shx-mt-16">
                  <label className="shx-label">Admin notes</label>
                  <textarea className="shx-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What action, if any, did you take?" />
                </div>
                <div className="shx-flex shx-gap-8">
                  <button className="shx-btn shx-btn--primary" disabled={busy} onClick={doResolve}><CheckIcon width={15} height={15} /> Resolve</button>
                  <button className="shx-btn shx-btn--outline" disabled={busy} onClick={doDismiss}>Dismiss</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
