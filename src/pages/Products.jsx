import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { SearchIcon, CheckIcon, XIcon, TrashIcon } from '../components/Icons';
import { listProducts, approveProduct, rejectProduct, deleteProduct, getProduct } from '../api/products';
import { formatNaira, formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

const TABS = [
  { key: '', label: 'All' }, { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }
];

export default function Products() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('status') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (p = 1, t = tab, s = search) => {
    setLoadStatus('loading');
    listProducts({ status: t || undefined, search: s || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setLoadStatus('ready');
    }).catch(() => setLoadStatus('error'));
  };
  useEffect(() => load(1, tab), [tab]); // eslint-disable-line

  const openDetail = async (id) => {
    try { setSelected(await getProduct(id)); } catch (err) { showToast(err.message); }
  };

  const doApprove = async (id) => {
    setBusy(true);
    try { await approveProduct(id); showToast('Product approved'); setSelected(null); load(page); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };
  const doReject = async () => {
    setBusy(true);
    try { await rejectProduct(selected.id, rejectReason); showToast('Product rejected'); setSelected(null); setShowReject(false); load(page); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };
  const doDelete = async () => {
    setBusy(true);
    try { await deleteProduct(confirmDelete.id); showToast('Product deleted'); setConfirmDelete(null); setSelected(null); load(page); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };

  return (
    <AdminLayout title="Products" subtitle="Every listing goes through approval before it's public.">
      <div className="shx-tabs">
        {TABS.map((t) => <button key={t.key} className={`shx-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <form className="shx-toolbar" onSubmit={(e) => { e.preventDefault(); load(1); }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shx-slate-500)' }} />
          <input className="shx-input" style={{ paddingLeft: 32 }} placeholder="Search product name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="shx-btn shx-btn--dark" type="submit">Search</button>
      </form>

      {loadStatus === 'loading' && <TableSkeleton />}
      {loadStatus === 'error' && <ErrorState onRetry={() => load(1)} />}
      {loadStatus === 'ready' && rows.length === 0 && <EmptyState title="No products found" />}

      {loadStatus === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th></th><th>Name</th><th>Seller</th><th>Category</th><th>Price</th><th>Status</th><th>Listed</th><th></th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(p.id)}>
                    <td><img src={p.primary_image || ''} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: 'var(--shx-slate-100)' }} /></td>
                    <td style={{ fontWeight: 700, maxWidth: 220 }}>{p.name}</td>
                    <td>{p.user?.username ? `@${p.user.username}` : '—'}</td>
                    <td>{p.category?.name || '—'}</td>
                    <td>{formatNaira(p.price)}</td>
                    <td><StatusBadge status={p.is_sold ? 'sold' : p.approval_status} /></td>
                    <td>{formatDate(p.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {p.approval_status === 'pending' && (
                        <button className="shx-btn shx-btn--outline shx-btn--icon" onClick={() => doApprove(p.id)} title="Approve"><CheckIcon width={15} height={15} /></button>
                      )}
                    </td>
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
          <div className="shx-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="shx-flex-between" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 16 }}>{selected.name}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            {selected.images?.length > 0 && (
              <div className="shx-flex shx-gap-8" style={{ overflowX: 'auto', marginBottom: 16 }}>
                {selected.images.map((img) => <img key={img.id} src={img.image_url} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />)}
              </div>
            )}
            <DetailRow label="Price" value={formatNaira(selected.price)} />
            <DetailRow label="Category" value={selected.category?.name} />
            <DetailRow label="Condition" value={selected.condition} />
            <DetailRow label="Location" value={selected.location || '—'} />
            <DetailRow label="Seller" value={`@${selected.user?.username} (${selected.user?.email})`} />
            <DetailRow label="Status" value={<StatusBadge status={selected.approval_status} />} />
            {selected.description && <p className="shx-text-sm shx-mt-16" style={{ lineHeight: 1.5 }}>{selected.description}</p>}
            {selected.rejection_reason && <p className="shx-error-text shx-mt-8">Rejection reason: {selected.rejection_reason}</p>}

            {showReject && (
              <div className="shx-field shx-mt-16">
                <label className="shx-label">Rejection reason</label>
                <textarea className="shx-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this listing doesn't meet guidelines" />
              </div>
            )}

            <div className="shx-flex shx-gap-8 shx-mt-24" style={{ flexWrap: 'wrap' }}>
              {selected.approval_status !== 'approved' && (
                <button className="shx-btn shx-btn--primary" disabled={busy} onClick={() => doApprove(selected.id)}><CheckIcon width={15} height={15} /> Approve</button>
              )}
              {selected.approval_status !== 'rejected' && !showReject && (
                <button className="shx-btn shx-btn--outline" onClick={() => setShowReject(true)}><XIcon width={15} height={15} /> Reject</button>
              )}
              {showReject && (
                <button className="shx-btn shx-btn--danger" disabled={busy} onClick={doReject}>Confirm reject</button>
              )}
              <button className="shx-btn shx-btn--danger" onClick={() => setConfirmDelete(selected)}><TrashIcon width={15} height={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title={`Delete "${confirmDelete.name}"?`} description="This permanently removes the listing and its images." danger
          confirmLabel="Delete" busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />
      )}
    </AdminLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="shx-flex-between shx-text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--shx-border)' }}>
      <span className="shx-muted">{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
