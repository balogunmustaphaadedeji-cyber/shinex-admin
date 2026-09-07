import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { CheckIcon, XIcon, TrashIcon, PlusIcon, EditIcon } from '../components/Icons';
import { listAds, getAd, approveAd, rejectAd, pauseAd, deleteAd, listDurations, createDuration, updateDuration, deleteDuration } from '../api/advertisements';
import { formatNaira, formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

export default function Advertisements() {
  const [view, setView] = useState('campaigns');
  return (
    <AdminLayout title="Advertisements" subtitle="Paid banner campaigns and their pricing tiers.">
      <div className="shx-tabs">
        <button className={`shx-tab${view === 'campaigns' ? ' is-active' : ''}`} onClick={() => setView('campaigns')}>Campaigns</button>
        <button className={`shx-tab${view === 'durations' ? ' is-active' : ''}`} onClick={() => setView('durations')}>Durations & pricing</button>
      </div>
      {view === 'campaigns' ? <Campaigns /> : <Durations />}
    </AdminLayout>
  );
}

const APPROVAL_FILTERS = [{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }, { key: 'paused', label: 'Paused' }];

function Campaigns() {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (p = 1, f = filter) => {
    setStatus('loading');
    listAds({ approval: f || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(() => load(1, filter), [filter]); // eslint-disable-line

  const openDetail = async (id) => { try { setSelected(await getAd(id)); } catch (err) { showToast(err.message); } };
  const doApprove = async (id) => { setBusy(true); try { await approveAd(id); showToast('Advertisement approved'); setSelected(null); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };
  const doReject = async () => { setBusy(true); try { await rejectAd(selected.id, rejectReason); showToast('Advertisement rejected'); setSelected(null); setShowReject(false); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };
  const doPause = async (id) => { setBusy(true); try { await pauseAd(id); showToast('Advertisement paused'); setSelected(null); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };
  const doDelete = async () => { setBusy(true); try { await deleteAd(confirmDelete.id); showToast('Advertisement deleted'); setConfirmDelete(null); setSelected(null); load(page); } catch (err) { showToast(err.message); } finally { setBusy(false); } };

  return (
    <>
      <div className="shx-tabs" style={{ border: 'none', marginBottom: 12 }}>
        {APPROVAL_FILTERS.map((f) => <button key={f.key} className={`shx-tab${filter === f.key ? ' is-active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>)}
      </div>

      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorState onRetry={() => load(1)} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No advertisements found" />}

      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Title</th><th>Advertiser</th><th>Duration</th><th>Amount</th><th>Payment</th><th>Approval</th><th>Created</th></tr></thead>
              <tbody>
                {rows.map((ad) => (
                  <tr key={ad.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(ad.id)}>
                    <td style={{ fontWeight: 700 }}>{ad.title}</td>
                    <td>@{ad.user?.username}</td>
                    <td>{ad.duration_days} days</td>
                    <td>{formatNaira(ad.amount)}</td>
                    <td><StatusBadge status={ad.payment_status} /></td>
                    <td><StatusBadge status={ad.approval_status} /></td>
                    <td>{formatDate(ad.created_at)}</td>
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
          <div className="shx-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="shx-flex-between" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 16 }}>{selected.title}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            <img src={selected.image_url} alt="" style={{ width: '100%', borderRadius: 10, aspectRatio: '16/9', objectFit: 'cover', marginBottom: 16 }} />
            {selected.description && <p className="shx-text-sm shx-mt-8" style={{ marginBottom: 12 }}>{selected.description}</p>}
            <Row label="Advertiser" value={`@${selected.user?.username} (${selected.user?.email})`} />
            <Row label="Duration" value={`${selected.duration?.duration_days} days`} />
            <Row label="Payment" value={<StatusBadge status={selected.payment_status} />} />
            <Row label="Approval" value={<StatusBadge status={selected.approval_status} />} />
            {selected.payment?.paystack_reference && <Row label="Paystack ref" value={selected.payment.paystack_reference} />}

            {showReject && (
              <div className="shx-field shx-mt-16">
                <label className="shx-label">Rejection reason</label>
                <textarea className="shx-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            )}

            <div className="shx-flex shx-gap-8 shx-mt-24" style={{ flexWrap: 'wrap' }}>
              {selected.payment_status === 'paid' && selected.approval_status !== 'approved' && (
                <button className="shx-btn shx-btn--primary" disabled={busy} onClick={() => doApprove(selected.id)}><CheckIcon width={15} height={15} /> Approve</button>
              )}
              {selected.approval_status !== 'rejected' && !showReject && (
                <button className="shx-btn shx-btn--outline" onClick={() => setShowReject(true)}><XIcon width={15} height={15} /> Reject</button>
              )}
              {showReject && <button className="shx-btn shx-btn--danger" disabled={busy} onClick={doReject}>Confirm reject</button>}
              {selected.approval_status === 'approved' && (
                <button className="shx-btn shx-btn--outline" disabled={busy} onClick={() => doPause(selected.id)}>Pause</button>
              )}
              <button className="shx-btn shx-btn--danger" onClick={() => setConfirmDelete(selected)}><TrashIcon width={15} height={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title={`Delete "${confirmDelete.title}"?`} danger confirmLabel="Delete" busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />
      )}
    </>
  );
}

const emptyDuration = { duration_days: '', price: '', is_active: true };

function Durations() {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('loading');
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = () => { setStatus('loading'); listDurations().then((d) => { setRows(d); setStatus('ready'); }).catch(() => setStatus('error')); };
  useEffect(load, []);

  const save = async () => {
    setBusy(true);
    try {
      const payload = { duration_days: Number(editing.duration_days), price: Number(editing.price), is_active: editing.is_active };
      if (editing.id) await updateDuration(editing.id, payload); else await createDuration(payload);
      showToast('Saved'); setEditing(null); load();
    } catch (err) { showToast(err.message); } finally { setBusy(false); }
  };
  const doDelete = async () => { setBusy(true); try { await deleteDuration(confirmDelete.id); showToast('Deleted'); setConfirmDelete(null); load(); } catch (err) { showToast(err.message); } finally { setBusy(false); } };

  return (
    <>
      <div className="shx-toolbar"><button className="shx-btn shx-btn--primary" onClick={() => setEditing({ ...emptyDuration })}><PlusIcon width={15} height={15} /> Add duration</button></div>
      {status === 'loading' && <TableSkeleton cols={4} />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No durations configured" />}
      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Duration</th><th>Price</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>{d.duration_days} days</td>
                    <td>{formatNaira(d.price)}</td>
                    <td>{d.is_active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="shx-flex shx-gap-8">
                        <button className="shx-btn shx-btn--outline shx-btn--icon" onClick={() => setEditing(d)}><EditIcon width={14} height={14} /></button>
                        <button className="shx-btn shx-btn--danger shx-btn--icon" onClick={() => setConfirmDelete(d)}><TrashIcon width={14} height={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editing && (
        <div className="shx-modal-overlay" onClick={() => setEditing(null)}>
          <div className="shx-modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>{editing.id ? 'Edit duration' : 'New duration'}</p>
            <div className="shx-field"><label className="shx-label">Duration (days)</label><input type="number" className="shx-input" value={editing.duration_days} onChange={(e) => setEditing({ ...editing, duration_days: e.target.value })} /></div>
            <div className="shx-field"><label className="shx-label">Price (NGN)</label><input type="number" className="shx-input" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
            <label className="shx-flex shx-gap-8 shx-field"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            <button className="shx-btn shx-btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}
      {confirmDelete && <ConfirmDialog title={`Delete ${confirmDelete.duration_days}-day duration?`} danger confirmLabel="Delete" busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />}
    </>
  );
}

function Row({ label, value }) {
  return <div className="shx-flex-between shx-text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--shx-border)' }}><span className="shx-muted">{label}</span><span style={{ fontWeight: 600 }}>{value}</span></div>;
}
