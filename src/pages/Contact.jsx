import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { XIcon, TrashIcon } from '../components/Icons';
import { listMessages, getMessage, setMessageStatus, deleteMessage } from '../api/contact';
import { formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

const TABS = [{ key: '', label: 'All' }, { key: 'new', label: 'New' }, { key: 'read', label: 'Read' }, { key: 'replied', label: 'Replied' }];
const STATUS_OPTIONS = ['new', 'read', 'replied'];

export default function Contact() {
  const [tab, setTab] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (p = 1) => {
    setStatus('loading');
    listMessages({ status: tab || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(() => load(1), [tab]); // eslint-disable-line

  const openDetail = async (id) => {
    try {
      const msg = await getMessage(id);
      setSelected(msg);
      if (msg.status === 'new') await setMessageStatus(id, 'read').then(() => load(page));
    } catch (err) { showToast(err.message); }
  };

  const updateStatus = async (s) => {
    setBusy(true);
    try { await setMessageStatus(selected.id, s); setSelected({ ...selected, status: s }); showToast('Status updated'); load(page); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };
  const doDelete = async () => {
    setBusy(true);
    try { await deleteMessage(confirmDelete.id); showToast('Message deleted'); setConfirmDelete(null); setSelected(null); load(page); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };

  return (
    <AdminLayout title="Contact Messages" subtitle="Messages submitted through the public contact form.">
      <div className="shx-tabs">{TABS.map((t) => <button key={t.key} className={`shx-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}</div>

      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorState onRetry={() => load(1)} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No messages" />}
      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>From</th><th>Subject</th><th>Status</th><th>Received</th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} style={{ cursor: 'pointer', fontWeight: m.status === 'new' ? 700 : 400 }} onClick={() => openDetail(m.id)}>
                    <td>{m.name} <span className="shx-muted shx-text-sm">({m.email})</span></td>
                    <td>{m.subject}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td>{formatDate(m.created_at)}</td>
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
              <p style={{ fontWeight: 800, fontSize: 15 }}>{selected.subject}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            <p className="shx-text-sm shx-muted">{selected.name} · {selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</p>
            <p className="shx-text-sm shx-muted shx-mt-8">{formatDate(selected.created_at)}</p>
            <p className="shx-text-sm shx-mt-16" style={{ lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{selected.message}</p>

            <div className="shx-field shx-mt-24">
              <label className="shx-label">Status</label>
              <select className="shx-select" value={selected.status} disabled={busy} onChange={(e) => updateStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="shx-btn shx-btn--danger" onClick={() => setConfirmDelete(selected)}><TrashIcon width={15} height={15} /> Delete message</button>
          </div>
        </div>
      )}

      {confirmDelete && <ConfirmDialog title="Delete this message?" danger confirmLabel="Delete" busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />}
    </AdminLayout>
  );
}
