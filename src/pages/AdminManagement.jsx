import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import ConfirmDialog from '../components/ConfirmDialog';
import { SearchIcon, ShieldIcon } from '../components/Icons';
import { listUsers, setAdmin } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

// The backend has no dedicated "list admins" endpoint or role system beyond
// a boolean is_admin — this page searches the real user table and lets a
// current admin grant/revoke that same boolean via PATCH /admin/users/:id/set-admin.
export default function AdminManagement() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('loading');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = (s = search) => {
    setStatus('loading');
    listUsers({ search: s || undefined, limit: 50 }).then((res) => {
      const sorted = [...res.data].sort((a, b) => (b.is_admin ? 1 : 0) - (a.is_admin ? 1 : 0));
      setRows(sorted); setStatus('ready');
    }).catch(() => setStatus('error'));
  };
  useEffect(load, []); // eslint-disable-line

  const runToggle = async () => {
    setBusy(true);
    try {
      await setAdmin(confirm.user.id, !confirm.user.is_admin);
      showToast(confirm.user.is_admin ? 'Admin access revoked' : 'Admin access granted');
      setConfirm(null);
      load();
    } catch (err) { showToast(err.message || 'Could not update admin status'); }
    finally { setBusy(false); }
  };

  return (
    <AdminLayout title="Admin Management" subtitle="Grant or revoke administrator access. The backend enforces this — not the frontend.">
      <form className="shx-toolbar" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shx-slate-500)' }} />
          <input className="shx-input" style={{ paddingLeft: 32 }} placeholder="Search by name, username or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="shx-btn shx-btn--dark" type="submit">Search</button>
      </form>

      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorState onRetry={() => load()} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No users found" />}
      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Admin</th><th></th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td>@{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.is_admin ? <span className="shx-badge shx-badge--plan">Admin</span> : '—'}</td>
                    <td>
                      <button className="shx-btn shx-btn--outline" disabled={u.id === me?.id} onClick={() => setConfirm({ user: u })}>
                        <ShieldIcon width={14} height={14} /> {u.is_admin ? 'Revoke' : 'Grant'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.user.is_admin ? `Revoke admin access from @${confirm.user.username}?` : `Grant admin access to @${confirm.user.username}?`}
          description={confirm.user.is_admin ? undefined : 'They will be able to manage users, products, payments and every other admin function.'}
          danger={confirm.user.is_admin}
          confirmLabel="Confirm"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={runToggle}
        />
      )}
    </AdminLayout>
  );
}
