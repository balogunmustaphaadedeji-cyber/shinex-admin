import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { SearchIcon, TrashIcon, ShieldIcon, XIcon } from '../components/Icons';
import { listUsers, getUser, suspendUser, unsuspendUser, deleteUser, setAdmin } from '../api/users';
import { formatDate } from '../utils/format';
import { useToast } from '../components/Toast';

export default function Users() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (p = page) => {
    setLoadStatus('loading');
    listUsers({ search, status: status || undefined, page: p, limit: 15 }).then((res) => {
      setRows(res.data); setPagination(res.pagination); setPage(p); setLoadStatus('ready');
    }).catch(() => setLoadStatus('error'));
  };
  useEffect(() => load(1), []); // eslint-disable-line

  const openDetail = async (id) => {
    try { setSelected(await getUser(id)); } catch (err) { showToast(err.message); }
  };

  const runAction = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.user.id, confirm.reason);
      if (confirm.type === 'unsuspend') await unsuspendUser(confirm.user.id);
      if (confirm.type === 'delete') await deleteUser(confirm.user.id);
      if (confirm.type === 'grant-admin') await setAdmin(confirm.user.id, true);
      if (confirm.type === 'revoke-admin') await setAdmin(confirm.user.id, false);
      showToast('Done');
      setConfirm(null);
      setSelected(null);
      load(page);
    } catch (err) {
      showToast(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Users" subtitle="Every SHINEX account — buyers and sellers share one user table.">
      <form className="shx-toolbar" onSubmit={(e) => { e.preventDefault(); load(1); }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shx-slate-500)' }} />
          <input className="shx-input" style={{ paddingLeft: 32 }} placeholder="Search name, username, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="shx-select" style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="shx-btn shx-btn--dark" type="submit">Search</button>
      </form>

      {loadStatus === 'loading' && <TableSkeleton />}
      {loadStatus === 'error' && <ErrorState onRetry={() => load(1)} />}
      {loadStatus === 'ready' && rows.length === 0 && <EmptyState title="No users found" description="Try a different search or filter." />}

      {loadStatus === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead>
                <tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(u.id)}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td>@{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.is_admin ? <span className="shx-badge shx-badge--plan">Admin</span> : u.is_seller ? 'Seller' : 'Buyer'}</td>
                    <td><StatusBadge status={u.is_suspended ? 'suspended' : 'active'} /></td>
                    <td>{formatDate(u.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {u.is_suspended ? (
                        <button className="shx-btn shx-btn--outline shx-btn--icon" onClick={() => setConfirm({ type: 'unsuspend', user: u })} title="Unsuspend"><ShieldIcon width={15} height={15} /></button>
                      ) : (
                        <button className="shx-btn shx-btn--outline shx-btn--icon" onClick={() => setConfirm({ type: 'suspend', user: u, reason: '' })} title="Suspend"><ShieldIcon width={15} height={15} /></button>
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
          <div className="shx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shx-flex-between shx-mt-8" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 16 }}>{selected.full_name}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setSelected(null)}><XIcon width={18} height={18} /></button>
            </div>
            <DetailRow label="Username" value={`@${selected.username}`} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={selected.phone} />
            <DetailRow label="Location" value={selected.location || '—'} />
            <DetailRow label="Role" value={selected.is_admin ? 'Admin' : selected.is_seller ? 'Seller' : 'Buyer'} />
            <DetailRow label="Plan" value={selected.plan || 'starter'} />
            <DetailRow label="Joined" value={formatDate(selected.created_at)} />
            {selected.is_suspended && <DetailRow label="Suspension reason" value={selected.suspension_reason || '—'} />}
            <div className="shx-card shx-mt-16" style={{ padding: 12 }}>
              <div className="shx-flex-between shx-text-sm"><span>Products</span><b>{selected.stats?.products}</b></div>
              <div className="shx-flex-between shx-text-sm shx-mt-8"><span>Advertisements</span><b>{selected.stats?.advertisements}</b></div>
              <div className="shx-flex-between shx-text-sm shx-mt-8"><span>Reports filed</span><b>{selected.stats?.reports}</b></div>
            </div>
            <div className="shx-flex shx-gap-8 shx-mt-24" style={{ flexWrap: 'wrap' }}>
              {selected.is_suspended
                ? <button className="shx-btn shx-btn--outline" onClick={() => setConfirm({ type: 'unsuspend', user: selected })}>Unsuspend</button>
                : <button className="shx-btn shx-btn--outline" onClick={() => setConfirm({ type: 'suspend', user: selected, reason: '' })}>Suspend</button>}
              {selected.is_admin
                ? <button className="shx-btn shx-btn--outline" onClick={() => setConfirm({ type: 'revoke-admin', user: selected })}>Revoke admin</button>
                : <button className="shx-btn shx-btn--outline" onClick={() => setConfirm({ type: 'grant-admin', user: selected })}>Grant admin</button>}
              <button className="shx-btn shx-btn--danger" onClick={() => setConfirm({ type: 'delete', user: selected })}><TrashIcon width={15} height={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.type === 'delete' ? `Delete ${confirm.user.username}?` :
            confirm.type === 'suspend' ? `Suspend ${confirm.user.username}?` :
            confirm.type === 'unsuspend' ? `Unsuspend ${confirm.user.username}?` :
            confirm.type === 'grant-admin' ? `Grant admin access to ${confirm.user.username}?` :
            `Revoke admin access from ${confirm.user.username}?`
          }
          description={confirm.type === 'delete' ? 'This permanently removes the account and cannot be undone.' : undefined}
          confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Confirm'}
          danger={confirm.type === 'delete' || confirm.type === 'suspend'}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={runAction}
        />
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
