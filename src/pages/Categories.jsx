import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import { useToast } from '../components/Toast';

const empty = { name: '', description: '', icon: '', is_active: true };

export default function Categories() {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('loading');
  const [editing, setEditing] = useState(null); // null=closed, {}=new, {...}=edit
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const load = () => {
    setStatus('loading');
    listCategories().then((data) => { setRows(data); setStatus('ready'); }).catch(() => setStatus('error'));
  };
  useEffect(load, []);

  const save = async () => {
    setBusy(true);
    try {
      if (editing.id) await updateCategory(editing.id, editing);
      else await createCategory(editing);
      showToast(editing.id ? 'Category updated' : 'Category created');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message || 'Could not save category');
    } finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try { await deleteCategory(confirmDelete.id); showToast('Category deleted'); setConfirmDelete(null); load(); }
    catch (err) { showToast(err.message); } finally { setBusy(false); }
  };

  return (
    <AdminLayout title="Categories" subtitle="Product categories used across search, browse and listing.">
      <div className="shx-toolbar">
        <button className="shx-btn shx-btn--primary" onClick={() => setEditing({ ...empty })}><PlusIcon width={15} height={15} /> Add category</button>
      </div>

      {status === 'loading' && <TableSkeleton cols={4} />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && rows.length === 0 && <EmptyState title="No categories yet" />}

      {status === 'ready' && rows.length > 0 && (
        <div className="shx-card">
          <div className="shx-table-wrap">
            <table className="shx-table">
              <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 18 }}>{c.icon}</td>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td className="shx-muted">{c.description}</td>
                    <td>{c.is_active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="shx-flex shx-gap-8">
                        <button className="shx-btn shx-btn--outline shx-btn--icon" onClick={() => setEditing(c)}><EditIcon width={14} height={14} /></button>
                        <button className="shx-btn shx-btn--danger shx-btn--icon" onClick={() => setConfirmDelete(c)}><TrashIcon width={14} height={14} /></button>
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
            <div className="shx-flex-between" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 15 }}>{editing.id ? 'Edit category' : 'New category'}</p>
              <button className="shx-btn shx-btn--ghost" onClick={() => setEditing(null)}><XIcon width={18} height={18} /></button>
            </div>
            <div className="shx-field"><label className="shx-label">Name</label><input className="shx-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="shx-field"><label className="shx-label">Icon (emoji)</label><input className="shx-input" value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="📱" /></div>
            <div className="shx-field"><label className="shx-label">Description</label><textarea className="shx-textarea" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            {editing.id && (
              <label className="shx-flex shx-gap-8 shx-field">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active
              </label>
            )}
            <button className="shx-btn shx-btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy || !editing.name} onClick={save}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title={`Delete "${confirmDelete.name}"?`} danger confirmLabel="Delete" busy={busy} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />
      )}
    </AdminLayout>
  );
}
